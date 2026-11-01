import { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/** Frame "thumbnails" on the film strips, in the analyzer's violet/magenta family. */
const FRAMES = [
  "linear-gradient(150deg, #4c1d95, #a855f7)",
  "linear-gradient(150deg, #701a75, #e879f9)",
  "linear-gradient(150deg, #1e1b4b, #8b5cf6)",
  "linear-gradient(150deg, #581c87, #f472b6)",
  "linear-gradient(150deg, #312e81, #c084fc)",
  "linear-gradient(150deg, #3b0764, #d946ef)",
];

const STRIPS: { top: string; tilt: number; speed: number; left: boolean; opacity: number }[] = [
  { top: "7%", tilt: -3, speed: 70, left: true, opacity: 0.55 },
  { top: "62%", tilt: 2.5, speed: 85, left: false, opacity: 0.4 },
];

/** The row of perforations along each edge of the film. */
function Sprockets() {
  return (
    <div
      className="h-2.5 w-full"
      style={{
        background:
          "repeating-linear-gradient(90deg, transparent 0 6px, rgba(216,180,254,0.35) 6px 14px, transparent 14px 22px)",
        backgroundClip: "content-box",
        padding: "2px 0",
      }}
    />
  );
}

/** A horizontal strip of film, doubled so the loop is seamless at -50%. */
function FilmStrip({ strip, index }: { strip: (typeof STRIPS)[number]; index: number }) {
  return (
    <div
      className="absolute -inset-x-[10%]"
      style={{ top: strip.top, opacity: strip.opacity, transform: `rotate(${strip.tilt}deg)` }}
    >
      <div
        className={cn(
          "flex w-max",
          strip.left ? "animate-analyzer-strip-left" : "animate-analyzer-strip-right",
        )}
        style={{ "--strip-speed": `${strip.speed}s` } as CSSProperties}
      >
        {Array.from({ length: 2 }, (_, half) => (
          <div key={half} className="flex flex-col bg-black/80">
            <Sprockets />
            <div className="flex gap-2 px-1">
            {Array.from({ length: 14 }, (_, k) => {
              const n = k + index * 3;
              return (
                <div
                  key={k}
                  className="relative h-24 w-40 overflow-hidden rounded-[3px]"
                  style={{ background: FRAMES[n % FRAMES.length] }}
                >
                  {/* A soft "subject" so each frame reads as a shot */}
                  <div
                    className="absolute size-14 rounded-full bg-white/20 blur-md"
                    style={{ left: `${20 + ((n * 17) % 50)}%`, top: `${15 + ((n * 11) % 35)}%` }}
                  />
                  <span className="absolute bottom-1 left-1.5 font-mono text-[9px] text-white/70">
                    {`00:${String((n * 8) % 60).padStart(2, "0")}`}
                  </span>
                </div>
              );
            })}
            </div>
            <Sprockets />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Detection boxes that flash on and off, like the model spotting things in frame. */
const BOXES: { left: string; top: string; w: number; h: number; label: string; delay: number }[] = [
  { left: "9%", top: "10%", w: 120, h: 78, label: "person · 0.98", delay: 0 },
  { left: "71%", top: "64%", w: 110, h: 70, label: "product · 0.94", delay: 1.5 },
  { left: "80%", top: "8%", w: 96, h: 64, label: "text: “SALE”", delay: 3 },
  { left: "14%", top: "66%", w: 104, h: 66, label: "close-up", delay: 4.5 },
];

const CHIPS: { label: string; left: string; top: string; delay: number }[] = [
  { label: "Scene 03 · 0:16–0:24", left: "5%", top: "44%", delay: 0 },
  { label: "✓ Prompt ready", left: "80%", top: "44%", delay: 1.6 },
  { label: "🎙 Dialogue detected", left: "24%", top: "34%", delay: 3.2 },
  { label: "Camera: slow push-in", left: "62%", top: "30%", delay: 4.6 },
  { label: "8s scenes", left: "44%", top: "84%", delay: 2.4 },
  { label: "Lighting: golden hour", left: "3%", top: "86%", delay: 5.8 },
];

/** Heights for the audio waveform, as % of its track. */
const WAVE = Array.from({ length: 64 }, (_, i) =>
  Math.round(30 + 60 * Math.abs(Math.sin(i * 0.55) * Math.cos(i * 0.21))),
);

/** Decorative moving backdrop for the Video Analyzer hero. */
export function AnalyzerHeroBackground({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {/* Faint analysis grid */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(196,181,253,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(196,181,253,0.35) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, black, transparent)",
        }}
      />

      {STRIPS.map((strip, i) => (
        <FilmStrip key={i} strip={strip} index={i} />
      ))}

      {/* Scanning beam sweeping across the whole hero */}
      <div className="animate-analyzer-sweep absolute inset-y-0 w-0" style={{ "--sweep-speed": "8s" } as CSSProperties}>
        <span className="absolute inset-y-0 -left-16 w-32 bg-gradient-to-r from-transparent via-fuchsia-400/15 to-transparent" />
        <span className="absolute inset-y-0 -left-px w-0.5 bg-fuchsia-300 shadow-[0_0_18px_4px_rgba(232,121,249,0.7)]" />
      </div>

      {BOXES.map((box, k) => (
        <div
          key={k}
          className="animate-analyzer-box absolute opacity-0"
          style={{ left: box.left, top: box.top, width: box.w, height: box.h, animationDelay: `${box.delay}s` }}
        >
          {/* Corner brackets */}
          <span className="absolute top-0 left-0 size-3 border-t-2 border-l-2 border-fuchsia-300" />
          <span className="absolute top-0 right-0 size-3 border-t-2 border-r-2 border-fuchsia-300" />
          <span className="absolute bottom-0 left-0 size-3 border-b-2 border-l-2 border-fuchsia-300" />
          <span className="absolute right-0 bottom-0 size-3 border-r-2 border-b-2 border-fuchsia-300" />
          <span className="absolute -top-5 left-0 rounded bg-fuchsia-500/80 px-1.5 py-0.5 font-mono text-[9px] font-semibold whitespace-nowrap text-white">
            {box.label}
          </span>
        </div>
      ))}

      {CHIPS.map((chip, k) => (
        <span
          key={k}
          className="animate-float-up absolute rounded-md border border-violet-300/30 bg-violet-500/20 px-2.5 py-1 font-mono text-[10px] font-semibold whitespace-nowrap text-violet-50 opacity-0 shadow-[0_0_16px_-4px_rgba(168,85,247,0.8)] backdrop-blur-sm"
          style={{ left: chip.left, top: chip.top, animationDelay: `${chip.delay}s` }}
        >
          {chip.label}
        </span>
      ))}

      {/* Audio waveform along the bottom */}
      <div className="absolute inset-x-[6%] bottom-4 flex h-10 items-end gap-[3px] rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 backdrop-blur-sm">
        {WAVE.map((h, k) => (
          <span
            key={k}
            className="animate-analyzer-bar flex-1 rounded-full bg-gradient-to-t from-violet-500 to-fuchsia-400 opacity-80"
            style={
              {
                height: `${h}%`,
                animationDelay: `${(k % 9) * 0.12}s`,
                "--bar-speed": `${1 + (k % 5) * 0.25}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
