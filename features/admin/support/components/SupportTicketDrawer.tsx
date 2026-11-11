"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { X, RefreshCw, XCircle, CheckCircle2, Send, Sparkles, Mail, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatMoney, SupportGeneration } from "@/features/support/types";
import { MessageList, TicketContext } from "@/features/support/components/TicketThread";
import type { SupportTicketView } from "@/features/support/types";
import { AdminStatusPill, PopulatedUser, PriorityBadge } from "./SupportAdminPage";

interface TicketDetail {
  ticket: Omit<SupportTicketView, "userId"> & { _id: string; userId: PopulatedUser | null };
  user: {
    email: string;
    firstName?: string;
    lastName?: string;
    creditsBalance?: number;
    subscription?: { planName?: string; status?: string };
    subscriptionPlan?: string;
  } | null;
}

function getUserName(user?: { firstName?: string; lastName?: string; email?: string } | null) {
  if (!user) return "Unknown";
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || "Unknown";
}

async function fetchTicket(id: string): Promise<TicketDetail> {
  const res = await fetch(`/api/admin/support/${id}`);
  if (!res.ok) throw new Error("Failed to load ticket");
  return res.json();
}

async function post(path: string, body?: unknown) {
  const res = await fetch(path, {
    method: "POST",
    ...(body ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error || json?.message || "Action failed");
  return json?.data ?? json;
}

interface PostActionDialogProps {
  title: string;
  message: string;
  suggestedBody: string;
  onSendEmail: (body: string) => Promise<void>;
  onSkip: () => void;
}

function PostActionDialog({ title, message, suggestedBody, onSendEmail, onSkip }: PostActionDialogProps) {
  const [body, setBody] = useState(suggestedBody);
  const [sending, setSending] = useState(false);

  return (
    <Dialog open onOpenChange={(v) => !v && onSkip()}>
      <DialogContent className="p-0 sm:max-w-[480px]" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)" }}>
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-white">
            <Mail className="size-4 text-white/70" />
            {title}
          </DialogTitle>
          <p className="mt-1 text-[13px] text-white/45">{message}</p>
        </DialogHeader>
        <div className="space-y-3 px-6 py-4">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] p-3 text-[13px] text-white focus:outline-none"
          />
          <div className="flex gap-2">
            <button onClick={onSkip} className="flex-1 rounded-xl bg-white/[0.06] py-2 text-[13px] font-medium text-white/50">
              Later
            </button>
            <button
              onClick={async () => {
                setSending(true);
                await onSendEmail(body).finally(() => setSending(false));
              }}
              disabled={sending || !body.trim()}
              className="flex-1 rounded-xl bg-white py-2 text-[13px] font-semibold text-black disabled:opacity-40"
            >
              {sending ? "Sending…" : "Send & close ticket"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface SupportTicketDrawerProps {
  ticketId: string;
  onClose: () => void;
  /** Something changed (reply, refund…), refresh the list. */
  onChanged: () => void;
}

const panel = "rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4";
const label = "text-[11px] font-bold uppercase tracking-wider text-white/30";

export function SupportTicketDrawer({ ticketId, onClose, onChanged }: SupportTicketDrawerProps) {
  const queryClient = useQueryClient();
  const [replyBody, setReplyBody] = useState("");
  const [resolveWithReply, setResolveWithReply] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [postAction, setPostAction] = useState<{ type: "refund" | "cancel"; amount?: string } | null>(null);
  const [confirming, setConfirming] = useState<"refund" | "cancel" | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-support-detail", ticketId],
    queryFn: () => fetchTicket(ticketId),
  });

  const ticket = data?.ticket;
  const user = data?.user;
  const isOpen = ticket && ticket.status !== "resolved";

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-support-detail", ticketId] });
    onChanged();
  };

  const run = async (key: string, fn: () => Promise<unknown>) => {
    setActionLoading(key);
    setActionError("");
    try {
      return await fn();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Action failed");
      return null;
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefund = async () => {
    setConfirming(null);
    const result = (await run("refund", () => post(`/api/admin/support/${ticketId}/refund`))) as
      | { amount: number; currency: string }
      | null;
    if (result) {
      setPostAction({ type: "refund", amount: formatMoney(result.amount, result.currency) });
      refresh();
    }
  };

  const handleCancelSub = async () => {
    setConfirming(null);
    const result = await run("cancel", () => post(`/api/admin/support/${ticketId}/cancel-subscription`));
    if (result) {
      setPostAction({ type: "cancel" });
      refresh();
    }
  };

  const handleResolve = async () => {
    const result = await run("resolve", () => post(`/api/admin/support/${ticketId}/resolve`));
    if (result) refresh();
  };

  const handleRefundCredits = async (g: SupportGeneration) => {
    const result = await run(`credits-${g.jobId}`, () =>
      post(`/api/admin/support/${ticketId}/refund-credits`, { jobId: g.jobId }),
    );
    if (result) refresh();
  };

  const handleGenerateAi = async () => {
    setIsGenerating(true);
    try {
      const json = await post(`/api/admin/support/${ticketId}/ai-reply`);
      if (json?.draft) setReplyBody(json.draft);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "AI draft failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const sendReply = async (body: string, resolve: boolean) => {
    await post(`/api/admin/support/${ticketId}/reply`, { body, resolve });
    refresh();
  };

  const handleSendReply = async () => {
    if (!replyBody.trim()) return;
    setIsSendingReply(true);
    setActionError("");
    try {
      await sendReply(replyBody.trim(), resolveWithReply);
      setReplyBody("");
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Couldn't send the reply");
    } finally {
      setIsSendingReply(false);
    }
  };

  const invoiceAmount = ticket?.invoice ? formatMoney(ticket.invoice.amount, ticket.invoice.currency) : null;
  const invoiceRefunded = !!ticket?.invoice?.refundedAt || (ticket?.invoice && ticket.invoice.amountRefunded >= ticket.invoice.amount);
  const userName = getUserName(ticket?.userId);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed top-0 right-0 bottom-0 z-50 flex w-full max-w-[560px] flex-col overflow-y-auto border-l border-white/[0.08] bg-[#0f0f0f]">
        {/* Header */}
        <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-white/[0.07] bg-[#0f0f0f] px-6 py-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[15px] font-bold text-white">
              {ticket ? ticket.supportCode : "Support Ticket"}
              {ticket && <PriorityBadge priority={ticket.priority} />}
              {ticket && <AdminStatusPill status={ticket.status} />}
            </p>
            <p className="truncate text-[12px] text-white/35">{ticket ? ticket.categoryLabel : "Loading…"}</p>
          </div>
          <button onClick={onClose} className="flex size-8 items-center justify-center rounded-lg bg-white/[0.06]">
            <X className="size-4 text-white" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-white/50" />
          </div>
        ) : error || !ticket ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-[13px] text-white/40">Failed to load ticket</p>
          </div>
        ) : (
          <div className="flex-1 space-y-4 px-6 py-5">
            {/* User card */}
            <div className={`${panel} space-y-3`}>
              <p className={label}>User</p>
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/[0.1] text-[15px] font-bold text-white">
                  {(userName[0] ?? "?").toUpperCase()}
                </div>
                <div className="min-w-0">
                  <Link
                    href={`/admin/users/${ticket.userId?._id}`}
                    onClick={onClose}
                    className="block truncate text-[14px] font-semibold text-white hover:underline"
                  >
                    {userName}
                  </Link>
                  <p className="truncate text-[12px] text-white/40">{ticket.userId?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-white/[0.04] p-2.5">
                  <p className="mb-0.5 text-[10px] font-bold tracking-wider text-white/30 uppercase">Plan</p>
                  <p className="text-[13px] font-semibold text-white">
                    {user?.subscription?.planName ?? user?.subscriptionPlan ?? "Free"}
                  </p>
                </div>
                <div className="rounded-xl bg-white/[0.04] p-2.5">
                  <p className="mb-0.5 text-[10px] font-bold tracking-wider text-white/30 uppercase">Credits</p>
                  <p className="text-[13px] font-semibold text-white">{user?.creditsBalance ?? "—"}</p>
                </div>
              </div>
            </div>

            {/* What it's about */}
            {(ticket.invoice || ticket.generations?.length > 0) && (
              <div className={`${panel} space-y-3`}>
                <p className={label}>About</p>
                <TicketContext
                  topic={ticket.topic}
                  invoice={ticket.invoice}
                  generations={ticket.generations}
                  renderGenerationAction={(g) =>
                    g.refundedAt ? (
                      <span className="shrink-0 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                        {g.refundedCredits ? `+${g.refundedCredits} refunded` : "Refunded"}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRefundCredits(g)}
                        disabled={!!actionLoading}
                        className="flex shrink-0 items-center gap-1 rounded-lg border border-white/15 px-2.5 py-1 text-[11px] font-semibold text-white/80 hover:bg-white/5 disabled:opacity-40"
                      >
                        {actionLoading === `credits-${g.jobId}` && <Loader2 className="size-3 animate-spin" />}
                        Refund{g.credits ? ` ${g.credits}` : ""} credits
                      </button>
                    )
                  }
                />
              </div>
            )}

            {/* Conversation */}
            <div className={`${panel} space-y-3`}>
              <p className={label}>Conversation</p>
              <MessageList messages={ticket.messages} viewer="admin" />
            </div>

            {actionError && (
              <p className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-[12px] text-red-300">{actionError}</p>
            )}

            {/* Quick actions */}
            {isOpen && (
              <div className={`${panel} space-y-3`}>
                <p className={label}>Quick actions</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setConfirming("refund")}
                    disabled={!!actionLoading || !!invoiceRefunded}
                    className="flex flex-col items-center gap-1.5 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-[12px] font-semibold text-emerald-300 disabled:opacity-40"
                  >
                    <RefreshCw className={`size-4 ${actionLoading === "refund" ? "animate-spin" : ""}`} />
                    {invoiceRefunded ? "Refunded" : invoiceAmount ? `Refund ${invoiceAmount}` : "Refund latest"}
                  </button>
                  <button
                    onClick={() => setConfirming("cancel")}
                    disabled={!!actionLoading}
                    className="flex flex-col items-center gap-1.5 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-[12px] font-semibold text-red-300 disabled:opacity-40"
                  >
                    <XCircle className={`size-4 ${actionLoading === "cancel" ? "animate-spin" : ""}`} />
                    Cancel sub
                  </button>
                  <button
                    onClick={handleResolve}
                    disabled={!!actionLoading}
                    className="flex flex-col items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.06] p-3 text-[12px] font-semibold text-white/80 disabled:opacity-40"
                  >
                    <CheckCircle2 className={`size-4 ${actionLoading === "resolve" ? "animate-spin" : ""}`} />
                    Resolve
                  </button>
                </div>
                {confirming && (
                  <div className="flex items-center justify-between gap-2 rounded-xl bg-white/[0.05] p-3 text-[12px] text-white/70">
                    <span>
                      {confirming === "refund"
                        ? `Refund ${invoiceAmount ?? "the latest invoice"} in Stripe?`
                        : "Cancel the subscription at the end of the period?"}
                    </span>
                    <span className="flex shrink-0 gap-2">
                      <button onClick={() => setConfirming(null)} className="rounded-lg px-2.5 py-1 text-white/50 hover:text-white">
                        No
                      </button>
                      <button
                        onClick={confirming === "refund" ? handleRefund : handleCancelSub}
                        className="rounded-lg bg-white px-2.5 py-1 font-semibold text-black"
                      >
                        Yes
                      </button>
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Reply */}
            <div className={`${panel} space-y-3`}>
              <div className="flex items-center justify-between">
                <p className={label}>Reply</p>
                <button
                  onClick={handleGenerateAi}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.05] px-3 py-1 text-[12px] font-medium text-white/75 disabled:opacity-40"
                >
                  <Sparkles className="size-3" />
                  {isGenerating ? "Generating…" : "Draft with AI"}
                </button>
              </div>
              <textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                rows={5}
                placeholder="Write a reply to the user…"
                className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.04] p-3 text-[13px] text-white focus:outline-none"
              />
              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-[12px] text-white/55">
                  <input
                    type="checkbox"
                    checked={resolveWithReply}
                    onChange={(e) => setResolveWithReply(e.target.checked)}
                    className="accent-white"
                  />
                  Close ticket after replying
                </label>
                <button
                  onClick={handleSendReply}
                  disabled={!replyBody.trim() || isSendingReply}
                  className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-[13px] font-semibold text-black disabled:opacity-40"
                >
                  <Send className="size-3.5" />
                  {isSendingReply ? "Sending…" : "Send reply"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {postAction && ticket && (
        <PostActionDialog
          title={postAction.type === "refund" ? "Send refund confirmation?" : "Send cancellation email?"}
          message={`Let ${userName} know what you did. This is added to the ticket and emailed.`}
          suggestedBody={
            postAction.type === "refund"
              ? `Hi ${userName},\n\nWe've refunded ${postAction.amount ?? "your payment"}${ticket.invoice ? ` for your ${ticket.invoice.name}` : ""}. It should appear on your statement within 5-10 business days.\n\nIf you have any further questions, just reply here.\n\nBest,\nSMPL Support`
              : `Hi ${userName},\n\nYour subscription has been cancelled. You'll keep access until the end of your current billing period.\n\nIf you have any further questions, just reply here.\n\nBest,\nSMPL Support`
          }
          onSendEmail={async (body) => {
            await sendReply(body, true);
            setPostAction(null);
          }}
          onSkip={() => setPostAction(null)}
        />
      )}
    </>
  );
}
