"use client";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Megaphone,
  Pause,
  Play,
} from "lucide-react";
import type { Template } from "@/features/templates/types";
import { cn } from "@/lib/utils";

const SLIDE_MS = 3500;

const sideButton =
  "flex size-9 items-center justify-center rounded-full border border-white/10 bg-[#16161b] text-white/70 shadow-lg transition-colors hover:text-white disabled:opacity-30";

/**
 * The top of Ads Studio Home: a framed card cycling through published ad templates,
 * small round controls around it, and the two-line headline.
 */
export function AdsHero({ templates }: { templates: Template[] }) {
  const slides = templates
    .map((t) => t.images[0] ?? null)
    .filter((url): url is string => !!url)
    .slice(0, 8);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;
  const current = count ? index % count : 0;

  useEffect(() => {
    if (paused || count < 2) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;
    const id = window.setInterval(() => setIndex((i) => i + 1), SLIDE_MS);
    return () => window.clearInterval(id);
  }, [paused, count]);

  const step = (delta: number) =>
    setIndex((i) => (i + delta + count) % Math.max(count, 1));

  return (
    <section className="flex w-full flex-col items-center gap-5 pt-6">
      <div className="relative w-full max-w-[26rem] px-12 sm:px-14">
        {/* Left controls */}
        <div className="absolute top-3 left-0 flex flex-col items-center gap-3">
          <span className="flex flex-col items-center gap-0.5 rounded-xl border border-white/10 bg-[#16161b] px-2 py-1.5 text-[9px] font-semibold tracking-wider text-white/70 uppercase shadow-lg">
            <Megaphone className="text-primary size-3.5" />
            Ads
          </span>
          <button
            type="button"
            aria-label="Previous ad"
            onClick={() => step(-1)}
            disabled={count < 2}
            className={sideButton}
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Next ad"
            onClick={() => step(1)}
            disabled={count < 2}
            className={sideButton}
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* The framed card */}
        <div className="rounded-[30px] border border-white/10 bg-gradient-to-b from-[#26262e] to-[#121216] p-2 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.95)]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-black">
            {count ? (
              slides.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={url}
                  src={url}
                  alt=""
                  className={cn(
                    "absolute inset-0 size-full object-cover transition-opacity duration-700",
                    i === current ? "opacity-100" : "opacity-0",
                  )}
                />
              ))
            ) : (
              <div
                className="flex size-full items-center justify-center"
                style={{
                  background:
                    "radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--color-primary) 55%, transparent), transparent 60%), radial-gradient(circle at 80% 90%, color-mix(in srgb, var(--color-secondary) 45%, transparent), transparent 55%), #0d0d11",
                }}
              >
                <Megaphone
                  className="size-14 text-white/80"
                  strokeWidth={1.5}
                />
              </div>
            )}
            <span className="pointer-events-none absolute inset-0 rounded-[24px] ring-1 ring-white/10 ring-inset" />
          </div>
        </div>

        {/* Right control */}
        <div className="absolute top-3 right-0 flex flex-col items-center gap-3">
          <button
            type="button"
            aria-label={paused ? "Play slideshow" : "Pause slideshow"}
            onClick={() => setPaused((p) => !p)}
            disabled={count < 2}
            className={sideButton}
          >
            {paused ? (
              <Play className="size-3.5" />
            ) : (
              <Pause className="size-3.5" />
            )}
          </button>
          {count > 1 && (
            <span className="text-[10px] font-medium text-white/40 tabular-nums">
              {current + 1}/{count}
            </span>
          )}
        </div>
      </div>

      <h1
        className="flex flex-col items-center gap-1.5 text-center text-xl leading-none font-black tracking-tight uppercase sm:text-2xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        <span className="bg-primary rounded-sm px-2 py-1 text-white">
          Brief it, brand it
        </span>
        <span className="text-white">We make the ads</span>
      </h1>
    </section>
  );
}
