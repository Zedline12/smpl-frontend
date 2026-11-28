/** The plan summary on the signed-in user (`/auth/me?include=subscription`). */
export interface UserPlanSummary {
  /** The plan id. */
  id: string;
  name: string;
  creditsPerMonth: number;
  priceAmount?: number;
  currency?: string;
  billingPeriod?: "MONTHLY" | "YEARLY";
  isFree?: boolean;
  /** free | trialing | active | past_due | … */
  status?: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string | null;
  lastPaymentFailedAt?: string | null;
  /** The coupon lowering the price right now. */
  discount?: {
    code: string | null;
    percentOff: number | null;
    amountOff: number | null;
    duration: string | null;
    durationInMonths: number | null;
    end: string | null;
  } | null;
}

/** What users without a paid plan are called. A label only: there is no Free plan. */
export const NO_PLAN_LABEL = "Free";

/** A plan as the pricing cards know it (enough to compare two plans). */
type ComparablePlan = {
  id: string;
  priceAmount: number;
  billingPeriod?: string;
  tier?: number | null;
};

/**
 * Same rule as the backend's SubscriptionPlansService.compare: a higher tier, or (no
 * tiers) a higher price per month. > 0 means `to` is an upgrade from `from`.
 */
export function comparePlans(from: ComparablePlan, to: ComparablePlan): number {
  if (from.tier != null && to.tier != null && from.tier !== to.tier) return to.tier - from.tier;
  const monthly = (p: ComparablePlan) => (p.billingPeriod === "YEARLY" ? p.priceAmount / 12 : p.priceAmount);
  return monthly(to) - monthly(from);
}

/**
 * What a pricing card offers this user:
 *  - subscribe: no paid plan (never had one, or it fully ended);
 *  - current: the plan they're on;
 *  - upgrade: a better plan (the only change allowed while subscribed);
 *  - unavailable: a lower or equal plan, or anything while a payment is failing.
 */
export type PlanAction = "subscribe" | "current" | "upgrade" | "unavailable";

export function planAction(
  user: { subscription?: Partial<UserPlanSummary> | null } | null | undefined,
  plan: ComparablePlan,
  plans: ComparablePlan[],
): PlanAction {
  if (!user || isFreePlan(user)) return "subscribe";
  const sub = user.subscription!;
  if (sub.id === plan.id) return "current";
  if (sub.status === "past_due" || sub.status === "unpaid") return "unavailable";
  // The current plan as the cards see it (for its tier); the summary is the fallback.
  const current = plans.find((p) => p.id === sub.id) ?? {
    id: sub.id ?? "",
    priceAmount: sub.priceAmount ?? 0,
    billingPeriod: sub.billingPeriod,
  };
  return comparePlans(current, plan) > 0 ? "upgrade" : "unavailable";
}

/** Why a plan card can't be picked (for its disabled button / hint). */
export function unavailableReason(user: { subscription?: Partial<UserPlanSummary> | null } | null | undefined): string {
  const status = user?.subscription?.status;
  return status === "past_due" || status === "unpaid"
    ? "Update your payment method first"
    : "Available after your current plan ends";
}

/** True when the user has no paid plan. */
export function isFreePlan(user: { subscription?: Partial<UserPlanSummary> | null } | null | undefined): boolean {
  const subscription = user?.subscription;
  if (!subscription) return true;
  if (typeof subscription.isFree === "boolean") return subscription.isFree;
  // Older responses without `isFree`.
  // Legacy: accounts still pointing at the old $0 Free plan.
  return !subscription.priceAmount;
}
