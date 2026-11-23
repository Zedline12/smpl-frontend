"use client";
import { ArtistModeSwitch, useArtistMode } from "./ArtistModeSwitch";

/** The hero's video (a muted loop). Empty shows the gradient placeholder until it's set. */
export const ARTIST_HERO_VIDEO_URL = "";

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

/** Home's hero: the title and what you can make, the Song / Clip switch, and the video. */
export function ArtistHero() {
  const [mode] = useArtistMode();
  const copy = COPY[mode];

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl">
      <div className="grid items-center gap-6 p-5 sm:p-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-10 lg:p-10">
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
          <ArtistModeSwitch className="mt-2 hidden md:flex" />
        </div>

        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40">
          {ARTIST_HERO_VIDEO_URL ? (
            <video
              src={ARTIST_HERO_VIDEO_URL}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, color-mix(in oklab, var(--color-primary) 45%, transparent), transparent 60%), radial-gradient(circle at 75% 70%, color-mix(in oklab, var(--color-secondary) 40%, transparent), transparent 60%)",
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
