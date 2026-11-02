"use client";

import { useEffect } from "react";
import { BLOCKED_PATH } from "@/lib/api-errors";

declare global {
  interface Window {
    __apiRedirectWatcher?: boolean;
  }
}

/**
 * When a server-side `fetchWithToken` hits a blocked IP inside an /api route, the route
 * answers with a redirect to /blocked. `fetch` follows redirects silently, so this
 * watches for that and moves the whole page there. Mounted once in the root layout.
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
      } catch {}
      return res;
    };
  }, []);

  return null;
}
