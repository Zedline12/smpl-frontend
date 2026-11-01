"use client";

import React, { useEffect, useRef, useState } from "react";
import { Brain, Database, MessageSquarePlus, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Composer } from "@/features/chat/components/Composer";
import { MarkdownMessage } from "@/features/chat/components/MarkdownMessage";
import { TypingIndicator } from "@/features/chat/components/TypingIndicator";
import { StructuredDataModal } from "./StructuredDataModal";
import { BrainConversation, BrainMessageItem, StructuredDataPayload } from "../types";

function temporaryId() {
  return `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function sendBrainMessage(
  message: string,
  conversationId?: string,
): Promise<{
  conversationId: string;
  message: { id: string; role: string; content: string; createdAt: string };
  structuredData?: StructuredDataPayload;
}> {
  const res = await fetch("/api/admin/brain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, conversationId }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.error || "Failed to send message");
  }
  return res.json();
}

async function fetchConversations(): Promise<{ data: BrainConversation[]; total: number }> {
  const res = await fetch("/api/admin/brain/conversations");
  if (!res.ok) throw new Error("Failed to fetch conversations");
  return res.json();
}

async function fetchMessages(conversationId: string): Promise<BrainMessageItem[]> {
  const res = await fetch(`/api/admin/brain/conversations/${conversationId}/messages`);
  if (!res.ok) throw new Error("Failed to fetch messages");
  const data = await res.json();
  return Array.isArray(data) ? data : data?.data ?? [];
}

async function deleteConversation(id: string): Promise<void> {
  const res = await fetch(`/api/admin/brain/conversations/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete");
}

function groupByDate(convs: BrainConversation[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: { label: string; items: BrainConversation[] }[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "Older", items: [] },
  ];

  for (const c of convs) {
    const d = new Date(c.lastMessageAt);
    d.setHours(0, 0, 0, 0);
    if (d >= today) groups[0].items.push(c);
    else if (d >= yesterday) groups[1].items.push(c);
    else groups[2].items.push(c);
  }

  return groups.filter((g) => g.items.length > 0);
}

