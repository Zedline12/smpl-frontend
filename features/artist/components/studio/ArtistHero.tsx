"use client";
import { ArtistModeSwitch, type ArtistMode, useArtistMode } from "./ArtistModeSwitch";

/** The hero's video per maker (a muted loop). */
export const ARTIST_HERO_VIDEOS: Record<ArtistMode, string> = {
  song: "https://royal-violet-313a.smplappteam.workers.dev/generations/videos/6af53e03ae8301d1c4acdef6/6b047ae9f412cb471c70b10c-9d994a75-0e78-4baf-91c7-dfcd993417ca",
  clip: "https://royal-violet-313a.smplappteam.workers.dev/generations/videos/6af53e03ae8301d1c4acdef6/6b047a7df412cb471c70b06c-358ebca5-577a-4a97-9162-b52dcbe1444d",
};

const COPY = {
  song: {
    title: "Make your song",
    text: "Pick a genre, a mood and a voice, write your lyrics or let us write them, and get a full track in minutes.",
  },
  clip: {
    title: "Make a video clip",
    text: "Turn a part of your song into a music video: your character singing it, or a lyrics video of the place it belongs in.",
  },
} as const;

/** Mutes the element itself (React sets `muted` too late for autoplay) and starts it. */
const startLoop = (el: HTMLVideoElement | null) => {
  if (!el) return;
  el.muted = true;
  el.defaultMuted = true;
  void el.play().catch(() => {});
};

/** Home's hero, straight on the page: the title and what you can make, the Song / Clip switch, and the video. */
export function ArtistHero() {
  const [mode] = useArtistMode();
  const copy = COPY[mode];
  const videoUrl = ARTIST_HERO_VIDEOS[mode];

  return (
    <section className="grid items-center gap-6 py-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:py-4 lg:gap-10">
      <div className="flex flex-col items-start gap-4">
        <span
          className="bg-clip-text text-sm font-black tracking-[0.3em] text-transparent uppercase"
          style={{
            fontFamily: "var(--font-display)",
            backgroundImage: "linear-gradient(90deg, var(--color-primary), var(--color-secondary))",
          }}
        >
          Artist
        </span>
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">{copy.title}</h1>
        <p className="max-w-md text-sm leading-relaxed text-white/60 sm:text-base">{copy.text}</p>
        <ArtistModeSwitch className="mt-2" />
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-2xl shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
        {/* Shows while the video loads. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, color-mix(in oklab, var(--color-primary) 45%, transparent), transparent 60%), radial-gradient(circle at 75% 70%, color-mix(in oklab, var(--color-secondary) 40%, transparent), transparent 60%)",
          }}
        />
        <video
          key={videoUrl}
          ref={startLoop}
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 size-full object-cover"
        />
      </div>
    </section>
  );
}
