import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { CheckoutPromotion } from "./use-checkout";

/** Stripe's price for a plan change. Amounts in cents. */
export interface PlanChangePreview {
  isUpgrade: boolean;
  currentPlan: { id: string; name: string; creditsPerMonth: number } | null;
  targetPlan: {
    id: string;
    name: string;
    creditsPerMonth: number;
    priceAmount: number;
    billingPeriod: "MONTHLY" | "YEARLY";
  };
  currency: string;
  dueNow: number;
  lines: { description: string; amount: number }[];
  discountTotal: number;
  creditsAdded: number;
  nextRenewal: { amount: number; date: string | null };
  removedCoupon: { code: string | null; summary: string | null } | null;
  promotion:
    | { valid: true; code: string; summary: string; duration: string; durationInMonths: number | null }
    | { valid: false; code: string; reason: string; message: string }
    | null;
  prorationDate: number;
}

export interface PlanChangeResult {
  changed: "upgraded" | "downgraded";
  result: {
    planName: string;
    creditsAdded: number;
    amountPaid: number;
    currency: string;
    balance: number | null;
    nextBillingDate: string | null;
  };
}

/** Raised by changePlan; `cardProblem` when the payment method needs updating. */
export class PlanChangeError extends Error {
  constructor(
    message: string,
    readonly cardProblem: boolean,
    readonly codeProblem: boolean,
  ) {
    super(message);
  }
}

const unwrap = <T,>(json: unknown): T => ((json as { data?: T } | null)?.data ?? json) as T;

async function fetchPreview(planId: string, promotionCode: string | null): Promise<PlanChangePreview> {
  const res = await fetch("/api/user-subscriptions/change-plan/preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ planId, ...(promotionCode ? { promotionCode } : {}) }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error || "Couldn't price this plan change.");
  return unwrap<PlanChangePreview>(json);
}

/** What the change costs, re-priced whenever the code changes. */
export function usePlanChangePreview(planId: string | null, promotionCode: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ["plan-change-preview", planId, promotionCode],
    queryFn: () => fetchPreview(planId!, promotionCode),
    enabled: enabled && !!planId,
    staleTime: 60_000,
    retry: false,
    refetchOnWindowFocus: false,
    placeholderData: (previous) => previous,
  });
}

/** Moves an existing paid subscription to another plan (no new checkout). */
export function useChangePlan() {
  const [isLoading, setIsLoading] = useState(false);

  const changePlan = useCallback(
    async (params: {
      planId: string;
      promotion?: CheckoutPromotion | null;
      prorationDate?: number;
    }): Promise<PlanChangeResult> => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/user-subscriptions/change-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId: params.planId,
            ...(params.promotion
              ? { promotionCode: params.promotion.code, appliedVia: params.promotion.appliedVia }
              : {}),
            ...(params.prorationDate ? { prorationDate: params.prorationDate } : {}),
          }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok) {
          const message: string = json?.error || "Couldn't change your plan.";
          throw new PlanChangeError(
            message,
            /declined|payment method|card/i.test(message),
            json?.code === "INVALID_PROMOTION_CODE" || /code/i.test(message),
          );
        }
        return unwrap<PlanChangeResult>(json);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { changePlan, isLoading };
}
