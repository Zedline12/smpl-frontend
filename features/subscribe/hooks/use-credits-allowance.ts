"use client";

import { useQuery } from "@tanstack/react-query";
import { SubscriptionPlan } from "@/lib/types/subscription-plan.type";

async function fetchSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const res = await fetch("/api/subscription-plans");
  const json = await res.json();
  return Array.isArray(json?.data) ? json.data : [];
}

export interface CreditsAllowance {
  remaining: number;
  /** Credits from credit packs (kept across renewals). */
  packCredits: number;
  allowance: number;
  used: number;
  usedPercentage: number;
  /** False when the plan lookup fails — render the count without a bar. */
  hasAllowance: boolean;
}

/**
 * The monthly allowance is not on the user object — `user.subscription` is only
 * `{ id, name }` — so it has to be matched against the subscription plans.
 */
export function useCreditsAllowance(user: any): CreditsAllowance {
  const { data: plans } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: fetchSubscriptionPlans,
    staleTime: 5 * 60_000,
    enabled: !!user,
  });

  const plan = plans?.find((p) => p.id === user?.subscription?.id);
  const allowance = Number(plan?.creditsPerMonth) || 0;
  // Pack credits sit on top of the monthly ones and don't reset, so the bar shows plan credits only.
  const packCredits = Math.max(0, Number(user?.packCreditsBalance) || 0);
  const remaining = Math.max(0, (Number(user?.creditsBalance) || 0) - packCredits);

  // Clamped: someone with topped-up or rolled-over credits can hold more than
  // their monthly grant, which would otherwise render a negative "used".
  const used = Math.max(0, allowance - remaining);
  const usedPercentage =
    allowance > 0 ? Math.min(100, Math.round((used / allowance) * 100)) : 0;

  return {
    remaining,
    packCredits,
    allowance,
    used,
    usedPercentage,
    hasAllowance: allowance > 0,
  };
}
