"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { X, RefreshCw, XCircle, CheckCircle2, Send, Sparkles, AlertTriangle, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PopulatedUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string;
}

interface TicketDetail {
  ticket: {
    _id: string;
    userId: PopulatedUser;
    categoryId: { _id: string; slug: string; label: string };
    body: string;
    supportCode: string;
    status: string;
    adminReply?: string;
    createdAt: string;
  };
  user: {
    email: string;
    firstName?: string;
    lastName?: string;
    creditsBalance?: number;
    subscription?: { planName?: string; status?: string };
  };
}

function getUserName(user?: PopulatedUser | { firstName?: string; lastName?: string; email?: string }) {
  if (!user) return "Unknown";
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || "Unknown";
}

async function fetchTicket(id: string): Promise<TicketDetail> {
  const res = await fetch(`/api/admin/support/${id}`);
  if (!res.ok) throw new Error("Failed to load ticket");
  return res.json();
}

interface PostActionDialogProps {
  open: boolean;
  title: string;
  message: string;
  suggestedBody: string;
  onSendEmail: (body: string) => void;
  onSkip: () => void;
}

function PostActionDialog({ open, title, message, suggestedBody, onSendEmail, onSkip }: PostActionDialogProps) {
  const [body, setBody] = useState(suggestedBody);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSending(true);
    await onSendEmail(body);
    setSending(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onSkip()}>
      <DialogContent className="sm:max-w-[480px] p-0" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)" }}>
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-white text-base font-bold flex items-center gap-2">
            <Mail className="w-4 h-4" style={{ color: "#9370ff" }} />
            {title}
          </DialogTitle>
          <p className="text-[13px] mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>{message}</p>
        </DialogHeader>
        <div className="px-6 py-4 space-y-3">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="w-full rounded-xl text-[13px] text-white resize-none p-3 focus:outline-none"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
          />
          <div className="flex gap-2">
            <button
              onClick={onSkip}
              className="flex-1 py-2 rounded-xl text-[13px] font-medium"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}
            >
              Later
            </button>
            <button
              onClick={handleSend}
              disabled={sending || !body.trim()}
              className="flex-1 py-2 rounded-xl text-[13px] font-semibold text-white disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #6b41ff 0%, #ea4bff 100%)" }}
            >
              {sending ? "Sending…" : "Send Email"}
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
  onAction: () => void;
}

