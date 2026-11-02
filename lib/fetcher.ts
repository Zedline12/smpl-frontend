// lib/fetcher.ts
import { RequestInit } from "next/dist/server/web/spec-extension/request";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiErrorCode, BLOCKED_PATH, getApiErrorCode } from "@/lib/api-errors";
import {
  AUTH_COOKIE_OPTIONS,
  REFRESH_COOKIE,
  TOKEN_COOKIE,
  refreshTokens,
} from "@/lib/auth-tokens";

function send(url: string, options: RequestInit, accessToken?: string) {
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    ...options,
    headers: {
      ...options.headers,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    credentials: "include",
  });
}

/**
 * Server-side fetch to the backend with the user's token.
 * proxy.ts refreshes expired tokens before the request reaches here; if the backend
 * still answers 401, this refreshes once and retries.
 */
export async function fetchWithToken(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const res = await sendWithRefresh(url, options);
  await redirectIfBlocked(res);
  return res;
}

async function sendWithRefresh(url: string, options: RequestInit): Promise<Response> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(TOKEN_COOKIE)?.value;

  const res = await send(url, options, accessToken);
  if (res.status !== 401) return res;

  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return res;

  const tokens = await refreshTokens(refreshToken);
  if (!tokens) return res;

  // Cookies can be written in route handlers and server actions, but not while
  // rendering a page — there proxy.ts has already handled it, so ignore the error.
  try {
    cookieStore.set(TOKEN_COOKIE, tokens.token, AUTH_COOKIE_OPTIONS);
    cookieStore.set(REFRESH_COOKIE, tokens.refreshToken, AUTH_COOKIE_OPTIONS);
  } catch {}

  return send(url, options, tokens.token);
}

/**
 * Sends the user to /blocked when the backend rejects their IP. Works in pages and
 * server actions directly; route handlers re-throw it via `unstable_rethrow`, and
 * ApiRedirectWatcher follows it on the client.
 */
async function redirectIfBlocked(res: Response) {
  if (res.status !== 403) return;
  const body = await res.clone().json().catch(() => null);
  if (getApiErrorCode(body) === ApiErrorCode.IP_BLOCKED) {
    redirect(BLOCKED_PATH);
  }
}
