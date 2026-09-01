"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Dialog as DialogPrimitive } from "radix-ui";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

async function cancelSubscription(subscriptionId: string) {
  const res = await fetch(`/api/user-subscriptions/${subscriptionId}/cancel`, {
    method: "POST",
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      json?.error || json?.message || "Failed to cancel subscription",
    );
  }
  return json;
}

interface CancelSubscriptionDialogProps {
  subscriptionId: string;
  planName: string;
  monthlyCredits: number;
}

export function CancelSubscriptionDialog({
  subscriptionId,
  planName,
  monthlyCredits,
}: CancelSubscriptionDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancel = useMutation({
    mutationFn: () => cancelSubscription(subscriptionId),
    onSuccess: () => {
      toast.success("Your subscription has been cancelled.");
      setOpen(false);
      // The user object is a server-render snapshot in AuthProvider, so the
      // navbar keeps the old plan without this.
      router.refresh();
    },
    onError: (mutationError: Error) => {
      // Kept inline as well as toasted so the dialog explains itself.
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
          Cancel subscription
        </button>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        {/* z-[70]: the (other) layout's header is z-[60], and the shared
            Dialog/AlertDialog hardcode their overlay at z-50 with no className
            passthrough — they would render behind the navbar. */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />

        <DialogPrimitive.Content className="border-border bg-card fixed top-1/2 left-1/2 z-[70] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-6 shadow-2xl duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <DialogPrimitive.Title className="text-foreground text-base font-semibold">
            Cancel your {planName} plan?
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="text-muted-foreground mt-1 text-xs">
            You can resubscribe at any time.
          </DialogPrimitive.Description>

          <div
            className="mt-4 flex items-start gap-2.5 rounded-lg p-3"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-400" />
            <ul className="text-muted-foreground space-y-1 text-xs leading-relaxed">
              {monthlyCredits > 0 && (
                <li>
                  Your {monthlyCredits.toLocaleString("en-US")} monthly credits
                  will stop renewing.
                </li>
              )}
              <li>You&apos;ll lose access to paid plan features.</li>
            </ul>
          </div>

          {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

          <div className="mt-5 flex gap-2">
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                disabled={cancel.isPending}
                className="border-border text-foreground hover:bg-accent flex-1 cursor-pointer rounded-lg border py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                Keep plan
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
              {cancel.isPending ? "Cancelling…" : "Cancel plan"}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
