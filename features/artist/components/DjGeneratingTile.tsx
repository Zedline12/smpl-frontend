"use client";

const BAR_COUNT = 32;

// Taller in the middle, so the bars fan out of the deck like a sound burst.
const BAR_HEIGHTS = Array.from({ length: BAR_COUNT }, (_, i) => {
  const center = 1 - Math.abs(i - (BAR_COUNT - 1) / 2) / (BAR_COUNT / 2);
  return 0.25 + 0.75 * Math.pow(center, 0.8);
});

interface DjGeneratingTileProps {
  processing: boolean;
  style?: React.CSSProperties;
  className?: string;
}

/** Generating tile for the Artist page: sound waves pouring out of a DJ deck. */
export function DjGeneratingTile({ processing, style, className = "" }: DjGeneratingTileProps) {
  return (
    <div
      style={style}
      className={`relative w-full overflow-hidden rounded-xl border backdrop-blur-xl transition-colors duration-500 ${
        processing ? "border-primary/30 bg-black/40" : "border-white/10 bg-white/[0.04]"
      } ${className}`}
    >
      {/* Glow rising from the deck */}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-3/4 transition-opacity duration-500 ${
          processing ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "radial-gradient(60% 70% at 50% 100%, color-mix(in srgb, var(--color-primary) 35%, transparent), color-mix(in srgb, var(--color-secondary) 12%, transparent) 55%, transparent 80%)",
        }}
      />

      <div className="relative z-10 flex h-full flex-col items-center pt-4 text-center">
        <span className={`text-sm font-semibold tracking-wide ${processing ? "text-white" : "text-white/60"}`}>
          {processing ? "Mixing your track…" : "In the queue"}
        </span>
        <span className="mt-0.5 text-[11px] text-white/40">
          {processing ? "Your song is being produced" : "Waiting for a free deck"}
        </span>

        {/* Sound bars */}
        <div className="mt-auto flex h-[45%] w-[72%] items-end justify-center gap-[3px]">
          {BAR_HEIGHTS.map((height, i) => (
            <span
              key={i}
              className={`w-full max-w-[6px] rounded-full ${processing ? "animate-wave-bar" : ""}`}
              style={{
                height: `${(processing ? height : height * 0.3) * 100}%`,
                animationDelay: `${((i * 73) % 11) * -0.1}s`,
                animationDuration: `${0.8 + ((i * 37) % 7) * 0.08}s`,
                background: processing
                  ? "linear-gradient(to top, var(--color-primary), var(--color-secondary))"
                  : "rgba(255,255,255,0.2)",
                filter: processing ? "drop-shadow(0 0 4px var(--color-primary))" : undefined,
              }}
            />
          ))}
        </div>

        {/* DJ deck */}
        <div className="relative mb-3 mt-2 flex h-14 w-28 items-center justify-center">
          {processing &&
            [0, 0.8, 1.6].map((delay) => (
              <span
                key={delay}
                className="animate-wave-ripple absolute size-12 rounded-full border border-secondary/60"
                style={{ animationDelay: `${delay}s` }}
              />
            ))}
          <DeckIcon processing={processing} />
        </div>
      </div>
    </div>
  );
}

function DeckIcon({ processing }: { processing: boolean }) {
  const stroke = processing ? "white" : "rgba(255,255,255,0.35)";
  return (
    <svg viewBox="0 0 112 56" className="relative h-full w-full" aria-hidden>
      {/* Deck body */}
      <rect x="2" y="6" width="108" height="46" rx="10" fill="rgba(0,0,0,0.55)" stroke={stroke} strokeOpacity="0.4" />
      {/* Platter */}
      <g className={processing ? "animate-spin-slow" : ""} style={{ transformOrigin: "36px 29px" }}>
        <circle cx="36" cy="29" r="18" fill="rgba(255,255,255,0.06)" stroke={stroke} strokeOpacity="0.7" />
        <circle cx="36" cy="29" r="12" fill="none" stroke={stroke} strokeOpacity="0.25" />
        <circle cx="36" cy="29" r="4" fill={processing ? "var(--color-secondary)" : stroke} />
        <line x1="36" y1="13" x2="36" y2="19" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* Tonearm */}
      <path d="M62 12 L58 22 L46 30" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      {/* Knobs and fader */}
      <circle cx="78" cy="20" r="4" fill={processing ? "var(--color-primary)" : "none"} stroke={stroke} />
      <circle cx="94" cy="20" r="4" fill={processing ? "var(--color-secondary)" : "none"} stroke={stroke} />
      <rect x="74" y="36" width="24" height="4" rx="2" fill={stroke} fillOpacity="0.3" />
      <rect x="82" y="33" width="6" height="10" rx="2" fill={stroke} />
    </svg>
  );
}
