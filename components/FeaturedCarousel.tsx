"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";

export interface FeaturedItem {
  title: string;
  description: string;
  video: string;
  poster?: string;
  href: string;
}

// ─── single card ─────────────────────────────────────────────────────────────

function FeaturedCard({ item }: { item: FeaturedItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handler = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // IntersectionObserver — play only when visible
  useEffect(() => {
    const el = videoRef.current;
    if (!el || reduceMotion) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [reduceMotion]);

  const inner = (
    <div className="flex flex-col gap-3 group cursor-pointer select-none">
      {/* 16:9 video */}
      <div
        className="relative overflow-hidden rounded-[12px] w-full"
        style={{ aspectRatio: "16/9" }}
      >
        {reduceMotion ? (
          item.poster && (
            <img
              src={item.poster}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )
        ) : (
          <video
            ref={videoRef}
            src={item.video}
            poster={item.poster}
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
        )}
        {/* dark overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300 rounded-[12px]" />
      </div>

      {/* text */}
      <div className="flex flex-col gap-1 px-0.5">
        <p
          className="text-[15px] font-extrabold uppercase text-foreground leading-tight"
          style={{ letterSpacing: "-0.02em" }}
        >
          {item.title}
        </p>
        <p className="text-[14px] text-muted-foreground truncate">
          {item.description}
        </p>
      </div>
    </div>
  );

  return item.href ? (
    <Link href={item.href} className="flex-shrink-0 w-[clamp(240px,72vw,480px)] sm:w-[360px] lg:w-[420px] block">
      {inner}
    </Link>
  ) : (
    <div className="flex-shrink-0 w-[clamp(240px,72vw,480px)] sm:w-[360px] lg:w-[420px]">
      {inner}
    </div>
  );
}

// ─── carousel ────────────────────────────────────────────────────────────────

export function FeaturedCarousel({ items }: { items: FeaturedItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    return () => el.removeEventListener("scroll", updateArrows);
  }, [updateArrows]);

  function scroll(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("a, div[class*='flex-shrink']") as HTMLElement | null;
    const step = (card?.offsetWidth ?? 360) + 20;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  return (
    <div className="relative w-full">
      {/* scrollable track */}
      <div
        ref={trackRef}
        className="flex gap-5 overflow-x-auto pb-2"
        style={{
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style>{`.fc-track::-webkit-scrollbar{display:none}`}</style>
        {items.map((item, i) => (
          <div key={i} style={{ scrollSnapAlign: "start" }}>
            <FeaturedCard item={item} />
          </div>
        ))}
        {/* right padding sentinel */}
        <div className="flex-shrink-0 w-4" />
      </div>

      {/* right fade hint */}
      <div
        className="pointer-events-none absolute top-0 right-0 h-full w-24"
        style={{
          background: "linear-gradient(to left, var(--background) 0%, transparent 100%)",
        }}
      />

      {/* prev arrow */}
      {canPrev && (
        <button
          type="button"
          onClick={() => scroll(-1)}
          aria-label="Previous"
          className="absolute left-2 top-[calc(50%-28px)] -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-opacity hover:opacity-100 opacity-80"
          style={{ background: "rgba(0,0,0,0.55)", border: "1px solid var(--border-subtle)" }}
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
      )}

      {/* next arrow */}
      {canNext && (
        <button
          type="button"
          onClick={() => scroll(1)}
          aria-label="Next"
          className="absolute right-2 top-[calc(50%-28px)] -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-opacity hover:opacity-100 opacity-80"
          style={{ background: "rgba(0,0,0,0.55)", border: "1px solid var(--border-subtle)" }}
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      )}
    </div>
  );
}
