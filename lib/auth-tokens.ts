// Token helpers shared by proxy.ts (runs before every request) and fetchWithToken.
// Keep this free of `next/headers` so the proxy can import it.

export const TOKEN_COOKIE = "token";
export const REFRESH_COOKIE = "refresh_token";

/** Matches the backend's refresh-token lifetime (AUTH_REFRESH_TOKEN_EXPIRES_IN=7d). */
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE,
};

export interface AuthTokens {
  token: string;
  refreshToken: string;
}

/**
 * True when the JWT expires within `skewSeconds` (or can't be read).
 * Only decodes the payload — the backend still verifies the signature.
 */
export function isTokenExpiring(token: string | undefined, skewSeconds = 60): boolean {
  if (!token) return true;
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(payload.length / 4) * 4, "=")),
    );
    if (typeof json.exp !== "number") return false;
    return json.exp * 1000 <= Date.now() + skewSeconds * 1000;
  } catch {
    return true;
  }
}

// Parallel requests that all see an expired token share one refresh call.
const inFlight = new Map<string, Promise<AuthTokens | null>>();

/** Exchanges a refresh token for a new token pair. Returns null if the session is over. */
export function refreshTokens(refreshToken: string): Promise<AuthTokens | null> {
  const existing = inFlight.get(refreshToken);
  if (existing) return existing;

  const promise = (async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      });
      if (!res.ok) return null;
      const json = await res.json();
      const data = json?.data ?? json;
      if (!data?.token || !data?.refreshToken) return null;
      return { token: data.token as string, refreshToken: data.refreshToken as string };
    } catch {
      return null;
    }
  })();

  inFlight.set(refreshToken, promise);
  // Keep the result briefly so requests arriving right after still reuse it.
  promise.finally(() => setTimeout(() => inFlight.delete(refreshToken), 10_000));
  return promise;
}