export function SupportTicketDrawer({ ticketId, onClose, onAction }: SupportTicketDrawerProps) {
  const [replyBody, setReplyBody] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [postAction, setPostAction] = useState<{ type: "refund" | "cancel" } | null>(null);
  const [postActionError, setPostActionError] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-support-detail", ticketId],
    queryFn: () => fetchTicket(ticketId),
  });

  const ticket = data?.ticket;
  const user = data?.user;

  const doAction = async (endpoint: string, key: string) => {
    setActionLoading(key);
    try {
      const res = await fetch(`/api/admin/support/${ticketId}/${endpoint}`, { method: "POST" });
      if (!res.ok) throw new Error("Action failed");
      return true;
    } catch {
      return false;
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefund = async () => {
    const ok = await doAction("refund", "refund");
    if (ok) setPostAction({ type: "refund" });
  };

  const handleCancelSub = async () => {
    const ok = await doAction("cancel-subscription", "cancel");
    if (ok) setPostAction({ type: "cancel" });
  };

  const handleResolve = async () => {
    const ok = await doAction("resolve", "resolve");
    if (ok) onAction();
  };

  const handleGenerateAi = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/admin/support/${ticketId}/ai-reply`, { method: "POST" });
      const json = await res.json();
      if (res.ok && json.draft) setReplyBody(json.draft);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyBody.trim()) return;
    setIsSendingReply(true);
    try {
      const res = await fetch(`/api/admin/support/${ticketId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyBody }),
      });
      if (res.ok) onAction();
    } finally {
      setIsSendingReply(false);
    }
  };

  const handlePostActionEmail = async (emailBody: string) => {
    if (!ticket) return;
    await fetch(`/api/admin/support/${ticketId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: emailBody }),
    });
    setPostAction(null);
    onAction();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[520px] overflow-y-auto flex flex-col"
        style={{ background: "#0f0f0f", borderLeft: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0 sticky top-0 z-10"
          style={{ background: "#0f0f0f", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div>
            <p className="text-white font-bold text-[15px]">
              {ticket ? ticket.supportCode : "Support Ticket"}
            </p>
            <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.35)" }}>
              {ticket ? (ticket.categoryId?.label ?? "—") : "Loading…"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          </div>
        ) : error || !ticket ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.4)" }}>Failed to load ticket</p>
          </div>
        ) : (
          <div className="flex-1 px-6 py-5 space-y-5">
            {/* User card */}
            <div
              className="rounded-2xl p-4 space-y-3"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>User</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-[15px] flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #6b41ff 0%, #ea4bff 100%)" }}
                >
                  {(getUserName(ticket.userId)?.[0] ?? "?").toUpperCase()}
                </div>
                <div className="min-w-0">
                  <Link
                    href={`/admin/users/${ticket.userId?._id}`}
                    onClick={onClose}
                    className="text-[14px] font-semibold text-white hover:underline block truncate"
                  >
                    {getUserName(ticket.userId)}
                  </Link>
                  <p className="text-[12px] truncate" style={{ color: "rgba(255,255,255,0.4)" }}>{ticket.userId?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>Plan</p>
                  <p className="text-[13px] font-semibold text-white">
                    {(user as any)?.subscription?.planName ?? (user as any)?.subscriptionPlan ?? "Free"}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>Credits</p>
                  <p className="text-[13px] font-semibold text-white">
                    {(user as any)?.creditsBalance ?? "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Ticket body */}
            <div
              className="rounded-2xl p-4"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>Message</p>
              <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: "rgba(255,255,255,0.75)" }}>
                {ticket.body}
              </p>
              <p className="text-[11px] mt-3" style={{ color: "rgba(255,255,255,0.25)" }}>
                Submitted {new Date(ticket.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Action buttons */}
            {ticket.status === "open" && (
              <div
                className="rounded-2xl p-4 space-y-3"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>Quick Actions</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={handleRefund}
                    disabled={!!actionLoading}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-[12px] font-semibold transition-all disabled:opacity-40"
                    style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#4ade80" }}
                  >
                    {actionLoading === "refund" ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Refund
                  </button>
                  <button
                    onClick={handleCancelSub}
                    disabled={!!actionLoading}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-[12px] font-semibold transition-all disabled:opacity-40"
                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
                  >
                    {actionLoading === "cancel" ? (
                      <XCircle className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Cancel Sub
                  </button>
                  <button
                    onClick={handleResolve}
                    disabled={!!actionLoading}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-[12px] font-semibold transition-all disabled:opacity-40"
                    style={{ background: "rgba(107,65,255,0.1)", border: "1px solid rgba(107,65,255,0.2)", color: "#9370ff" }}
                  >
                    {actionLoading === "resolve" ? (
                      <CheckCircle2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Resolve
                  </button>
                </div>
              </div>
            )}

            {/* Reply section */}
            {ticket.status === "open" && (
              <div
                className="rounded-2xl p-4 space-y-3"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>Reply to User</p>
                  <button
                    onClick={handleGenerateAi}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-medium transition-all disabled:opacity-40"
                    style={{ background: "rgba(234,75,255,0.1)", border: "1px solid rgba(234,75,255,0.2)", color: "#f5a8ff" }}
                  >
                    <Sparkles className="w-3 h-3" />
                    {isGenerating ? "Generating…" : "Generate with AI"}
                  </button>
                </div>
                <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  rows={5}
                  placeholder="Write a reply to the user…"
                  className="w-full rounded-xl text-[13px] text-white resize-none p-3 focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                />
                <button
                  onClick={handleSendReply}
                  disabled={!replyBody.trim() || isSendingReply}
                  className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-white disabled:opacity-40 flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #6b41ff 0%, #ea4bff 100%)" }}
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSendingReply ? "Sending…" : "Send Reply"}
                </button>
              </div>
            )}

            {/* Previous reply */}
            {ticket.adminReply && (
              <div
                className="rounded-2xl p-4"
                style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }}
              >
                <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "rgba(34,197,94,0.6)" }}>Reply Sent</p>
                <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: "rgba(255,255,255,0.65)" }}>
                  {ticket.adminReply}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post-action email dialog */}
      {postAction && ticket && (
        <PostActionDialog
          open={true}
          title={postAction.type === "refund" ? "Send Refund Confirmation?" : "Send Cancellation Email?"}
          message={`Would you like to send an email to ${getUserName(ticket.userId)} notifying them of this action?`}
          suggestedBody={
            postAction.type === "refund"
              ? `Hi ${getUserName(ticket.userId)},\n\nWe've processed a refund for your recent charge. It should appear in your account within 5-10 business days.\n\nIf you have any further questions, don't hesitate to reach out.\n\nBest,\nSMPL Support`
              : `Hi ${getUserName(ticket.userId)},\n\nYour subscription has been successfully cancelled. You'll continue to have access until the end of your current billing period.\n\nIf you have any further questions, don't hesitate to reach out.\n\nBest,\nSMPL Support`
          }
          onSendEmail={handlePostActionEmail}
          onSkip={() => { setPostAction(null); onAction(); }}
        />
      )}
    </>
  );
}
