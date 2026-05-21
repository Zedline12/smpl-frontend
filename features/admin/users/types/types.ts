import { Media } from "@/features/media/types/media";

export interface SubscribedUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  creditsBalance: number;
  subscriptionStatus: "active" | "past_due" | "canceled" | null;
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
  subscriptionStatus: "active" | "past_due" | "canceled" | null;
  subscriptionPlanName: string | null;
  subscriptionPlanPriceAmount: number;
  totalGenerations: number;
  successJobs: number;
  processingJobs: number;
  failureJobs: number;
  invoices: AdminUserInvoice[];
  media: Media[];
  failedGenerations?: FailedGeneration[];
}
