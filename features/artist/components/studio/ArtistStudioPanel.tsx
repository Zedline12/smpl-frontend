"use client";
import { useArtistPlayerStore } from "../../stores/useArtistPlayerStore";
import { ArtistModeSwitch, useArtistMode } from "./ArtistModeSwitch";
import { Equalizer } from "./Equalizer";
import { SongSettings } from "./SongSettings";
import { VideoClipSettings } from "./VideoClipSettings";

/** The settings panel at the top of the Artist page: the song DJ or the video clip inputs. */
export function ArtistStudioPanel() {
  const playing = useArtistPlayerStore((s) => s.playing);
  const [mode] = useArtistMode();

  return (
    // Phones use the docked DJ (MobileDjDock / MobileClipDock) instead of this panel.
    <section className="hidden overflow-hidden md:block rounded-[28px] border border-white/[0.08] bg-white/[0.03] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl">
      <header className="flex items-center gap-6 border-b border-white/[0.06] bg-white/[0.02] px-5 py-4 sm:px-7">
        <h1
          className="bg-clip-text text-3xl font-black tracking-tight text-transparent uppercase"
          style={{
            fontFamily: "var(--font-display)",
            backgroundImage:
              "linear-gradient(90deg, var(--color-primary), var(--color-secondary))",
          }}
        >
          Artist
        </h1>
        <ArtistModeSwitch />
        <Equalizer
          active={playing}
          bars={14}
          className="ml-auto hidden h-8 sm:flex"
          barClassName="w-1"
        />
      </header>

      <div className="p-4 sm:p-6">
        {mode === "clip" ? <VideoClipSettings /> : <SongSettings />}
      </div>
    </section>
  );
}
