// Error codes the backend sends as `{ error: { code } }` (see AllExceptionsFilter).
export const ApiErrorCode = {
  IP_BLOCKED: "IP_BLOCKED",
  ACCOUNT_SUSPENDED: "ACCOUNT_SUSPENDED",
} as const;

export const BLOCKED_PATH = "/blocked";

export function getApiErrorCode(body: unknown): string | undefined {
  return (body as { error?: { code?: string } } | null)?.error?.code;
}
