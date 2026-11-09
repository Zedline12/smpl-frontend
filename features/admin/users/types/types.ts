import { Media } from "@/features/media/types/media";

/** free, or the state of the user's paid plan. */
export type SubscriptionStatusLabel = "free" | "trialing" | "active" | "past_due" | "canceling" | "canceled";

export interface SubscribedUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  creditsBalance: number;
  subscriptionStatus: SubscriptionStatusLabel | null;
  subscriptionPlanName: string | null;
  subscriptionPlanPriceAmount: number;
  billingPeriod: string | null;
}

export interface AdminUserInvoice {
  subscriptionName: string;
  month: string;
  date: string;
  amount: string;
  invoiceId: string;
}

export interface FailedGeneration {
  id: string;
  category: string;
  clientMessage: string;
  model: string;
  input: Record<string, unknown>;
  createdAt?: string;
}

export interface AdminUserDetail {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  creditsBalance: number;
  subscriptionStatus: SubscriptionStatusLabel | null;
  subscriptionPlanName: string | null;
  subscriptionPlanPriceAmount: number;
  providerCustomerId: string | null;
  totalGenerations: number;
  successJobs: number;
  processingJobs: number;
  failureJobs: number;
  invoices: AdminUserInvoice[];
  media: Media[];
  failedGenerations?: FailedGeneration[];
}
