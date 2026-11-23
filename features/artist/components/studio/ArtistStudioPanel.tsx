"use client";
import { useArtistMode } from "./ArtistModeSwitch";
import { SongSettings } from "./SongSettings";
import { VideoClipSettings } from "./VideoClipSettings";

/** The maker under the hero: the song DJ or the video clip steps. */
export function ArtistStudioPanel() {
  const [mode] = useArtistMode();

  return (
    // Phones use the docked DJ (MobileDjDock / MobileClipDock) instead of this panel.
    <section className="hidden overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-4 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-6 md:block lg:p-8">
      {mode === "clip" ? <VideoClipSettings /> : <SongSettings />}
    </section>
  );
}
