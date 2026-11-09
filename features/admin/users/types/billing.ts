/** GET /admin/billing/users/:id */
export interface AdminUserBilling {
  summary: {
    stripeCustomerId: string | null;
    planName: string | null;
    status: "free" | "trialing" | "active" | "past_due" | "canceling";
    currentPeriodEnd: string | null;
    isPaying: boolean;
    everPaid: boolean;
    firstPaidAt: string | null;
    lastPaidAt: string | null;
    paidInvoiceCount: number;
    lifetimeValue: number;
    currency: string | null;
    mrr: number;
    churnedAt: string | null;
    churnReason: string | null;
    subscriptionCount: number;
  } | null;
  subscriptions: {
    id: string;
    providerSubscriptionId: string;
    planName: string | null;
    status: string;
    amount: number | null;
    currency: string | null;
    interval: string | null;
    startedAt: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    canceledAt: string | null;
    endedAt: string | null;
    isCurrent: boolean;
    failedPaymentCount: number;
    cancellation: { reason?: string | null; feedback?: string | null; comment?: string | null; by?: string | null } | null;
  }[];
  events: {
    id: string;
    type: string;
    occurredAt: string;
    actor: string;
    amount: number | null;
    currency: string | null;
    mrrDelta: number | null;
    fromPlanName: string | null;
    toPlanName: string | null;
    fromStatus: string | null;
    toStatus: string | null;
    metadata: Record<string, any> | null;
  }[];
  invoices: {
    id: string;
    providerInvoiceId: string;
    amount: number;
    amountRefunded: number;
    currency: string;
    status: string;
    billingReason: string | null;
    planName: string | null;
    paidAt: string;
    creditsGranted: number | null;
    hostedInvoiceUrl: string | null;
  }[];
}

/** GET /admin/billing/metrics (money in cents). */
export interface BillingMetrics {
  range: { from: string; to: string };
  currency: string;
  current: {
    mrr: number;
    arr: number;
    payingCustomers: number;
    trialing: number;
    pastDue: number;
    canceling: number;
    everPaid: number;
    lapsed: number;
    arpu: number;
    averageLifetimeValue: number;
    planMix: { planName: string; customers: number; mrr: number }[];
  };
  period: {
    newSubscribers: number;
    reactivated: number;
    upgrades: number;
    downgrades: number;
    churned: number;
    churnedVoluntary: number;
    churnedPaymentFailed: number;
    cancelsScheduled: number;
    cancelsUndone: number;
    paymentFailures: number;
    paymentRecoveries: number;
    refunds: number;
    disputes: number;
    customerChurnRate: number;
    revenue: { gross: number; refunded: number; net: number; invoices: number };
    mrrMovement: {
      new: number;
      reactivation: number;
      expansion: number;
      contraction: number;
      churn: number;
      pause: number;
      net: number;
    };
  };
}

/** GET /admin/billing/lapsed */
export interface LapsedCustomer {
  userId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  planName: string | null;
  firstPaidAt: string | null;
  lastPaidAt: string | null;
  lifetimeValue: number;
  churnedAt: string | null;
  churnReason: string | null;
}

export const money = (cents?: number | null, currency = "usd") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format((cents ?? 0) / 100);

export const shortDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

export const humanize = (value?: string | null) => (value ? value.replace(/_/g, " ") : "");
