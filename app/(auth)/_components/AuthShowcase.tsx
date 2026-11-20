"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** The four videos beside the sign-in form. Put each clip's URL in `videoUrl`. */
const SLIDES: {
  name: string;
  title: string;
  description: string;
  tags: [string, string];
  videoUrl: string;
}[] = [
  {
    name: "Gensu",
    title: "Gensu",
    description:
      "Swap characters, places and styles in any video, keeping its motion",
    tags: ["Motion kept", "Any character"],
    videoUrl: "",
  },
  {
    name: "Ads Studio",
    title: "Ads Studio",
    description: "Ready-to-run ads from a brief and your product photos",
    tags: ["Your products", "Many versions"],
    videoUrl: "",
  },
  {
    name: "Clipping Studio",
    title: "Clipping Studio",
    description:
      "Turn one long video into scroll-stopping clips for every feed",
    tags: ["Auto captions", "Every platform"],
    videoUrl: "",
  },
  {
    name: "AI Influencer",
    title: "AI Influencer",
    description: "A photoreal creator of your own, ready for any scene",
    tags: ["Photoreal", "Consistent face"],
    videoUrl: "",
  },
];

/** Without a video (or with reduced motion off), each slide shows this long. */
const STILL_MS = 6000;

/** Placeholder backdrops until the videos are set. */
const GRADIENTS = [
  "radial-gradient(120% 90% at 30% 20%, rgba(107,65,255,0.45), transparent 60%), #0d0d10",
  "radial-gradient(120% 90% at 70% 30%, rgba(234,75,255,0.35), transparent 60%), #0d0d10",
  "radial-gradient(120% 90% at 40% 70%, rgba(56,189,248,0.3), transparent 60%), #0d0d10",
  "radial-gradient(120% 90% at 60% 40%, rgba(250,204,21,0.25), transparent 60%), #0d0d10",
];

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const subscribeReducedMotion = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

/** Story-style showcase: the active bar fills while its video plays, then the next one starts. */
export function AuthShowcase() {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const slide = SLIDES[active];

  const next = () => {
    setProgress(0);
    setActive((i) => (i + 1) % SLIDES.length);
  };

  // No video: a timer drives the bar.
  useEffect(() => {
    if (slide.videoUrl || reducedMotion) return;
    const started = Date.now();
    const timer = setInterval(() => {
      const p = (Date.now() - started) / STILL_MS;
      if (p >= 1) next();
      else setProgress(p);
    }, 50);
    return () => clearInterval(timer);
  }, [active, slide.videoUrl, reducedMotion]);

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-2xl"
      style={{ background: GRADIENTS[active] }}
    >
      {slide.videoUrl && (
        <video
          ref={videoRef}
          key={slide.videoUrl}
          src={slide.videoUrl}
          autoPlay
          muted
          playsInline
          loop={reducedMotion}
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            if (v.duration) setProgress(v.currentTime / v.duration);
          }}
          onEnded={next}
          className="absolute inset-0 size-full object-cover"
        />
      )}

      {/* Keeps the text readable over any video. */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 lg:p-8">
        <div className="flex flex-wrap gap-2">
          {slide.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1.5 rounded-md bg-white/15 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm"
            >
              <Check className="size-3" strokeWidth={3} />
              {tag}
            </span>
          ))}
        </div>
        <h2
          className="text-4xl leading-none font-black tracking-tight text-white uppercase lg:text-5xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {slide.title}
        </h2>
        <p className="max-w-md text-sm text-white/70">{slide.description}</p>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {SLIDES.map((s, i) => (
            <button
              key={s.name}
              type="button"
              onClick={() => {
                setProgress(0);
                setActive(i);
              }}
              className="group flex flex-col gap-2 text-left"
              aria-current={i === active ? "true" : undefined}
            >
              <span className="h-[3px] w-full overflow-hidden rounded-full bg-white/25">
                <span
                  className="block h-full rounded-full bg-white"
                  style={{
                    width:
                      i < active
                        ? "100%"
                        : i === active
                          ? `${(reducedMotion ? 1 : progress) * 100}%`
                          : "0%",
                  }}
                />
              </span>
              <span
                className={cn(
                  "truncate text-xs font-medium transition-colors",
                  i === active
                    ? "text-white"
                    : "text-white/50 group-hover:text-white/80",
                )}
              >
                {s.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
