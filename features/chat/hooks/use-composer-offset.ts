"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/** Routes under (protected) that render a `position: fixed` prompt composer. */
const COMPOSER_ROUTES = ["/home"];

/** Set by PromptComposer for the driver.js tour — reused here as a stable hook. */
const COMPOSER_ELEMENT_ID = "tour-prompt-composer";

const GAP = 12;

/**
 * Returns a px `bottom` offset that clears the fixed prompt composer, or `null`
 * when there is nothing to clear. Measured rather than hardcoded because the
 * composer grows when focused and its height varies by selected model.
 */
export function useComposerOffset(): number | null {
  const pathname = usePathname();
  const [offset, setOffset] = useState<number | null>(null);

  useEffect(() => {
    if (!COMPOSER_ROUTES.includes(pathname)) {
      setOffset(null);
      return;
    }

    let frame = 0;
    let observer: ResizeObserver | null = null;
    let handleResize: (() => void) | null = null;

    const attach = () => {
      const element = document.getElementById(COMPOSER_ELEMENT_ID);
      if (!element) {
        // The page may not have committed yet on a client-side navigation.
        frame = requestAnimationFrame(attach);
        return;
      }

      handleResize = () => {
        const rect = element.getBoundingClientRect();
        // Only lift when the composer spans the viewport — that is the mobile
        // full-width case. From `sm` up it is centred at half width and the
        // button never reaches it.
        setOffset(
          rect.width > window.innerWidth * 0.9
            ? window.innerHeight - rect.top + GAP
            : null,
        );
      };

      handleResize();
      observer = new ResizeObserver(handleResize);
      observer.observe(element);
      window.addEventListener("resize", handleResize);
    };

    attach();

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      if (handleResize) window.removeEventListener("resize", handleResize);
    };
  }, [pathname]);

  return offset;
}
