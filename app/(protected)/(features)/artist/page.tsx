"use client";
import { useEffect } from "react";
import { useAiGenerationControlStore } from "@/stores/useAiGenerationControlStore";
import { GenerationTypeEnum } from "@/features/generation/types/generation";
import { ArtistStudioPanel } from "@/features/artist/components/studio/ArtistStudioPanel";
import { ArtistLibrary } from "@/features/artist/components/studio/ArtistLibrary";
import { ClipLibrary } from "@/features/artist/components/studio/ClipLibrary";
import { PlayerBar } from "@/features/artist/components/studio/PlayerBar";
import { SpectrumBackdrop } from "@/features/artist/components/studio/SpectrumBackdrop";
import {
  useArtistMode,
  useArtistSection,
} from "@/features/artist/components/studio/ArtistModeSwitch";
import {
  ArtistSectionTabs,
  ArtistSidebar,
} from "@/features/artist/components/studio/ArtistSidebar";
import { ArtistHero } from "@/features/artist/components/studio/ArtistHero";
import { SONG_MODEL } from "@/features/artist/hooks/useSongBuilder";
import { CLIP_MODEL } from "@/features/artist/hooks/useVideoClipBuilder";
import {
  useArtistPlayerStore,
  useCurrentTrack,
} from "@/features/artist/stores/useArtistPlayerStore";

/**
 * The Artist page. Sidebar sections (`?view=`): Home, the studio (create a song, or make a
 * video clip of one with `?tab=clip`) with its library below; Your songs; Your clips.
 */
export default function ArtistPage() {
  const { model, setMediaType, setModel } = useAiGenerationControlStore();
  const hasTrack = !!useCurrentTrack();
  const [tabMode] = useArtistMode();
  const [section] = useArtistSection();
  // Your clips / Your songs pick their model (recreate from there works like on Home).
  const mode = section === "clips" ? "clip" : section === "songs" ? "song" : tabMode;
  const home = section === "home";
  const pageModel = mode === "clip" ? CLIP_MODEL : SONG_MODEL;

  // Recreate can load another model; this page works on the song or the clip model.
  useEffect(() => {
    if (model === pageModel) return;
    // setMediaType resets the model to the media type's default, so set the model after it.
    setMediaType(
      mode === "clip" ? GenerationTypeEnum.VIDEO : GenerationTypeEnum.AUDIO,
    );
    setModel(pageModel);
  }, [model, mode, pageModel, setMediaType, setModel]);

  useEffect(
    () => () => {
      setMediaType(GenerationTypeEnum.AUDIO);
      useArtistPlayerStore.getState().reset();
    },
    [setMediaType],
  );

  // The settings read the selected model's state; wait until it's selected (it drives the cost).
  const ready = model === pageModel;

  return (
    // The sidebar is a full-height rail on the left; only the body scrolls.
    <div className="relative flex h-full">
      <ArtistSidebar />
      <div className="relative min-w-0 flex-1 overflow-y-auto [scrollbar-width:thin]">
        <SpectrumBackdrop />
        <div
          className={`relative z-10 mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-3 pt-3 sm:px-6 md:gap-8 md:pt-6 lg:px-8 ${hasTrack ? "pb-28" : "pb-10"}`}
        >
          <ArtistSectionTabs />
          {home && <ArtistHero />}
          {home && ready && <ArtistStudioPanel />}
          {section === "clips" ? (
            <ClipLibrary full />
          ) : section === "songs" ? (
            <ArtistLibrary full />
          ) : mode === "clip" ? (
            <ClipLibrary />
          ) : (
            <ArtistLibrary />
          )}
        </div>
      </div>


      <PlayerBar />
    </div>
  );
}
