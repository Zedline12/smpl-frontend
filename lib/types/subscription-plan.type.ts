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
}
