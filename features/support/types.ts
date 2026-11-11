export type SupportCategoryKey = "billing" | "generations" | "credits" | "account" | "other";
export type SupportStatus = "open" | "waiting_on_user" | "resolved";
export type SupportPriority = "high" | "normal" | "low";

export interface SupportAttachment {
  url: string;
  key: string;
  contentType?: string;
}

export interface SupportInvoice {
  billingTransactionId: string;
  providerInvoiceId: string | null;
  amount: number;
  amountRefunded: number;
  currency: string;
  paidAt: string | null;
  name: string;
  kind: "subscription" | "credit_pack";
  hostedInvoiceUrl: string | null;
  refundedAt?: string | null;
}

/** A row in the invoice picker. */
export interface SupportInvoiceOption extends SupportInvoice {
  id: string;
  fullyRefunded: boolean;
  openTicketCode: string | null;
}

export interface SupportGeneration {
  jobId: string;
  model: string;
  type: string;
  prompt: string;
  status: string;
  failedMessage: string | null;
  credits: number | null;
  createdAt: string;
  refundedCredits?: number | null;
  refundedAt?: string | null;
}

export interface SupportGenerationOption extends SupportGeneration {
  canInstantRefund: boolean;
}

export interface SupportGenerationLists {
  stuck: SupportGenerationOption[];
  failed: SupportGenerationOption[];
  recent: SupportGenerationOption[];
}

export interface SupportMessage {
  from: "user" | "admin";
  body: string;
  attachments: SupportAttachment[];
  createdAt: string;
}

export interface SupportTicketSummary {
  id: string;
  supportCode: string;
  category: string;
  categoryLabel: string;
  status: SupportStatus;
  priority: SupportPriority;
  preview: string;
  lastMessageAt: string;
  userUnread: boolean;
  createdAt: string;
}

export interface SupportTicketView {
  id: string;
  supportCode: string;
  category: string;
  categoryLabel: string;
  topic: string | null;
  priority: SupportPriority;
  status: SupportStatus;
  body: string;
  attachments: SupportAttachment[];
  invoice: SupportInvoice | null;
  generations: SupportGeneration[];
  messages: SupportMessage[];
  lastMessageAt: string;
  userUnread: boolean;
  adminUnread: boolean;
  resolvedAt: string | null;
  createdAt: string;
}

export const MAX_SCREENSHOTS = 5;
export const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024;
export const SCREENSHOT_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export const STATUS_LABELS: Record<SupportStatus, string> = {
  open: "Open",
  waiting_on_user: "Replied",
  resolved: "Resolved",
};

export function formatMoney(amount: number, currency = "usd") {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(amount / 100);
  } catch {
    return `$${(amount / 100).toFixed(2)}`;
  }
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function timeAgo(value: string) {
  const mins = Math.round((Date.now() - new Date(value).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(value);
}
