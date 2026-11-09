"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Info, Loader2 } from "lucide-react";
import { toast } from "sonner";

/** Stripe's cancellation reasons, worded for people. */
const REASONS = [
  { value: "too_expensive", label: "It's too expensive" },
  { value: "unused", label: "I don't use it enough" },
  { value: "missing_features", label: "It's missing features I need" },
  { value: "low_quality", label: "The results aren't good enough" },
  { value: "switched_service", label: "I'm switching to another service" },
  { value: "too_complex", label: "It's too hard to use" },
  { value: "customer_service", label: "Support didn't help" },
  { value: "other", label: "Something else" },
] as const;

async function cancelSubscription(body: { feedback?: string; comment?: string }) {
  const res = await fetch("/api/user-subscriptions/cancel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(json?.error || json?.message || "Failed to cancel subscription");
  }
  return json;
}

interface CancelSubscriptionDialogProps {
  planName: string;
  /** When the paid period ends (access continues until then). */
  endsAt?: string | null;
}

export function CancelSubscriptionDialog({ planName, endsAt }: CancelSubscriptionDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [comment, setComment] = useState("");
  const endDate = endsAt ? new Date(endsAt).toLocaleDateString(undefined, { dateStyle: "long" }) : null;

  const cancel = useMutation({
    mutationFn: () =>
      cancelSubscription({
        ...(feedback ? { feedback } : {}),
        ...(comment.trim() ? { comment: comment.trim() } : {}),
      }),
    onSuccess: () => {
      toast.success(
        endDate ? `Your plan is canceled. You keep ${planName} until ${endDate}.` : "Your plan is canceled.",
      );
      setOpen(false);
      // The user object is a server-render snapshot in AuthProvider.
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
        if (cancel.isPending) return;
        setError(null);
        setOpen(next);
      }}
    >
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          className="cursor-pointer rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-red-500/10"
          style={{
            color: "#ef4444",
            borderColor: "rgba(239,68,68,0.25)",
            background: "rgba(239,68,68,0.06)",
          }}
        >
          Cancel plan
        </button>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        {/* z-[70]: the (other) layout's header is z-[60]. */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />

        <DialogPrimitive.Content className="border-border bg-card fixed top-1/2 left-1/2 z-[70] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-6 shadow-2xl duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <DialogPrimitive.Title className="text-foreground text-base font-semibold">
            Cancel your {planName} plan?
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="text-muted-foreground mt-1 text-xs">
            You can undo this any time before your plan ends.
          </DialogPrimitive.Description>

          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-white/10 bg-white/[0.04] p-3">
            <Info className="mt-0.5 size-4 shrink-0 text-white/60" />
            <ul className="text-muted-foreground space-y-1 text-xs leading-relaxed">
              <li>
                {endDate
                  ? `You keep ${planName} and your credits until ${endDate}.`
                  : `You keep ${planName} until the end of your paid period.`}
              </li>
              <li>After that you move to the Free plan and your monthly credits stop renewing.</li>
            </ul>
          </div>

          <label className="text-foreground mt-4 block text-xs font-medium">
            Why are you leaving? <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <select
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            disabled={cancel.isPending}
            className="border-border bg-background text-foreground mt-1.5 w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">Choose a reason</option>
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 500))}
            disabled={cancel.isPending}
            rows={3}
            placeholder="Anything we could do better?"
            className="border-border bg-background text-foreground placeholder:text-muted-foreground mt-2 w-full resize-none rounded-lg border px-3 py-2 text-sm"
          />

          {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

          <div className="mt-5 flex gap-2">
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                disabled={cancel.isPending}
                className="border-border text-foreground hover:bg-accent flex-1 cursor-pointer rounded-lg border py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                Keep my plan
              </button>
            </DialogPrimitive.Close>

            <button
              type="button"
              onClick={() => {
                setError(null);
                cancel.mutate();
              }}
              disabled={cancel.isPending}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cancel.isPending && <Loader2 className="size-4 animate-spin" />}
              {cancel.isPending ? "Canceling…" : "Cancel plan"}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
