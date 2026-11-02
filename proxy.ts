import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  AUTH_COOKIE_OPTIONS,
  REFRESH_COOKIE,
  TOKEN_COOKIE,
  isTokenExpiring,
  refreshTokens,
} from "@/lib/auth-tokens";

/**
 * Runs before every page and /api request. If the access token is expired (or about
 * to be), swaps the refresh token for a new pair so the page or route handler below
 * sees a valid token — and the browser gets the new cookies.
 */
export async function proxy(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  if (!refreshToken || !isTokenExpiring(token)) {
    return NextResponse.next();
  }

  const tokens = await refreshTokens(refreshToken);

  if (!tokens) {
    // Session is over (refresh expired, account suspended, ...). Clear it so the
    // protected layout sends the user to /login.
    request.cookies.delete(TOKEN_COOKIE);
    request.cookies.delete(REFRESH_COOKIE);
    const res = NextResponse.next({ request: { headers: request.headers } });
    res.cookies.delete(TOKEN_COOKIE);
    res.cookies.delete(REFRESH_COOKIE);
    return res;
  }

  // Update this request's cookies so server components / route handlers see the new token...
  request.cookies.set(TOKEN_COOKIE, tokens.token);
  request.cookies.set(REFRESH_COOKIE, tokens.refreshToken);
  const res = NextResponse.next({ request: { headers: request.headers } });
  // ...and the browser's, for the next request.
  res.cookies.set(TOKEN_COOKIE, tokens.token, AUTH_COOKIE_OPTIONS);
  res.cookies.set(REFRESH_COOKIE, tokens.refreshToken, AUTH_COOKIE_OPTIONS);
  return res;
}

export const config = {
  // Everything except Next internals and static files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|mp4|webm|woff2?|ttf|otf|css|js|map)$).*)"],
};
