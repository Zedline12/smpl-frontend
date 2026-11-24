"use client";
import { useArtistMode } from "./ArtistModeSwitch";
import { SongSettings } from "./SongSettings";
import { VideoClipSettings } from "./VideoClipSettings";

/** The maker under the hero: the song DJ or the video clip steps. */
export function ArtistStudioPanel() {
  const [mode] = useArtistMode();

  return (
    <section className="overflow-hidden rounded-[20px] sm:rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-4 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-6 lg:p-8">
      {mode === "clip" ? <VideoClipSettings /> : <SongSettings />}
    </section>
  );
}
