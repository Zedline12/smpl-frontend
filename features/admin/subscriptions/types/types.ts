export interface SubscriptionPlanAdmin{
    id: string;
    name: string;
    billingPeriod: string;
    priceAmount: number;
    currency: string;
}
export interface SubscriptionsAnalytics{
    plan: string;
    subscriptions: number;
    billingPeriod: string;
}
export interface SubscriptionsStatistics{
    totalSubscriptions: number;
    activeSubscriptions: number;
    unActiveSubscriptions: number;
}