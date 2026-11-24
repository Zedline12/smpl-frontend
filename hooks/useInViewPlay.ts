"use client";

import { useEffect, useRef, useState } from "react";

/**
 * For muted looping previews: plays the video only while it's on screen and pauses
 * it when it scrolls away, so a grid doesn't download and decode every video at once.
 * Returns the ref for the <video> and whether it has been on screen yet (use it to
 * switch preload from "none" once the user can see it).
 */
export function useInViewPlay<T extends HTMLVideoElement>(enabled = true, threshold = 0.25) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    if (typeof IntersectionObserver === "undefined") {
      el.play().catch(() => {});
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold, rootMargin: "100px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [enabled, threshold]);

  return { ref, seen };
}
