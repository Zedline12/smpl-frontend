export enum billingPeriod {
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}
export interface SubscriptionPlan {
  id: string;

  name: string;
  isMostPopular: boolean;
  creditsPerMonth: number;

  metadata: string[];
  billingPeriod: billingPeriod;

  priceAmount: number;

  currency: string;

  stripePriceId: string;

  /** Rank that tells upgrades from downgrades (higher = better); missing on some responses. */
  tier?: number | null;

  /** Generation jobs a user on this plan can run at the same time. */
  maxConcurrentJobs?: number;
}
