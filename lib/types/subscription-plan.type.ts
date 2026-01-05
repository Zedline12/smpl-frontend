export enum billingPeriod{
    MONTHLY = "MONTHLY",
    YEARLY="YEARLY"
}
export interface SubscriptionPlan {
  id: string;

  name: string;

  creditsPerMonth: number;

 
  billingPeriod: billingPeriod;

  priceAmount: number;

  currency: string;

  stripePriceId: string;
}