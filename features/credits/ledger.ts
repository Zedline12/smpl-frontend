import {
  AUDIO_MODELS,
  IMAGE_MODELS,
  STUDIO_MODELS,
  VIDEO_MODELS,
  normalizeModelId,
} from "@/features/generation/enums/models.enum";
import { offeringName } from "@/features/catalog/catalog";

/** One credit ledger row, as the usage page gets it. */
export interface LedgerRow {
  id: string;
  type: string;
  /** Signed: negative took credits away. */
  amount: number;
  balanceBefore?: number;
  balanceAfter: number;
  source?: string;
  model?: string | null;
  mediaType?: string | null;
  note?: string | null;
  jobId?: string | null;
  generationId?: string | null;
  mediaCount?: number;
  /** The first output that still exists. */
  media?: { id: string; url: string; type: string } | null;
  /** The clipping/analyzer project (or ticket) it was for. */
  subject?: { model: string; id: string } | null;
  createdAt: string;
}

/** The same row on the admin ledger, with bookkeeping and links. */
export interface AdminLedgerRow extends LedgerRow {
  userId: string;
  packBalanceBefore: number | null;
  packBalanceAfter: number | null;
  idempotencyKey: string;
  actor: { kind: "user" | "admin" | "system" | "stripe"; userId?: string | null };
  actorEmail: string | null;
  mediaIds: string[];
  billingTransactionId: string | null;
  reversalOf: string | null;
  domain: string | null;
  invoice: {
    id: string;
    providerInvoiceId: string | null;
    url: string | null;
    amount: number;
    currency: string;
    billingReason: string | null;
  } | null;
}

/** Label and colour per type. Anything unknown shows as "Other". */
export const LEDGER_TYPE_STYLES: Record<string, { label: string; className: string }> = {
  USAGE: { label: "Usage", className: "bg-red-500/15 text-red-300" },
  REFUND: { label: "Refund", className: "bg-emerald-500/15 text-emerald-300" },
  PURCHASE: { label: "Purchase", className: "bg-emerald-500/15 text-emerald-300" },
  SUBSCRIPTION_GRANT: { label: "Subscription", className: "bg-blue-500/15 text-blue-300" },
  SUBSCRIPTION_ENDED: { label: "Plan ended", className: "bg-white/10 text-white/60" },
  CREDIT_PACK: { label: "Credit pack", className: "bg-amber-500/15 text-amber-300" },
  CREDIT_PACK_REFUND: { label: "Pack refunded", className: "bg-white/10 text-white/60" },
  BONUS: { label: "Bonus", className: "bg-violet-500/15 text-violet-300" },
  REFERRAL: { label: "Referral", className: "bg-amber-500/15 text-amber-300" },
  SIGNUP_GRANT: { label: "Welcome credits", className: "bg-violet-500/15 text-violet-300" },
  ADJUSTMENT: { label: "Adjustment", className: "bg-white/10 text-white/60" },
  FRAUD: { label: "Adjustment", className: "bg-white/10 text-white/60" },
  OTHER: { label: "Other", className: "bg-white/10 text-white/60" },
};

export const ledgerTypeStyle = (type: string) =>
  LEDGER_TYPE_STYLES[type] ?? LEDGER_TYPE_STYLES.OTHER;

/** The admin filter options, in the order they read best. */
export const LEDGER_FILTER_TYPES = [
  "USAGE",
  "REFUND",
  "SUBSCRIPTION_GRANT",
  "CREDIT_PACK",
  "CREDIT_PACK_REFUND",
  "SUBSCRIPTION_ENDED",
  "BONUS",
  "ADJUSTMENT",
  "FRAUD",
  "OTHER",
  "SIGNUP_GRANT",
] as const;

const MODEL_NAMES = new Map(
  [...IMAGE_MODELS, ...VIDEO_MODELS, ...AUDIO_MODELS, ...STUDIO_MODELS].map((m) => [
    m.id as string,
    m.name,
  ]),
);

/**
 * What people call an id: the catalog's (admin-editable) name, else the bundled one,
 * else the id made readable ("veo-3" → "Veo 3"). Components showing it should call
 * useCatalog() so they re-render when names load.
 */
export const modelName = (model: string) => {
  const id = normalizeModelId(model);
  return offeringName(
    id,
    MODEL_NAMES.get(id) ??
      id
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
  );
};

/** Where a project-linked row opens (clipping and video analysis). */
export function subjectHref(subject: LedgerRow["subject"]): string | null {
  if (!subject) return null;
  if (subject.model === "VideoClippingProject") return `/clipping-studio/${subject.id}`;
  if (subject.model === "VideoAnalysisProject") return `/video-analyzer/analyses/${subject.id}`;
  return null;
}

/** "−1,200" / "+300", from the amount's sign. */
export const signedCredits = (amount: number) =>
  `${amount < 0 ? "−" : "+"}${Math.abs(amount).toLocaleString()}`;
