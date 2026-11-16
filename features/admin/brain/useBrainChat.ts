"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchMessages, streamBrain } from "./api";
import type { BrainEvent, BrainMessageItem, ToolStep } from "./types";

export type ChatMessage = BrainMessageItem & {
  /** Assistant only: how this answer is going. */
  status?: "streaming" | "done" | "error" | "stopped";
  steps?: ToolStep[];
  /** While streaming: the tool behind each block, so blocks follow the order of the calls. */
  blockTools?: (string | null)[];
  error?: string;
};

/** Inserts a block after the blocks of tools called before (or with) its own tool. */
function placeBlock(m: ChatMessage, block: NonNullable<ChatMessage["blocks"]>[number], toolId?: string): ChatMessage {
  const blocks = [...(m.blocks ?? [])];
  const tools = [...(m.blockTools ?? blocks.map(() => null))];
  const order = (id: string | null | undefined) => {
    const i = (m.steps ?? []).findIndex((s) => s.id === id);
    return i < 0 ? Number.MAX_SAFE_INTEGER : i;
  };
  const mine = order(toolId);
  let at = blocks.length;
  for (let i = 0; i < blocks.length; i++) {
    if (order(tools[i]) > mine) {
      at = i;
      break;
    }
  }
  blocks.splice(at, 0, block);
  tools.splice(at, 0, toolId ?? null);
  return { ...m, blocks, blockTools: tools };
}

const tempId = () => `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`;

/**
 * One Brain conversation in the browser: loads it, streams new answers (tool steps,
 * blocks and text as they arrive), stops, and retries. Events from a turn that was
 * stopped or left (another conversation opened) are ignored.
 */
export function useBrainChat(opts: { onConversation: (id: string, title: string) => void; onSettled: () => void }) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const turn = useRef(0);
  const convRef = useRef<string | null>(null);
  const optsRef = useRef(opts);
  const messagesRef = useRef<ChatMessage[]>([]);
  useEffect(() => {
    optsRef.current = opts;
    messagesRef.current = messages;
  });

  useEffect(() => () => abort.current?.abort(), []);

  const patch = (id: string, fn: (m: ChatMessage) => ChatMessage) =>
    setMessages((list) => list.map((m) => (m.id === id ? fn(m) : m)));

  const open = useCallback(async (id: string | null) => {
    abort.current?.abort();
    const myTurn = ++turn.current;
    setBusy(false);
    setLoadError(null);
    convRef.current = id;
    setConversationId(id);
    if (!id) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setMessages([]);
    try {
      const list = await fetchMessages(id);
      if (turn.current !== myTurn) return;
      setMessages(list.map((m) => ({ ...m, status: m.role === "assistant" ? "done" : undefined })));
    } catch (err) {
      if (turn.current === myTurn) setLoadError((err as Error).message);
    } finally {
      if (turn.current === myTurn) setLoading(false);
    }
  }, []);

  const send = useCallback(async (text: string) => {
    const message = text.trim();
    if (!message) return;
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    const myTurn = ++turn.current;
    const userId = tempId();
    const botId = tempId();
    const now = new Date().toISOString();
    setMessages((list) => [
      ...list,
      { id: userId, role: "user", content: message, createdAt: now },
      { id: botId, role: "assistant", content: "", createdAt: now, status: "streaming", steps: [], blocks: [] },
    ]);
    setBusy(true);

    let finished = false;
    const onEvent = (e: BrainEvent) => {
      if (turn.current !== myTurn) return;
      switch (e.type) {
        case "conversation":
          if (convRef.current !== e.conversationId) {
            convRef.current = e.conversationId;
            setConversationId(e.conversationId);
            optsRef.current.onConversation(e.conversationId, e.title);
          }
          break;
        case "tool_start":
          patch(botId, (m) => ({ ...m, steps: [...(m.steps ?? []), { id: e.id, name: e.name, label: e.label, args: e.args, status: "running" }] }));
          break;
        case "tool_end":
          patch(botId, (m) => ({
            ...m,
            steps: (m.steps ?? []).map((s) => (s.id === e.id ? { ...s, status: e.ok ? "ok" : "error", ms: e.ms, error: e.error } : s)),
          }));
          break;
        case "block":
          patch(botId, (m) => placeBlock(m, e.block, e.toolId));
          break;
        case "text_delta":
          patch(botId, (m) => ({ ...m, content: m.content + e.delta }));
          break;
        case "done":
          finished = true;
          patch(botId, (m) => ({
            ...m,
            id: e.messageId || m.id,
            content: e.content,
            blocks: e.blocks,
            blockTools: undefined,
            toolCalls: e.toolCalls,
            usage: e.usage,
            model: e.model,
            status: "done",
          }));
          break;
        case "error":
          finished = true;
          patch(botId, (m) => ({ ...m, status: "error", error: e.message }));
          break;
      }
    };

    try {
      await streamBrain({ message, conversationId: convRef.current ?? undefined }, onEvent, controller.signal);
      if (!finished && turn.current === myTurn) {
        patch(botId, (m) => ({ ...m, status: "error", error: "The connection ended before Brain finished. Try again." }));
      }
    } catch (err) {
      if (turn.current !== myTurn) return;
      if ((err as Error).name === "AbortError") {
        patch(botId, (m) => ({ ...m, status: "stopped", steps: (m.steps ?? []).map((s) => (s.status === "running" ? { ...s, status: "error", error: "Stopped" } : s)) }));
      } else {
        patch(botId, (m) => ({ ...m, status: "error", error: (err as Error).message }));
      }
    } finally {
      if (turn.current === myTurn) {
        setBusy(false);
        abort.current = null;
        optsRef.current.onSettled();
      }
    }
  }, []);

  const stop = useCallback(() => {
    abort.current?.abort();
  }, []);

  /** Re-asks the question behind a failed or stopped answer (the failed pair is removed). */
  const retry = useCallback(
    (assistantId: string) => {
      const list = messagesRef.current;
      const i = list.findIndex((m) => m.id === assistantId);
      if (i < 1 || list[i - 1].role !== "user") return;
      const question = list[i - 1].content;
      const pair = new Set([list[i - 1].id, assistantId]);
      setMessages((current) => current.filter((m) => !pair.has(m.id)));
      void send(question);
    },
    [send],
  );

  /** The conversation this chat is on right now (ahead of React state during a stream). */
  const current = useCallback(() => convRef.current, []);

  return { conversationId, current, messages, loading, loadError, busy, open, send, stop, retry, setMessages };
}
