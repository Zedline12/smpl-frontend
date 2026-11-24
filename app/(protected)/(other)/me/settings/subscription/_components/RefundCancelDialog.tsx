"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Info, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CANCEL_REASONS } from "./CancelSubscriptionDialog";

/** What the backend says about "cancel and get a full refund" (amount in cents). */
export interface RefundEligibility {
  eligible: boolean;
  reason: "no_paid_plan" | "no_payment" | "already_refunded" | "refund_in_progress" | "window_passed" | "credits_used" | null;
  amount: number;
  currency: string | null;
  paidAt: string | null;
  deadline: string | null;
  netCreditsUsed: number;
  windowDays: number;
}

export const REFUND_ELIGIBILITY_KEY = ["refund-eligibility"] as const;

export async function fetchRefundEligibility(): Promise<RefundEligibility | null> {
  const res = await fetch("/api/user-subscriptions/refund-eligibility");
  if (!res.ok) return null;
  const json = await res.json().catch(() => null);
  // The backend wraps replies as { success, message, data }.
  return (json?.data ?? json) as RefundEligibility | null;
}

export const formatMoney = (cents: number, currency = "usd") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);

async function refundAndCancel(body: { feedback?: string; comment?: string }) {
  const res = await fetch("/api/user-subscriptions/refund-cancel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error || json?.message || "We couldn't refund this payment right now.");
  return (json?.data ?? json) as { status: string; amount: number; currency: string; subscriptionCanceled: boolean };
}

interface RefundCancelDialogProps {
  planName: string;
  eligibility: RefundEligibility;
}

/** "Cancel and get a full refund": only offered within the window and with no credits used. */
export function RefundCancelDialog({ planName, eligibility }: RefundCancelDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [comment, setComment] = useState("");
  const amount = formatMoney(eligibility.amount, eligibility.currency ?? "usd");
  const deadline = eligibility.deadline
    ? new Date(eligibility.deadline).toLocaleDateString("en-US", { dateStyle: "long", timeZone: "UTC" })
    : null;

  const refund = useMutation({
    mutationFn: () =>
      refundAndCancel({
        ...(feedback ? { feedback } : {}),
        ...(comment.trim() ? { comment: comment.trim() } : {}),
      }),
    onSuccess: () => {
      toast.success(`Your plan is canceled and ${amount} is on its way back to you.`);
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: REFUND_ELIGIBILITY_KEY });
      // The user object (plan, credits) is a server-render snapshot in AuthProvider.
      router.refresh();
    },
    onError: (mutationError: Error) => {
      setError(mutationError.message);
      toast.error(mutationError.message);
    },
  });

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (refund.isPending) return;
        setError(null);
        setOpen(next);
      }}
    >
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          className="cursor-pointer rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
        >
          Cancel and get a full refund ({amount})
        </button>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        {/* z-[70]: the (other) layout's header is z-[60]. */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />

        <DialogPrimitive.Content className="border-border bg-card fixed top-1/2 left-1/2 z-[70] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-6 shadow-2xl duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <DialogPrimitive.Title className="text-foreground text-base font-semibold">
            Cancel {planName} and get {amount} back?
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="text-muted-foreground mt-1 text-xs">
            This can&apos;t be undone.
          </DialogPrimitive.Description>

          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-white/10 bg-white/[0.04] p-3">
            <Info className="mt-0.5 size-4 shrink-0 text-white/60" />
            <ul className="text-muted-foreground space-y-1 text-xs leading-relaxed">
              <li>Your plan ends right away, and its credits are removed. Credits you bought in packs stay.</li>
              <li>We refund {amount} to your original payment method. It usually shows up in 5–10 business days.</li>
              {deadline && <li>A full refund is available until {deadline} while no credits are used.</li>}
            </ul>
          </div>

          <label className="text-foreground mt-4 block text-xs font-medium">
            Why are you leaving? <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <select
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            disabled={refund.isPending}
            className="border-border bg-background text-foreground mt-1.5 w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">Choose a reason</option>
            {CANCEL_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 500))}
            disabled={refund.isPending}
            rows={3}
            placeholder="Anything we could do better?"
            className="border-border bg-background text-foreground placeholder:text-muted-foreground mt-2 w-full resize-none rounded-lg border px-3 py-2 text-sm"
          />

          {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

          <div className="mt-5 flex gap-2">
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                disabled={refund.isPending}
                className="border-border text-foreground hover:bg-accent flex-1 cursor-pointer rounded-lg border py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                Keep my plan
              </button>
            </DialogPrimitive.Close>

            <button
              type="button"
              onClick={() => {
                setError(null);
                refund.mutate();
              }}
              disabled={refund.isPending}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refund.isPending && <Loader2 className="size-4 animate-spin" />}
              {refund.isPending ? "Refunding…" : `Refund ${amount} and cancel`}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