export function BrainPage() {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<BrainMessageItem[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [modalData, setModalData] = useState<StructuredDataPayload | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loadingConvId, setLoadingConvId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: conversationsData } = useQuery({
    queryKey: ["brain-conversations"],
    queryFn: fetchConversations,
    staleTime: 30_000,
  });

  const conversations = conversationsData?.data ?? [];

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setDraft("");
  };

  const handleLoadConversation = async (conv: BrainConversation) => {
    if (conv.id === activeConversationId) return;
    setLoadingConvId(conv.id);
    try {
      const msgs = await fetchMessages(conv.id);
      setMessages(
        msgs.map((m) => ({
          id: m.id ?? temporaryId(),
          role: m.role,
          content: m.content,
          structuredData: m.structuredData,
          createdAt: m.createdAt,
        })),
      );
      setActiveConversationId(conv.id);
    } catch {
      // keep current view on error
    } finally {
      setLoadingConvId(null);
    }
  };

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteConversation(id);
      queryClient.invalidateQueries({ queryKey: ["brain-conversations"] });
      if (id === activeConversationId) handleNewChat();
    } catch {
      // silent
    }
  };

  const handleSubmit = async () => {
    const message = draft.trim();
    if (!message || isSending) return;

    const optimistic: BrainMessageItem = {
      id: temporaryId(),
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
    };

    setDraft("");
    setMessages((prev) => [...prev, optimistic]);
    setIsSending(true);

    try {
      const response = await sendBrainMessage(message, activeConversationId ?? undefined);

      if (!activeConversationId) {
        setActiveConversationId(response.conversationId);
        queryClient.invalidateQueries({ queryKey: ["brain-conversations"] });
      }

      const assistantMsg: BrainMessageItem = {
        id: response.message.id || temporaryId(),
        role: "assistant",
        content: response.message.content,
        structuredData: response.structuredData,
        createdAt: response.message.createdAt || new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Refresh conversation list to update lastMessageAt
      queryClient.invalidateQueries({ queryKey: ["brain-conversations"] });
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setDraft(message);
    } finally {
      setIsSending(false);
    }
  };

  const groups = groupByDate(conversations);

  return (
    <div className="flex h-full" style={{ background: "#0c0c0c" }}>
      {/* Left sidebar — conversation list */}
      <div
        className="flex w-64 shrink-0 flex-col border-r"
        style={{ borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            <MessageSquarePlus className="h-4 w-4" style={{ color: "#9370ff" }} />
            New chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {groups.length === 0 && (
            <p className="px-3 py-4 text-center text-[12px]" style={{ color: "rgba(255,255,255,0.25)" }}>
              No conversations yet
            </p>
          )}
          {groups.map((group) => (
            <div key={group.label} className="mb-2">
              <p
                className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                {group.label}
              </p>
              {group.items.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleLoadConversation(conv)}
                  className="group relative flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors"
                  style={{
                    background:
                      conv.id === activeConversationId
                        ? "rgba(107,65,255,0.15)"
                        : "transparent",
                    border:
                      conv.id === activeConversationId
                        ? "1px solid rgba(107,65,255,0.3)"
                        : "1px solid transparent",
                  }}
                >
                  {loadingConvId === conv.id ? (
                    <span
                      className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full"
                      style={{ background: "#9370ff" }}
                    />
                  ) : (
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{
                        background:
                          conv.id === activeConversationId
                            ? "#9370ff"
                            : "rgba(255,255,255,0.2)",
                      }}
                    />
                  )}
                  <span
                    className="flex-1 truncate text-[12.5px]"
                    style={{
                      color:
                        conv.id === activeConversationId
                          ? "rgba(255,255,255,0.9)"
                          : "rgba(255,255,255,0.55)",
                    }}
                  >
                    {conv.title}
                  </span>
                  <button
                    onClick={(e) => handleDeleteConversation(e, conv.id)}
                    className="ml-1 shrink-0 rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white/10"
                  >
                    <Trash2 className="h-3 w-3" style={{ color: "rgba(255,255,255,0.4)" }} />
                  </button>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Right — chat area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <div
          className="flex flex-shrink-0 items-center gap-3 px-6 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{ background: "linear-gradient(135deg, #6b41ff 0%, #ea4bff 100%)" }}
          >
            <Brain className="text-white" style={{ width: "18px", height: "18px" }} />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-white">Smpl Brain</h1>
            <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.35)" }}>
              Admin AI Assistant — full data access
            </p>
          </div>
        </div>

        {/* Message thread */}
        <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {messages.length === 0 && !isSending && (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-20 text-center">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(107,65,255,0.15) 0%, rgba(234,75,255,0.1) 100%)",
                  border: "1px solid rgba(107,65,255,0.2)",
                }}
              >
                <Brain className="h-7 w-7" style={{ color: "#9370ff" }} />
              </div>
              <div>
                <p className="mb-1 text-[15px] font-semibold text-white">
                  Ask anything about your platform
                </p>
                <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Query users, subscriptions, generations, and more.
                </p>
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {[
                  "Users with 0 credits used",
                  "Active subscriptions this month",
                  "Most used AI models",
                  "Recent failed generations",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setDraft(suggestion)}
                    className="rounded-full px-3 py-1.5 text-[12px] transition-colors"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.6)",
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "linear-gradient(135deg, #6b41ff 0%, #ea4bff 100%)" }}
                >
                  <Brain className="text-white" style={{ width: "13px", height: "13px" }} />
                </div>
              )}

              <div
                className={`flex max-w-[75%] flex-col gap-1.5 ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className="rounded-2xl px-4 py-3 text-[13px] leading-relaxed"
                  style={
                    msg.role === "user"
                      ? {
                          background: "rgba(107,65,255,0.18)",
                          border: "1px solid rgba(107,65,255,0.25)",
                          color: "rgba(255,255,255,0.9)",
                          borderBottomRightRadius: "6px",
                        }
                      : {
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "rgba(255,255,255,0.85)",
                          borderBottomLeftRadius: "6px",
                        }
                  }
                >
                  {msg.role === "assistant" ? (
                    <MarkdownMessage content={msg.content} />
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>

                {msg.structuredData && (
                  <button
                    onClick={() => setModalData(msg.structuredData!)}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors"
                    style={{
                      background: "rgba(107,65,255,0.12)",
                      border: "1px solid rgba(107,65,255,0.25)",
                      color: "#9370ff",
                    }}
                  >
                    <Database className="h-3.5 w-3.5" />
                    View data ({msg.structuredData.count ?? msg.structuredData.items.length} items)
                  </button>
                )}
              </div>

              {msg.role === "user" && (
                <div
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #6b41ff 0%, #ea4bff 100%)" }}
                >
                  A
                </div>
              )}
            </div>
          ))}

          {isSending && (
            <div className="flex justify-start">
              <TypingIndicator />
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Composer */}
        <div className="shrink-0">
          <Composer
            value={draft}
            onChange={setDraft}
            onSubmit={handleSubmit}
            isSending={isSending}
          />
        </div>
      </div>

      {/* Structured data modal */}
      {modalData && (
        <StructuredDataModal data={modalData} onClose={() => setModalData(null)} />
      )}
    </div>
  );
}
