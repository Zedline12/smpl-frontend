"use server";

import { authLoginSchema } from "../schemas/auth.schema";
import { z } from "zod";

import { cookies, headers } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { fetchWithToken } from "@/lib/fetcher";
import { clientContextHeaders } from "@/lib/client-ip";
import { AUTH_COOKIE_OPTIONS } from "@/lib/auth-tokens";
import { ApiErrorCode, BLOCKED_PATH, getApiErrorCode } from "@/lib/api-errors";
const SUSPENDED_COOKIE = "suspended_token";

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  cookieStore.delete("refresh_token");
  cookieStore.delete(SUSPENDED_COOKIE);
  redirect(`/sign-in`);
}

/** How a sign-in attempt ended: signed in (go to `redirectTo`), or an error to show. */
export type SignInResult =
  /** `isNewUser`: an email code just created the account (its avatar is made next). */
  | { ok: true; redirectTo: string | null; isNewUser?: boolean }
  | { ok: false; message: string };

/**
 * Stores the session from a sign-in response, or turns its error into a result.
 * Suspended and blocked accounts are sent to their pages (`redirectTo`).
 */
async function finishSignIn(
  response: Response,
  fallbackError: string,
): Promise<SignInResult> {
  const result = await response.json().catch(() => null);
  const errorCode = getApiErrorCode(result);
  if (errorCode === ApiErrorCode.IP_BLOCKED) {
    return { ok: true, redirectTo: BLOCKED_PATH };
  }
  const suspendedToken = result?.error?.details?.suspendedToken;
  if (errorCode === ApiErrorCode.ACCOUNT_SUSPENDED && suspendedToken) {
    await startSuspendedSession(suspendedToken);
    return { ok: true, redirectTo: "/suspended" };
  }
  if (!response.ok || !result?.data?.token) {
    const message = result?.message ?? result?.error?.message;
    return { ok: false, message: typeof message === "string" ? message : fallbackError };
  }
  const { token, refreshToken } = result.data;
  const cookieStore = await cookies();
  cookieStore.delete(SUSPENDED_COOKIE);
  cookieStore.set("token", token, AUTH_COOKIE_OPTIONS);
  cookieStore.set("refresh_token", refreshToken, AUTH_COOKIE_OPTIONS);
  return { ok: true, redirectTo: null, isNewUser: !!result.data.isNewUser };
}

/** Emails a 6-digit sign-in code (for new emails too). */
export async function requestLoginCode(
  email: string,
  captchaToken: string,
): Promise<{ ok: true; resendInSeconds: number } | { ok: false; message: string }> {
  try {
    const requestHeaders = await headers();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/email/code`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...clientContextHeaders(requestHeaders) },
      body: JSON.stringify({ email, captchaToken }),
    });
    const result = await response.json().catch(() => null);
    if (getApiErrorCode(result) === ApiErrorCode.IP_BLOCKED) redirect(BLOCKED_PATH);
    if (!response.ok) {
      const message = result?.message;
      return { ok: false, message: typeof message === "string" ? message : "Couldn't send the code. Try again." };
    }
    return { ok: true, resendInSeconds: result?.data?.resendInSeconds ?? result?.resendInSeconds ?? 30 };
  } catch (error) {
    unstable_rethrow(error);
    return { ok: false, message: "Couldn't send the code. Try again." };
  }
}

/** Signs in with the emailed code; an email with no account gets one. */
export async function verifyLoginCode(
  email: string,
  code: string,
  refToken?: string | null,
): Promise<SignInResult> {
  try {
    const requestHeaders = await headers();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/email/code/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...clientContextHeaders(requestHeaders) },
      body: JSON.stringify({ email, code, ...(refToken ? { refToken } : {}) }),
    });
    return await finishSignIn(response, "That code didn't work. Try again.");
  } catch (error) {
    unstable_rethrow(error);
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}

/**
 * Stores the short-lived token the backend gives a suspended user. It only lets
 * them open a support ticket from /suspended — it is not a login session.
 */
export async function startSuspendedSession(suspendedToken: string) {
  if (!suspendedToken) return;
  const cookieStore = await cookies();
  cookieStore.delete("token");
  cookieStore.delete("refresh_token");
  cookieStore.set(SUSPENDED_COOKIE, suspendedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });
}
/** Email + password sign-in. */
export async function login(
  unsafeData: z.infer<typeof authLoginSchema>,
  captchaToken: string,
): Promise<SignInResult> {
  const { success, data } = authLoginSchema.safeParse(unsafeData);
  if (!success) {
    return { ok: false, message: "Enter your email and password." };
  }
  if (!captchaToken) {
    return { ok: false, message: "Captcha verification is required" };
  }
  try {
    const requestHeaders = await headers();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/email/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...clientContextHeaders(requestHeaders) },
      body: JSON.stringify({ ...data, captchaToken }),
    });
    return await finishSignIn(response, "Invalid email or password");
  } catch (error) {
    unstable_rethrow(error);
    console.error("Login error:", error);
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}

export async function exchangeToken(exchangeToken: string) {
  try {
    const response = await fetchWithToken("/auth/exchange-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ exchangeToken }),
    });

    if (!response.ok) {
      console.log("error");
      return { error: true, message: "Token exchange failed" };
    }

    const result = await response.json();
    const { token, refreshToken } = result.data;
    const cookieStore = await cookies();
    cookieStore.set("token", token, AUTH_COOKIE_OPTIONS);

    cookieStore.set("refresh_token", refreshToken, AUTH_COOKIE_OPTIONS);
    return { success: true };
  } catch (err) {
    console.log(err);
  }
}

export async function confirmEmail(hash: string) {
  const response = await fetchWithToken("/auth/email/confirm-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ hash }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return { error: true, message: errorData.message || "Verification failed" };
  }

  const result = await response.json();
  const { token, refreshToken } = result.data;

  const cookieStore = await cookies();
  cookieStore.set("token", token, AUTH_COOKIE_OPTIONS);

  cookieStore.set("refresh_token", refreshToken, AUTH_COOKIE_OPTIONS);

  return { success: true };
}
