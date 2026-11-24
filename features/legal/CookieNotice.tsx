"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { OPEN_COOKIE_SETTINGS, readConsent, saveConsent } from "./consent";

/**
 * First visit: a small notice (we only use essential cookies and preference storage).
 * Choices are saved in the `consent` cookie; the footer's "Cookie settings" reopens it.
 * "Accept" and "Essential only" are equally prominent.
 */
export function CookieNotice() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(false);
  const [preferences, setPreferences] = useState(true);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const c = readConsent();
    if (!c) {
      const t = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    const show = () => {
      const c = readConsent();
      setPreferences(c?.preferences ?? true);
      setAnalytics(c?.analytics ?? false);
      setSettings(true);
      setOpen(true);
    };
    window.addEventListener(OPEN_COOKIE_SETTINGS, show);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS, show);
  }, []);

  if (!open) return null;

  const choose = (choice: { preferences: boolean; analytics: boolean }) => {
    saveConsent(choice);
    setOpen(false);
    setSettings(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookies"
      className="fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-xl rounded-2xl border border-white/10 bg-neutral-950/95 p-4 text-sm text-white/75 shadow-2xl backdrop-blur sm:bottom-5"
    >
      <p>
        smpl uses only <strong className="text-white">essential cookies</strong> to keep you signed in and secure, and
        local storage to remember your settings. No advertising or tracking.{" "}
        <Link href="/legal/cookies" className="underline">
          Cookie Policy
        </Link>
      </p>

      {settings && (
        <div className="mt-3 flex flex-col gap-2 rounded-xl border border-white/10 p-3 text-[13px]">
          <label className="flex items-center justify-between gap-3">
            <span>
              <span className="font-medium text-white">Essential</span> · sign-in, security, checkout
            </span>
            <input type="checkbox" checked disabled />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span>
              <span className="font-medium text-white">Preferences</span> · tours, recent searches, layout
            </span>
            <input type="checkbox" checked={preferences} onChange={(e) => setPreferences(e.target.checked)} />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span>
              <span className="font-medium text-white">Analytics</span> · none in use today
            </span>
            <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
          </label>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {settings ? (
          <button
            type="button"
            onClick={() => choose({ preferences, analytics })}
            className="h-9 flex-1 rounded-lg bg-white px-4 text-[13px] font-semibold text-black"
          >
            Save choices
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => choose({ preferences: true, analytics: true })}
              className="h-9 flex-1 rounded-lg bg-white px-4 text-[13px] font-semibold text-black"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => choose({ preferences: false, analytics: false })}
              className="h-9 flex-1 rounded-lg bg-white px-4 text-[13px] font-semibold text-black"
            >
              Essential only
            </button>
            <button
              type="button"
              onClick={() => setSettings(true)}
              className="h-9 rounded-lg border border-white/15 px-4 text-[13px] text-white/80 hover:bg-white/5"
            >
              Settings
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/** Footer / settings link that reopens the cookie choices. */
export function CookieSettingsLink({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS))}
    >
      Cookie settings
    </button>
  );
}
