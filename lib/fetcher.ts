// lib/fetcher.ts
import { RequestInit } from "next/dist/server/web/spec-extension/request";
import { cookies } from "next/headers";
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
