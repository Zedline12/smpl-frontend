/**
 * Friendly wording for a failed generation. New failures carry a code ("E1004") and a
 * title from the backend (smpl-backend src/common/errors/error-codes.ts); older ones
 * only have a category, which used to be shown raw ("CONTENT_POLICY").
 */
export type FailureMeta = {
  code?: string | null;
  title?: string | null;
  category?: string | null;
  clientMessage?: string | null;
} | null | undefined;

const TITLE_BY_CATEGORY: Record<string, string> = {
  CONTENT_POLICY: "Blocked by the safety filter",
  INVALID_INPUT: "The model couldn't use these settings",
  RETRYABLE: "Model temporarily unavailable",
  QUOTA_EXCEEDED: "Model busy",
  AUTH: "Model temporarily unavailable",
  UNKNOWN: "Something went wrong",
};

export function failureTitle(meta: FailureMeta): string {
  return meta?.title || (meta?.category && TITLE_BY_CATEGORY[meta.category]) || "Generation failed";
}

export function failureMessage(meta: FailureMeta): string {
  return meta?.clientMessage || "Something went wrong during generation. Your credits were refunded.";
}

/** "Error code E1004", for users to quote to support; null for older failures. */
export function failureCodeLabel(code?: string | null): string | null {
  return code ? `Error code ${code}` : null;
}
