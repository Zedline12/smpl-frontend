"use client";

import { useState } from "react";
import { ExternalLink, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, formatMoney, SupportAttachment, SupportGeneration, SupportInvoice, SupportMessage } from "../types";

/** Thumbnails that open full size. */
export function AttachmentGrid({ attachments }: { attachments: SupportAttachment[] }) {
  const [open, setOpen] = useState<string | null>(null);
  if (!attachments?.length) return null;
  return (
    <>
      <div className="mt-2 flex flex-wrap gap-2">
        {attachments.map((a) => (
          <button
            key={a.key}
            type="button"
            onClick={() => setOpen(a.url)}
            className="size-16 overflow-hidden rounded-lg border border-white/10 hover:border-white/40"
          >
            <img src={a.url} alt="Screenshot" className="size-full object-cover" />
          </button>
        ))}
      </div>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-6"
          onClick={() => setOpen(null)}
        >
          <img src={open} alt="Screenshot" className="max-h-full max-w-full rounded-lg object-contain" />
          <button
            className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
          <a
            href={open}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute right-4 bottom-4 flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-[12px] text-white hover:bg-white/20"
          >
            Open original <ExternalLink className="size-3" />
          </a>
        </div>
      )}
    </>
  );
}

/** What the ticket points at: an invoice and/or generations. */
export function TicketContext({
  topic,
  invoice,
  generations,
  renderGenerationAction,
}: {
  topic: string | null;
  invoice: SupportInvoice | null;
  generations: SupportGeneration[];
  renderGenerationAction?: (g: SupportGeneration) => React.ReactNode;
}) {
  if (!invoice && !generations?.length) return null;
  return (
    <div className="space-y-2">
      {invoice && (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold tracking-wider text-white/35 uppercase">
              {topic === "refund" ? "Refund requested" : topic === "cancel" ? "Cancellation requested" : "Payment"}
            </span>
            {invoice.hostedInvoiceUrl && (
              <a
                href={invoice.hostedInvoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] text-white/45 hover:text-white"
              >
                Invoice <ExternalLink className="size-3" />
              </a>
            )}
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[13px] font-semibold text-white">{invoice.name}</span>
            <span className="text-[13px] font-semibold text-white">{formatMoney(invoice.amount, invoice.currency)}</span>
          </div>
          <p className="mt-0.5 text-[11px] text-white/40">
            Paid {formatDate(invoice.paidAt)}
            {invoice.providerInvoiceId ? ` · ${invoice.providerInvoiceId}` : ""}
            {invoice.refundedAt
              ? ` · Refunded ${formatDate(invoice.refundedAt)}`
              : invoice.amountRefunded > 0
                ? ` · ${formatMoney(invoice.amountRefunded, invoice.currency)} refunded`
                : ""}
          </p>
        </div>
      )}
      {generations?.map((g) => (
        <div key={g.jobId} className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
          <Sparkles className="size-4 shrink-0 text-white/40" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] text-white">{g.prompt || "(no prompt)"}</p>
            <p className="truncate text-[11px] text-white/40">
              {g.model} · {g.status === "failure" ? "Failed" : g.status} · {formatDate(g.createdAt)}
              {g.credits ? ` · ${g.credits} credits` : ""}
              {g.failedMessage ? ` · ${g.failedMessage}` : ""}
            </p>
          </div>
          {renderGenerationAction?.(g)}
        </div>
      ))}
    </div>
  );
}

/** The conversation, oldest first. */
export function MessageList({ messages, viewer }: { messages: SupportMessage[]; viewer: "user" | "admin" }) {
  return (
    <div className="space-y-3">
      {messages.map((m, i) => {
        const mine = m.from === viewer;
        return (
          <div key={i} className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
            <div
              className={cn(
                "max-w-[88%] rounded-2xl px-3.5 py-2.5",
                mine ? "rounded-br-md bg-white/[0.1]" : "rounded-bl-md border border-white/[0.08] bg-white/[0.03]",
              )}
            >
              <p className="mb-0.5 text-[10px] font-bold tracking-wider text-white/35 uppercase">
                {m.from === "admin" ? "SMPL Support" : viewer === "user" ? "You" : "User"}
              </p>
              {m.body ? (
                <p className="text-[13px] leading-relaxed whitespace-pre-wrap text-white/85">{m.body}</p>
              ) : (
                <p className="text-[13px] text-white/35 italic">No message</p>
              )}
              <AttachmentGrid attachments={m.attachments} />
            </div>
            <span className="mt-1 px-1 text-[10px] text-white/30">{new Date(m.createdAt).toLocaleString()}</span>
          </div>
        );
      })}
    </div>
  );
}
