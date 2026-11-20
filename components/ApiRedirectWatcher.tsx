"use client";

import { useEffect } from "react";
import { BLOCKED_PATH, insufficientCreditsFrom } from "@/lib/api-errors";
import { useOutOfCreditsStore } from "@/stores/useOutOfCreditsStore";

declare global {
  interface Window {
    __apiRedirectWatcher?: boolean;
  }
}

/** Whether a request is worth reading for a refused charge (charges are never GETs). */
function mayBeCharge(args: Parameters<typeof fetch>, res: Response): boolean {
  if (!res.headers.get("content-type")?.includes("application/json")) return false;
  if (!res.ok) return true;
  const [input, init] = args;
  const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
  // Many /api proxies answer the backend's error with a 200, so read mutations too.
  return method !== "GET" && method !== "HEAD";
}

/**
 * Watches every fetch, once, from the root layout:
 * - a server-side `fetchWithToken` that hit a blocked IP inside an /api route answers with
 *   a redirect to /blocked, which `fetch` follows silently: move the whole page there;
 * - a charge refused for a low balance (`INSUFFICIENT_CREDITS`) opens the buy-credits popup.
 */
export function ApiRedirectWatcher() {
  useEffect(() => {
    if (window.__apiRedirectWatcher) return;
    window.__apiRedirectWatcher = true;

    const originalFetch = window.fetch.bind(window);
    window.fetch = async (...args) => {
      const res = await originalFetch(...args);
      try {
        if (res.redirected) {
          const url = new URL(res.url);
          if (
            url.origin === window.location.origin &&
            url.pathname === BLOCKED_PATH &&
            window.location.pathname !== BLOCKED_PATH
          ) {
            window.location.assign(BLOCKED_PATH);
          }
        }
        if (mayBeCharge(args, res)) {
          // A clone: the caller still reads the body itself.
          void res
            .clone()
            .json()
            .then((body) => {
              const refused = insufficientCreditsFrom(body);
              if (refused) useOutOfCreditsStore.getState().show(refused.required);
            })
            .catch(() => {});
        }
      } catch {}
      return res;
    };
  }, []);

  return null;
}
