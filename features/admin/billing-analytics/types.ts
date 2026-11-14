/** Shape of GET /admin/billing/analytics. Money is in minor units (cents). */

export interface PeriodKpis {
  mrr: number;
  activeSubscribers: number;
  newSubscribers: number;
  churned: number;
  churnRate: number;
  grossRevenue: number;
  netRevenue: number;
  refunds: { count: number; amount: number };
  creditPackRevenue: number;
  creditPackPurchases: number;
  conversion: { signups: number; converted: number; rate: number };
}

export interface MonthRow {
  month: string;
  new: number;
  reactivated: number;
  churned: number;
  churnedVoluntary: number;
  churnedPaymentFailed: number;
  upgrades: number;
  downgrades: number;
  activeEnd: number;
  mrrEnd: number;
  revenue: {
    subscriptionNew: number;
    renewals: number;
    changes: number;
    creditPacks: number;
    refunds: number;
    gross: number;
    net: number;
  };
  packPurchases: number;
  signups: number;
  firstPaid: number;
}

export interface Cohort {
  month: string;
  size: number;
  /** Share still paying 1..12 months after starting; null = not reached yet. */
  retention: (number | null)[];
}

export interface PlanStats {
  id: string;
  name: string;
  priceAmount: number;
  billingPeriod: string;
  activeNow: number;
  mrrNow: number;
  new: number;
  churned: number;
  churnRate: number;
  revenue: number;
  refunds: number;
  averageLifetimeMonths: number | null;
  couponShare: number;
}

export interface PackStats {
  id: string;
  name: string;
  credits: number;
  priceAmount: number;
  purchases: number;
  revenue: number;
  refunds: number;
  buyers: number;
  repeatBuyerRate: number;
  subscriberRate: number;
}

export interface BillingAnalytics {
  range: { from: string; to: string; months: string[] };
  currency: string;
  kpis: { current: PeriodKpis; previous: PeriodKpis };
  monthly: MonthRow[];
  retention: {
    cohorts: Cohort[];
    lifetime: {
      averageMonths: number;
      medianMonths: number;
      endedCount: number;
      averageActiveTenureMonths: number;
      histogram: { label: string; count: number }[];
    };
    everSubscribed: number;
    stillPaying: number;
    stayedRate: number;
    renewalRate: number;
    renewalEligible: number;
    averageLifetimeValue: number;
  };
  cancellations: {
    total: number;
    voluntary: number;
    paymentFailed: number;
    feedback: { key: string; count: number }[];
    by: { key: string; count: number }[];
    scheduled: number;
    undone: number;
    cancelingNow: number;
    disputes: number;
    paymentFailures: number;
    paymentRecoveries: number;
    refunds: { count: number; amount: number; rate: number; full: number; partial: number };
  };
  plans: PlanStats[];
  packs: PackStats[];
}

export type RangeKey = "3" | "6" | "12" | "all";
