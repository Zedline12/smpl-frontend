"use client";

import { useState } from "react";
import { AlertCircle, Brain, Check, Copy, Pencil, RotateCcw } from "lucide-react";
import { MarkdownMessage } from "@/features/chat/components/MarkdownMessage";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "../useBrainChat";
import { BlockView, legacyTable } from "./blocks/BlockView";
import { ToolSteps } from "./ToolSteps";

const time = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
};

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center rounded-md text-white/35 transition-colors hover:bg-white/[0.06] hover:text-white/80"
    >
      {children}
    </button>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <IconButton
      label={copied ? "Copied" : "Copy"}
      onClick={() => {
        void navigator.clipboard?.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
    </IconButton>
  );
}

export function UserMessage({ message, onEdit }: { message: ChatMessage; onEdit?: () => void }) {
  return (
    <div data-user-msg className="group flex justify-end">
      <div className="flex max-w-[85%] flex-col items-end gap-1 md:max-w-[70%]">
        <div className="rounded-2xl rounded-br-md border border-[#6b41ff]/25 bg-[#6b41ff]/[0.16] px-4 py-2.5 text-[14px] leading-relaxed text-white/90">
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <span className="mr-1 text-[11px] text-white/30">{time(message.createdAt)}</span>
          <CopyButton text={message.content} />
          {onEdit && (
            <IconButton label="Edit and ask again" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5" />
            </IconButton>
          )}
        </div>
      </div>
    </div>
  );
}

export function AssistantMessage({
  message,
  onRetry,
  onAskAgain,
}: {
  message: ChatMessage;
  onRetry?: () => void;
  onAskAgain?: () => void;
}) {
  const streaming = message.status === "streaming";
  const blocks = message.blocks ?? [];
  const legacy = !blocks.length && message.structuredData ? legacyTable(message.structuredData) : null;
  const working = streaming && (message.steps ?? []).some((s) => s.status === "running");
  const thinking = streaming && !message.content && !blocks.length && !(message.steps ?? []).length;

  return (
    <div className="group flex gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: "linear-gradient(135deg, #6b41ff 0%, #ea4bff 100%)" }}>
        <Brain className="h-3.5 w-3.5 text-white" />
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        <ToolSteps steps={message.steps} saved={message.toolCalls} live={streaming && (working || (!message.content && !!message.steps?.length))} />

        {thinking && (
          <div className="flex h-7 items-center gap-1" aria-label="Brain is thinking">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40" style={{ animationDelay: `${i * 120}ms` }} />
            ))}
          </div>
        )}

        {message.content && (
          <div className="max-w-3xl text-[14px] leading-relaxed text-white/85 [&_a]:text-[#b9a4ff] [&_a]:underline">
            <MarkdownMessage content={message.content} />
            {streaming && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-[3px] animate-pulse bg-white/60" />}
          </div>
        )}

        {(blocks.length > 0 || legacy) && (
          <div className="space-y-3">
            {blocks.map((b, i) => (
              <BlockView key={b.type === "action" ? b.actionId : i} block={b} />
            ))}
            {legacy && <BlockView block={legacy} />}
          </div>
        )}

        {message.status === "error" && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/[0.05] px-3.5 py-2.5 text-[13px] text-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="min-w-0 flex-1">{message.error || "Something went wrong."}</span>
            {onRetry && (
              <button type="button" onClick={onRetry} className="flex items-center gap-1 rounded-lg border border-red-300/25 px-2.5 py-1 text-[12px] font-semibold hover:bg-red-300/10">
                <RotateCcw className="h-3.5 w-3.5" /> Retry
              </button>
            )}
          </div>
        )}
        {message.status === "stopped" && (
          <p className="flex items-center gap-2 text-[12px] text-white/40">
            Stopped.
            {onRetry && (
              <button type="button" onClick={onRetry} className="font-semibold text-white/60 hover:text-white">
                Ask again
              </button>
            )}
          </p>
        )}

        {message.status === "done" && (
          <div className={cn("flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100")}>
            <span className="mr-1 text-[11px] text-white/30">{time(message.createdAt)}</span>
            {message.content && <CopyButton text={message.content} />}
            {onAskAgain && (
              <IconButton label="Ask again" onClick={onAskAgain}>
                <RotateCcw className="h-3.5 w-3.5" />
              </IconButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
