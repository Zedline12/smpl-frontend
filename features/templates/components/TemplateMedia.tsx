"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Template, templateLayout } from "../types";

/** Plays the videos inside `ref` only while it's on screen. */
function usePlayWhenVisible<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        el.querySelectorAll("video").forEach((video) => {
          if (entry.isIntersecting) void video.play().catch(() => undefined);
          else video.pause();
        });
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

const videoProps = {
  muted: true,
  loop: true,
  playsInline: true,
  preload: "metadata" as const,
  className: "absolute inset-0 h-full w-full object-cover",
};

/** One loop of the before/after sweep, in ms. */
const SWEEP = {
  holdBefore: 900,
  toAfter: 2200,
  holdAfter: 1200,
  toBefore: 2200,
};
const CYCLE = SWEEP.holdBefore + SWEEP.toAfter + SWEEP.holdAfter + SWEEP.toBefore;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Bar position (0 = all "before", 100 = all "after") at a point of the loop. */
function sweepPosition(ms: number): number {
  let t = ms % CYCLE;
  if (t < SWEEP.holdBefore) return 0;
  t -= SWEEP.holdBefore;
  if (t < SWEEP.toAfter) return easeInOut(t / SWEEP.toAfter) * 100;
  t -= SWEEP.toAfter;
  if (t < SWEEP.holdAfter) return 100;
  t -= SWEEP.holdAfter;
  return (1 - easeInOut(t / SWEEP.toBefore)) * 100;
}

/**
 * Two videos in a loop: a bar sweeps to the right revealing the "after", holds, then
 * sweeps back to the left revealing the "before". Driven frame by frame from JS (no CSS
 * animation), so it runs everywhere; paused while off screen.
 */
function BeforeAfterLoop({ before, after, labels }: { before: string; after: string; labels: boolean }) {
  const ref = usePlayWhenVisible<HTMLDivElement>();
  const beforeRef = useRef<HTMLVideoElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const beforeLabelRef = useRef<HTMLSpanElement>(null);
  const afterLabelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    let frame = 0;
    let visible = true;
    let elapsed = 0;
    let last = performance.now();

    const paint = (x: number) => {
      // Left of the bar shows "after", right of it "before".
      const clip = `inset(0 0 0 ${x}%)`;
      if (beforeRef.current) {
        beforeRef.current.style.clipPath = clip;
        beforeRef.current.style.setProperty("-webkit-clip-path", clip);
      }
      if (barRef.current) {
        barRef.current.style.left = `${x}%`;
        // Fade the bar out at the edges so it doesn't sit on the frame.
        barRef.current.style.opacity = String(Math.min(1, x / 3, (100 - x) / 3));
      }
      if (beforeLabelRef.current) beforeLabelRef.current.style.opacity = String(Math.max(0, 1 - x / 50));
      if (afterLabelRef.current) afterLabelRef.current.style.opacity = String(Math.max(0, (x - 50) / 50));
    };

    const tick = (now: number) => {
      // Advance only while visible, so the loop resumes where it was.
      if (visible) elapsed += Math.min(now - last, 100);
      last = now;
      paint(sweepPosition(elapsed));
      frame = requestAnimationFrame(tick);
    };

    const observer =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { threshold: 0.1 })
        : null;
    observer?.observe(root);
    paint(0);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [ref]);

  const chip =
    "pointer-events-none absolute top-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white/90 uppercase backdrop-blur transition-opacity";

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <video src={after} {...videoProps} />
      <video ref={beforeRef} src={before} {...videoProps} style={{ clipPath: "inset(0 0 0 0%)", willChange: "clip-path" }} />
      <span
        ref={barRef}
        aria-hidden
        className="pointer-events-none absolute top-0 bottom-0 w-[3px] -translate-x-1/2 bg-white shadow-[0_0_14px_rgba(255,255,255,0.9)]"
        style={{ left: "0%", opacity: 0, willChange: "left" }}
      >
        <span className="absolute top-1/2 left-1/2 flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-black/40 text-[10px] font-bold text-white backdrop-blur">
          ‹›
        </span>
      </span>
      {labels && (
        <>
          <span ref={beforeLabelRef} className={cn(chip, "right-2")}>
            Before
          </span>
          <span ref={afterLabelRef} className={cn(chip, "left-2")} style={{ opacity: 0 }}>
            After
          </span>
        </>
      )}
    </div>
  );
}

/** Photos: crossfade between them with a slow pan. */
function PhotoGallery({ images, interval = 3500 }: { images: string[]; interval?: number }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (images.length < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % images.length), interval);
    return () => clearInterval(timer);
  }, [images.length, interval]);
  return (
    <div className="absolute inset-0 overflow-hidden">
      {images.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src + i}
          src={src}
          alt=""
          loading="lazy"
          className={cn(
            "template-kenburns absolute inset-0 h-full w-full object-cover transition-opacity duration-1000",
            i === index ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
    </div>
  );
}

function SingleVideo({ src }: { src: string }) {
  const ref = usePlayWhenVisible<HTMLDivElement>();
  return (
    <div ref={ref} className="absolute inset-0">
      <video src={src} {...videoProps} />
    </div>
  );
}

/** Shows a template the way its media suggests: before/after, photos or a single video. */
export function TemplateMedia({
  template,
  className,
  labels = true,
}: {
  template: Pick<Template, "images" | "videos">;
  className?: string;
  /** "Before"/"After" chips on before/after loops. */
  labels?: boolean;
}) {
  const layout = templateLayout(template);
  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-black", className)}>
      {layout === "before_after" && (
        <BeforeAfterLoop before={template.videos[0]} after={template.videos[1]} labels={labels} />
      )}
      {layout === "video" && <SingleVideo src={template.videos[0]} />}
      {layout === "photos" && <PhotoGallery images={template.images} />}
      {layout === "empty" && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-white/30">No media</div>
      )}
    </div>
  );
}
