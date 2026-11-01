"use client";

const FRAMES = 8;
// The strip holds the frames twice so scrolling by half loops seamlessly.
const STRIP = Array.from({ length: FRAMES * 2 }, (_, i) => i % FRAMES);

const SPROCKETS =
  "repeating-linear-gradient(90deg, transparent 0 6px, rgba(255,255,255,0.35) 6px 12px, transparent 12px 18px)";

interface RemixGeneratingTileProps {
  processing: boolean;
  style?: React.CSSProperties;
  className?: string;
}

/** Generating tile for the Remix page: a film strip running past a playhead, frames cut in primary. */
export function RemixGeneratingTile({ processing, style, className = "" }: RemixGeneratingTileProps) {
  return (
    <div
      style={style}
      className={`relative w-full overflow-hidden rounded-xl border backdrop-blur-xl transition-colors duration-500 ${
        processing ? "border-primary/35 bg-black/40" : "border-white/10 bg-white/[0.04]"
      } ${className}`}
    >
      {/* Primary light behind the strip */}
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
          processing ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "radial-gradient(55% 45% at 50% 55%, color-mix(in srgb, var(--color-primary) 30%, transparent), transparent 75%)",
        }}
      />

      <div className="relative z-10 flex h-full flex-col items-center justify-between py-4 text-center">
        <div className="flex flex-col items-center gap-0.5">
          <span className={`text-sm font-semibold tracking-wide ${processing ? "text-white" : "text-white/60"}`}>
            {processing ? "Remixing your edit…" : "In the queue"}
          </span>
          <span className="text-[11px] text-white/40">
            {processing ? "Putting your character in the scene" : "Waiting for a free slot"}
          </span>
        </div>

        {/* Film strip */}
        <div className="relative h-[42%] w-full overflow-hidden">
          <div
            className={`flex h-full w-[200%] flex-col justify-between bg-black/50 py-1 ${
              processing ? "animate-film-scroll" : ""
            }`}
          >
            <div className="h-1.5 w-full shrink-0" style={{ backgroundImage: SPROCKETS }} />
            <div className="flex min-h-0 flex-1 gap-1.5 px-0.5 py-1">
              {STRIP.map((frame, i) => (
                <div
                  key={i}
                  className={`relative flex-1 overflow-hidden rounded-[3px] border ${
                    processing ? "border-primary/25 bg-white/[0.06]" : "border-white/10 bg-white/[0.04]"
                  }`}
                >
                  {processing && (
                    <span
                      className="animate-frame-cut bg-primary/55 absolute inset-0 shadow-[inset_0_0_12px_var(--color-primary)]"
                      style={{ animationDelay: `${frame * 0.3}s` }}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="h-1.5 w-full shrink-0" style={{ backgroundImage: SPROCKETS }} />
          </div>

          {/* Playhead */}
          <div
            className={`absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 ${
              processing ? "bg-primary shadow-[0_0_14px_3px_var(--color-primary)]" : "bg-white/25"
            }`}
          />
        </div>

        <span
          className={`text-[10px] font-semibold uppercase tracking-[0.3em] ${
            processing ? "text-primary" : "text-white/30"
          }`}
        >
          Remix
        </span>
      </div>
    </div>
  );
}
