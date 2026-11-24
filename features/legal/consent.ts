"use client";

/**
 * Cookie / storage consent, kept in a first-party `consent` cookie (12 months).
 * smpl uses only strictly necessary cookies and preference storage today; anything
 * non-essential added later (analytics, pixels) must check hasConsent("analytics").
 */
export type ConsentCategory = "preferences" | "analytics";
export interface Consent {
  v: 1;
  preferences: boolean;
  analytics: boolean;
  at: string;
}

export const CONSENT_COOKIE = "consent";
const MAX_AGE = 365 * 24 * 3600;
export const OPEN_COOKIE_SETTINGS = "smpl:open-cookie-settings";

export function readConsent(): Consent | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${CONSENT_COOKIE}=`))
    ?.slice(CONSENT_COOKIE.length + 1);
  if (!raw) return null;
  try {
    const c = JSON.parse(decodeURIComponent(raw));
    return c?.v === 1 ? (c as Consent) : null;
  } catch {
    return null;
  }
}

export function saveConsent(choice: Pick<Consent, "preferences" | "analytics">): Consent {
  const c: Consent = { v: 1, ...choice, at: new Date().toISOString() };
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(c))}; path=/; max-age=${MAX_AGE}; samesite=lax${location.protocol === "https:" ? "; secure" : ""}`;
  window.dispatchEvent(new CustomEvent("smpl:consent-changed", { detail: c }));
  return c;
}

/** Whether a non-essential category may run. Essential things never need to ask. */
export function hasConsent(category: ConsentCategory): boolean {
  return !!readConsent()?.[category];
}

/** Opens the cookie settings panel (footer link, settings page). */
export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS));
}
