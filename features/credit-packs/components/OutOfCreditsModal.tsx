"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog as DialogPrimitive } from "radix-ui";
import { X, Zap } from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useOutOfCreditsStore } from "@/stores/useOutOfCreditsStore";
import { CreditPackPicker, creditPackEligibility } from "./CreditPackPicker";

/**
 * "Not enough credits": opens when the backend refuses a charge. Paid plans get the
 * credit packs; free plans are pointed at the plans (packs need an active plan).
 * A bottom sheet on phones, a centered dialog from sm up.
 */
export function OutOfCreditsModal() {
  const { user } = useCurrentUser();
  const { open, required, hide } = useOutOfCreditsStore();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  // The balance shown should be the real one (the refused action may have raced a charge).
  useEffect(() => {
    if (open) void queryClient.invalidateQueries({ queryKey: ["current-user"] });
  }, [open, queryClient]);

  // Leaving the page (e.g. to /pricing) closes it.
  useEffect(() => {
    hide();
  }, [pathname, hide]);

  if (!user) return null;
  const eligibility = creditPackEligibility(user);
  const balance = Number(user.creditsBalance) || 0;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(next) => !next && hide()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className={
            "data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-8 sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:zoom-in-95 " +
            "fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-3xl border-t border-white/10 bg-popover text-foreground shadow-2xl outline-none " +
            "sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:w-[min(760px,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border"
          }
        >
          {/* Grab handle (phones) */}
          <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-white/20 sm:hidden" aria-hidden />

          <div className="flex shrink-0 items-start gap-3 px-5 pt-4 pb-3 sm:px-6 sm:pt-6">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
              <Zap className="size-5 text-primary" />
            </span>
            <div className="min-w-0 flex-1">
              <DialogPrimitive.Title className="text-lg font-semibold text-white">
                You&apos;re out of credits
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-0.5 text-sm text-white/55">
                {required
                  ? `This needs ${required.toLocaleString("en-US")} credits and you have ${balance.toLocaleString("en-US")}.`
                  : `You have ${balance.toLocaleString("en-US")} credits left.`}{" "}
                {eligibility === "eligible"
                  ? "Top up to keep creating."
                  : "Get a plan to keep creating."}
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close
              aria-label="Close"
              className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/[0.06] text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </DialogPrimitive.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-2 pb-[max(20px,env(safe-area-inset-bottom))] sm:px-6 sm:pb-6">
            {eligibility === "eligible" ? (
              <CreditPackPicker />
            ) : (
              <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <p className="text-sm text-white/65">
                  {eligibility === "past_due"
                    ? "Your last payment didn't go through. Update your payment method to get your credits and buy credit packs."
                    : "Credit packs are for active plans. Pick a plan for monthly credits, then top up any time."}
                </p>
                <Link
                  href={eligibility === "past_due" ? "/me/settings/subscription" : "/pricing"}
                  onClick={hide}
                  className="flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  {eligibility === "past_due" ? "Update payment" : "See plans"}
                </Link>
              </div>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
