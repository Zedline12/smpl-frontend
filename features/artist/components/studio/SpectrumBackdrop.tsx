"use client";
import { useGenerationQueuesQuery } from "@/features/generation/hooks/generation";
import { useArtistPlayerStore } from "../../stores/useArtistPlayerStore";

const BARS = 56;

// Fixed heights (as a share of the layer), a rolling skyline rather than random noise.
const HEIGHTS = Array.from({ length: BARS }, (_, i) => {
  const wave = Math.sin(i * 0.45) * 0.5 + Math.sin(i * 1.3 + 1) * 0.3 + Math.sin(i * 0.12) * 0.2;
  return 0.35 + 0.65 * ((wave + 1) / 2);
});

/**
 * The Artist page backdrop: a dark base, a top spotlight and spectrum bars along the
 * bottom that move only while music plays or a song is generating.
 */
export function SpectrumBackdrop() {
  const playing = useArtistPlayerStore((s) => s.playing);
  const { data: queues } = useGenerationQueuesQuery();
  const generating = (queues ?? []).some(
    (q) => q.type === "audio" && ["pending", "processing"].includes(q.status),
  );
  const live = playing || generating;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{
        backgroundColor: "#07070c",
        backgroundImage:
          "radial-gradient(900px 420px at 50% 0%, color-mix(in srgb, var(--color-primary) 8%, transparent), transparent 70%)",
      }}
    >
      <div
        className="absolute inset-x-0 bottom-0 flex h-[40%] items-end gap-[3px] px-[3px]"
        style={{
          maskImage: "linear-gradient(to top, black 0%, black 35%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to top, black 0%, black 35%, transparent 100%)",
        }}
      >
        {HEIGHTS.map((h, i) => (
          <span
            key={i}
            className="artist-spectrum-bar flex-1 origin-bottom rounded-t-sm"
            style={{
              height: `${h * 100}%`,
              opacity: 0.12,
              background:
                "linear-gradient(to top, var(--color-primary), color-mix(in srgb, var(--color-primary) 55%, white))",
              animationDelay: `${-((i * 137) % 1000) / 1000}s`,
              animationDuration: `${1.1 + (i % 7) * 0.12}s`,
              animationPlayState: live ? "running" : "paused",
            }}
          />
        ))}
      </div>
    </div>
  );
}
