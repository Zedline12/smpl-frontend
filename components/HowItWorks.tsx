"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ─── types ────────────────────────────────────────────────────────────────────

export interface HowItWorksMediaItem {
  src: string;
  label?: string;
  highlight?: boolean;
}

export interface HowItWorksSlide {
  eyebrow: string;
  title: string;
  description: string;
  layout: "single" | "beforeAfter" | "grid";
  thumbnail: string;
  media: HowItWorksMediaItem[];
}

// ─── MediaTile ────────────────────────────────────────────────────────────────

function MediaTile({
  item,
  aspectRatio,
  isActive,
  isNext,
}: {
  item: HowItWorksMediaItem;
  aspectRatio: "16/9" | "9/16";
  isActive: boolean;
  isNext: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduceMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const el = videoRef.current;
    if (!el || reduceMotion) return;
    if (isActive) {
      el.play().catch(() => {});
    } else {
      el.pause();
      el.currentTime = 0;
    }
  }, [isActive, reduceMotion]);

  const isImage = item.src && /\.(png|jpe?g|gif|webp|avif|svg)(\?|$)/i.test(item.src);
  const preload = isActive ? "auto" : isNext ? "metadata" : "none";

  return (
    <div
      className="relative overflow-hidden flex-shrink-0"
      style={{ aspectRatio, borderRadius: 14 }}
    >
      {item.src ? (
        isImage ? (
          <img src={item.src} alt={item.label ?? ""} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <video
            ref={videoRef}
            src={item.src}
            muted
            loop
            playsInline
            autoPlay={isActive && !reduceMotion}
            preload={preload}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )
      ) : (
        <div className="absolute inset-0" style={{ backgroundColor: "var(--bg-elevated)" }} />
      )}

      {/* label pill */}
      {item.label && (
        <span
          className="absolute top-2 left-2 text-[12px] font-semibold px-2.5 py-1 rounded-[8px] text-white"
          style={
            item.highlight
              ? { backgroundColor: "var(--purple-500)" }
              : { backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }
          }
        >
          {item.label}
        </span>
      )}
    </div>
  );
}

// ─── slide media layouts ──────────────────────────────────────────────────────

function SlideMedia({
  slide,
  isActive,
  isNext,
}: {
  slide: HowItWorksSlide;
  isActive: boolean;
  isNext: boolean;
}) {
  if (slide.layout === "single") {
    return (
      <div className="flex justify-center w-full">
        <div className="w-full max-w-[500px]">
          <MediaTile item={slide.media[0]} aspectRatio="16/9" isActive={isActive} isNext={isNext} />
        </div>
      </div>
    );
  }

  if (slide.layout === "beforeAfter") {
    return (
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center w-full">
        {slide.media.slice(0, 2).map((item, i) => (
          <div key={i} className="w-full max-w-[500px]">
            <MediaTile item={item} aspectRatio="16/9" isActive={isActive} isNext={isNext} />
          </div>
        ))}
      </div>
    );
  }

  // grid — 4 portrait tiles
  return (
    <div
      className="flex gap-3 justify-center overflow-x-auto pb-1"
      style={{ scrollbarWidth: "none" }}
    >
      {slide.media.slice(0, 4).map((item, i) => (
        <div key={i} className="flex-shrink-0" style={{ width: 160 }}>
          <MediaTile item={item} aspectRatio="9/16" isActive={isActive} isNext={isNext} />
        </div>
      ))}
    </div>
  );
}

// ─── SlideNav ─────────────────────────────────────────────────────────────────

