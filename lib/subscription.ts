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
}

/** True when the user has no paid plan. */
export function isFreePlan(user: { subscription?: Partial<UserPlanSummary> | null } | null | undefined): boolean {
  const subscription = user?.subscription;
  if (!subscription) return true;
  if (typeof subscription.isFree === "boolean") return subscription.isFree;
  // Older responses without `isFree`.
  return subscription.name === "Free Plan" || !subscription.priceAmount;
}
