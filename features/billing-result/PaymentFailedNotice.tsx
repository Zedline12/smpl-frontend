"use client";

import { useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import type { UserPlanSummary } from "@/lib/subscription";
import { useBillingResult } from "./store";

const SEEN_KEY = "smpl:payment-failed-seen";

/**
 * A renewal that failed in the background (card expired, declined…): shown once per
 * failure the next time the user opens the app, until they fix it.
 */
export function PaymentFailedNotice() {
  const subscription = useAuth()?.user?.subscription as UserPlanSummary | undefined;
  const open = useBillingResult((s) => s.open);
  const failedAt = subscription?.lastPaymentFailedAt ?? null;
  const pastDue = subscription?.status === "past_due" || subscription?.status === "unpaid";

  useEffect(() => {
    if (!failedAt || !pastDue) return;
    let seen: string | null = null;
    try {
      seen = localStorage.getItem(SEEN_KEY);
    } catch {
      /* storage blocked: show it */
    }
    if (seen === failedAt) return;
    try {
      localStorage.setItem(SEEN_KEY, failedAt);
    } catch {
      /* ignore */
    }
    open({
      variant: "failed",
      title: "Your renewal payment failed",
      message: `We couldn't charge your card for ${subscription?.name ?? "your plan"}. Update your payment method to keep your plan and monthly credits.`,
      paymentMethod: true,
    });
  }, [failedAt, pastDue, open, subscription?.name]);

  return null;
}
