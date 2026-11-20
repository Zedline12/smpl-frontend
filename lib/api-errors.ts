// Error codes the backend sends as `{ error: { code } }` (see AllExceptionsFilter).
export const ApiErrorCode = {
  IP_BLOCKED: "IP_BLOCKED",
  ACCOUNT_SUSPENDED: "ACCOUNT_SUSPENDED",
  /** A charge was refused for a low balance (opens the "out of credits" popup). */
  INSUFFICIENT_CREDITS: "INSUFFICIENT_CREDITS",
  /** Sign-up refused: the email looks throwaway or bot-made (shown as the message). */
  EMAIL_NOT_ALLOWED: "EMAIL_NOT_ALLOWED",
} as const;

export const BLOCKED_PATH = "/blocked";

export function getApiErrorCode(body: unknown): string | undefined {
  return (body as { error?: { code?: string } } | null)?.error?.code;
}

/**
 * A refused charge, from the backend body or a proxy's re-wrap of it (`{ error: "…" }`).
 * Returns the credits it needed (null when not said), or undefined when it isn't one.
 */
export function insufficientCreditsFrom(body: unknown): { required: number | null } | undefined {
  const b = body as { message?: unknown; error?: unknown } | null;
  if (!b || typeof b !== "object") return undefined;
  const error = b.error as { code?: string; details?: { details?: { required?: unknown }; required?: unknown } } | string | undefined;
  const byCode = typeof error === "object" && error?.code === ApiErrorCode.INSUFFICIENT_CREDITS;
  const text = [b.message, typeof error === "string" ? error : undefined].filter((v) => typeof v === "string").join(" ");
  if (!byCode && !/insufficient credits/i.test(text)) return undefined;
  const details = typeof error === "object" ? error?.details : undefined;
  const required = Number(details?.details?.required ?? details?.required);
  return { required: Number.isFinite(required) && required > 0 ? required : null };
}
