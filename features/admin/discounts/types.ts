/** Money is in cents everywhere. */

export type CouponDuration = "once" | "repeating" | "forever";

export interface CouponStats {
  redemptions: number;
  newCustomers: number;
  activeNow: number;
  discountedInvoices: number;
  totalDiscounted: number;
  revenue: number;
  canceled: number;
  canceledWhileDiscounted: number;
  canceledWithinWindow: number;
  discountEnded: number;
  paidFullPriceAfter: number;
  postDiscountRetention: number;
}

export interface Coupon {
  id: string;
  providerCouponId: string;
  name: string | null;
  campaign: string | null;
  percentOff: number | null;
  amountOff: number | null;
  currency: string | null;
  duration: CouponDuration;
  durationInMonths: number | null;
  maxRedemptions: number | null;
  redeemBy: string | null;
  timesRedeemed: number;
  valid: boolean;
  appliesToProductIds: string[];
  deletedAt: string | null;
  createdAt: string;
  summary: string;
}

/** GET /admin/coupons */
export interface CouponListItem extends Coupon {
  codes: { id: string; code: string; active: boolean; source: string | null; timesRedeemed: number }[];
  stats: CouponStats;
}

export interface PromotionCode {
  id: string;
  code: string;
  active: boolean;
  expiresAt: string | null;
  maxRedemptions: number | null;
  timesRedeemed: number;
  firstTimeOnly: boolean;
  source: string | null;
  createdAt: string;
  stats: CouponStats;
}

export interface CouponRedemptionRow {
  id: string;
  userId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  code: string | null;
  planName: string | null;
  appliedVia: string;
  isNewCustomer: boolean;
  start: string;
  scheduledEnd: string | null;
  endedAt: string | null;
  status: "active" | "ended" | "removed";
  activeNow: boolean;
  benefitEnd: string | null;
  discountedInvoiceCount: number;
  totalDiscounted: number;
  revenue: number;
  paidFullPriceAfter: boolean;
  canceledAt: string | null;
  subscriptionEndedAt: string | null;
  endedWhileDiscounted: boolean;
  endedWithinDaysOfDiscountEnd: number | null;
  subscriptionStatus: string | null;
}

/** GET /admin/coupons/:id */
export interface CouponDetail {
  coupon: Coupon;
  stats: CouponStats;
  codes: PromotionCode[];
  redemptions: CouponRedemptionRow[];
  monthly: { month: string; redemptions: number; newCustomers: number }[];
}

export type CancelCategory = "while_discounted" | "within_window" | "after_window" | "never_discounted";

export interface CohortRetention {
  customers: number;
  stillPaying: number;
  renewed: number;
  paidFullPrice: number;
  stillPayingRate: number;
  renewedRate: number;
  averageRevenue: number;
}

/** GET /admin/billing/discounts */
export interface DiscountAnalytics {
  range: { from: string; to: string };
  windowDays: number;
  current: {
    payingCustomers: number;
    discountedNow: number;
    discountedShare: number;
    mrr: number;
    listMrr: number;
    mrrDiscounted: number;
    activeRedemptions: number;
    customersAcquiredWithCoupon: number;
  };
  period: {
    redemptions: number;
    redemptionsByNewCustomers: number;
    newSubscribers: number;
    newWithCoupon: number;
    newWithoutCoupon: number;
    couponShare: number;
    discountGiven: number;
    discountedInvoices: number;
    couponCustomerRevenue: number;
  };
  retention: {
    withCoupon: CohortRetention;
    withoutCoupon: CohortRetention;
    postDiscount: { discountEnded: number; paidFullPriceAfter: number; rate: number };
  };
  cancellations: {
    total: number;
    whileDiscounted: number;
    withinWindow: number;
    afterWindow: number;
    neverDiscounted: number;
    recent: {
      subscriptionId: string;
      userId: string;
      email: string | null;
      planName: string | null;
      canceledAt: string;
      endedAt: string | null;
      by: string | null;
      category: CancelCategory;
      couponCode: string | null;
      couponId: string | null;
      daysSinceDiscountEnded: number | null;
      discountedInvoices: number;
    }[];
  };
  byCoupon: { couponId: string | null; name: string; campaign: string | null; summary: string | null; stats: CouponStats }[];
  bySource: { source: string; stats: CouponStats }[];
  byAppliedVia: { appliedVia: string; count: number }[];
  monthly: {
    month: string;
    redemptions: number;
    newWithCoupon: number;
    newWithoutCoupon: number;
    discountGiven: number;
    cancelsWhileDiscounted: number;
    cancelsAfterDiscount: number;
    cancelsOther: number;
  }[];
}

export const pct = (value: number) => `${(value * 100).toFixed(value > 0 && value < 0.1 ? 1 : 0)}%`;

export async function adminJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const message = json?.error ?? json?.message;
    throw new Error(Array.isArray(message) ? message.join(", ") : (message ?? "Request failed"));
  }
  return json as T;
}
