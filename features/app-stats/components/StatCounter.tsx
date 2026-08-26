"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { formatStatValue } from "../utils";

const DURATION_MS = 1200;

// useLayoutEffect warns during SSR; fall back to useEffect on the server.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Counts from 0 up to `value`.
 *
 * Starts at the final value so the first client render matches the
 * server-rendered HTML exactly — resetting to 0 happens in a layout effect,
 * before paint, so it is never visible and never trips hydration.
 */
export function StatCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const frameRef = useRef<number>(0);

  useIsomorphicLayoutEffect(() => {
    if (value <= 0 || prefersReducedMotion()) {
      setDisplay(value);
      return;
    }

    setDisplay(0);
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / DURATION_MS, 1);
      setDisplay(Math.round(easeOutExpo(progress) * value));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value]);

  return (
    <span
      // --font-display is declared in :root, not @theme, so Tailwind emits no
      // utility for it — it has to be applied directly.
      style={{ fontFamily: "var(--font-display)" }}
      className="gradient-text text-2xl font-black tracking-tighter tabular-nums sm:text-3xl lg:text-4xl"
    >
      {formatStatValue(display)}
    </span>
  );
}