function SlideNav({
  slides,
  current,
  onChange,
}: {
  slides: HowItWorksSlide[];
  current: number;
  onChange: (i: number) => void;
}) {
  const n = slides.length;
  const prev = (current - 1 + n) % n;
  const next = (current + 1) % n;

  const thumbSrc = (i: number) => slides[i].thumbnail || slides[i].media[0]?.src || "";

  function Thumb({ index, active }: { index: number; active: boolean }) {
    const src = thumbSrc(index);
    return (
      <button
        type="button"
        onClick={() => onChange(index)}
        className="flex-shrink-0 overflow-hidden transition-all duration-200"
        style={{
          width: active ? 84 : 40,
          height: active ? 44 : 28,
          borderRadius: 999,
          opacity: active ? 1 : 0.6,
          border: active ? "2px solid white" : "2px solid transparent",
          outline: "none",
        }}
        aria-label={`Go to slide ${index + 1}`}
        aria-current={active ? "true" : undefined}
      >
        {src ? (
          <img src={src} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" style={{ backgroundColor: "var(--bg-elevated)" }} />
        )}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* prev */}
      <button
        type="button"
        onClick={() => onChange(prev)}
        className="w-8 h-8 rounded-full border flex items-center justify-center transition-colors hover:bg-white/10"
        style={{ borderColor: "var(--border-default)" }}
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-4 h-4 text-white" />
      </button>

      {/* thumbnail tray */}
      <div
        className="flex items-center gap-2 px-2 py-1 rounded-full"
        style={{ backgroundColor: "var(--bg-card)" }}
      >
        <Thumb index={prev} active={false} />
        <Thumb index={current} active />
        <Thumb index={next} active={false} />
      </div>

      {/* next */}
      <button
        type="button"
        onClick={() => onChange(next)}
        className="w-8 h-8 rounded-full border flex items-center justify-center transition-colors hover:bg-white/10"
        style={{ borderColor: "var(--border-default)" }}
        aria-label="Next slide"
      >
        <ChevronRight className="w-4 h-4 text-white" />
      </button>
    </div>
  );
}

// ─── HowItWorks ───────────────────────────────────────────────────────────────

export function HowItWorks({ slides }: { slides: HowItWorksSlide[] }) {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  const [hovered, setHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduceMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const go = useCallback(
    (next: number) => {
      setVisible(false);
      setTimeout(() => {
        setCurrent(next);
        setVisible(true);
      }, 150);
    },
    []
  );

  // keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go((current - 1 + slides.length) % slides.length);
      if (e.key === "ArrowRight") go((current + 1) % slides.length);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [current, go, slides.length]);

  // auto-advance
  useEffect(() => {
    if (reduceMotion || hovered) return;
    timerRef.current = setTimeout(() => go((current + 1) % slides.length), 6000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, hovered, reduceMotion, go, slides.length]);

  const slide = slides[current];
  const nextIndex = (current + 1) % slides.length;

  return (
    <div
      className="w-full h-full overflow-y-auto flex flex-col items-center"
      style={{ paddingTop: 120, paddingBottom: 60, paddingLeft: 16, paddingRight: 16 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <style>{`
        @keyframes hiw-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        className="w-full max-w-[1000px] flex flex-col items-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(8px)",
          transition: reduceMotion ? "none" : "opacity 300ms ease, transform 300ms ease",
        }}
      >
        {/* media */}
        <div className="w-full">
          <SlideMedia slide={slide} isActive isNext={false} />
          {/* preload next */}
          <div className="hidden">
            <SlideMedia slide={slides[nextIndex]} isActive={false} isNext />
          </div>
        </div>

        {/* text */}
        <div className="flex flex-col items-center text-center mt-10 gap-3 px-4">
          <span
            className="text-[11px] font-bold uppercase"
            style={{ letterSpacing: "0.06em", color: "var(--purple-500)" }}
          >
            {slide.eyebrow}
          </span>
          <h2
            className="text-[24px] sm:text-[32px] font-extrabold uppercase text-white leading-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            {slide.title}
          </h2>
          <p
            className="text-[16px] max-w-[520px]"
            style={{ color: "var(--fg-3)", lineHeight: 1.5 }}
          >
            {slide.description}
          </p>
        </div>

        {/* nav */}
        <div className="mt-10">
          <SlideNav slides={slides} current={current} onChange={go} />
        </div>
      </div>
    </div>
  );
}
