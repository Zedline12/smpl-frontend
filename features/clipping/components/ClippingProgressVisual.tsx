import { CSSProperties } from "react";
import { Clock, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

/** Frame colors along the film strip. */
const FRAMES = [
  "linear-gradient(160deg, #1d4ed8, #0ea5e9)",
  "linear-gradient(160deg, #312e81, #6366f1)",
  "linear-gradient(160deg, #0e7490, #22d3ee)",
  "linear-gradient(160deg, #1e3a8a, #38bdf8)",
  "linear-gradient(160deg, #4338ca, #06b6d4)",
  "linear-gradient(160deg, #0f172a, #3b82f6)",
];

const STEPS = ["Watching your video…", "Finding viral moments…", "Cutting the clips…", "Adding the finishing touches…"];

/** Finished clips popping out of the cut, with their tilt and timing. */
const POPS = [
  { left: "50%", tilt: "-10deg", delay: 0 },
  { left: "50%", tilt: "8deg", delay: 1.2 },
  { left: "50%", tilt: "-4deg", delay: 2.4 },
];

const SPARKS = [
  { sx: "-14px", sy: "-10px", delay: 0 },
  { sx: "12px", sy: "-12px", delay: 0.3 },
  { sx: "-10px", sy: "10px", delay: 0.6 },
  { sx: "14px", sy: "8px", delay: 0.9 },
];

/**
 * The card header while a project is being clipped: a film strip runs under a
 * scanning beam, scissors cut at the center, and finished clips pop out.
 * Queued projects get a still, dimmed version.
 */
export function ClippingProgressVisual({ queued }: { queued: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Film strip */}
      <div className="absolute inset-x-0 bottom-3 h-12 border-y border-white/10 bg-black/60">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0.5 h-1"
          style={{ background: "repeating-linear-gradient(90deg, rgba(255,255,255,0.25) 0 5px, transparent 5px 11px)" }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0.5 h-1"
          style={{ background: "repeating-linear-gradient(90deg, rgba(255,255,255,0.25) 0 5px, transparent 5px 11px)" }}
        />
        <div className={cn("flex h-full w-[200%] items-center gap-1 px-1 py-2", !queued && "animate-film-scroll")}>
          {Array.from({ length: 24 }, (_, i) => (
            <span
              key={i}
              className={cn("h-full flex-1 rounded-[3px]", queued && "grayscale")}
              style={{ background: FRAMES[i % FRAMES.length], opacity: queued ? 0.35 : 0.85 }}
            />
          ))}
        </div>

        {!queued && (
          <>
            {/* Scanning beam */}
            <div className="animate-scan-beam absolute inset-y-0 left-0 w-1/5 bg-gradient-to-r from-transparent via-cyan-300/45 to-transparent mix-blend-screen" />
            {/* Cut line */}
            <span className="absolute inset-y-[-6px] left-1/2 w-0.5 -translate-x-1/2 bg-cyan-200 shadow-[0_0_12px_3px_rgba(34,211,238,0.9)]" />
          </>
        )}
      </div>

      {queued ? (
        <div className="absolute inset-x-0 top-[50px] flex items-center justify-center gap-1.5 text-[11px] font-medium text-white/50">
          <Clock className="size-3.5" />
          Waiting for a free slot…
        </div>
      ) : (
        <>
          {/* Scissors at the cut, with sparks */}
          <span className="absolute bottom-[54px] left-1/2 flex size-7 -translate-x-1/2 items-center justify-center rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.9)]">
            <Scissors className="animate-snip size-4 rotate-90 text-slate-950" />
            {SPARKS.map((s, i) => (
              <span
                key={i}
                className="animate-spark absolute size-1 rounded-full bg-cyan-100"
                style={{ "--sx": s.sx, "--sy": s.sy, animationDelay: `${s.delay}s` } as CSSProperties}
              />
            ))}
          </span>

          {/* Finished 9:16 clips popping out of the cut */}
          {POPS.map((p, i) => (
            <span
              key={i}
              className="animate-clip-pop absolute bottom-[58px] h-9 w-5 rounded-[4px] border border-white/40 opacity-0 shadow-[0_0_14px_rgba(59,130,246,0.8)]"
              style={
                {
                  // The animation owns `transform`, so center with left instead of translate.
                  left: `calc(${p.left} + ${(i - 1) * 26 - 10}px)`,
                  background: FRAMES[(i * 2) % FRAMES.length],
                  "--pop-tilt": p.tilt,
                  animationDelay: `${p.delay}s`,
                } as CSSProperties
              }
            />
          ))}

          {/* Rotating status line */}
          <div className="absolute inset-x-0 top-[50px] h-4 text-center text-[11px] font-semibold text-cyan-100">
            {STEPS.map((step, i) => (
              <span
                key={step}
                className="animate-status-cycle absolute inset-x-0 opacity-0"
                style={{ animationDelay: `${i * 2.5}s` }}
              >
                {step}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
