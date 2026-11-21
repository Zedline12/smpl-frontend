"use client";
import { useEffect } from "react";
import { useAiGenerationControlStore } from "@/stores/useAiGenerationControlStore";
import { GenerationTypeEnum } from "@/features/generation/types/generation";
import { ArtistStudioPanel } from "@/features/artist/components/studio/ArtistStudioPanel";
import { ArtistLibrary } from "@/features/artist/components/studio/ArtistLibrary";
import { ClipLibrary } from "@/features/artist/components/studio/ClipLibrary";
import { MobileDjDock } from "@/features/artist/components/studio/MobileDjDock";
import { MobileClipDock } from "@/features/artist/components/studio/MobileClipDock";
import { PlayerBar } from "@/features/artist/components/studio/PlayerBar";
import { SpectrumBackdrop } from "@/features/artist/components/studio/SpectrumBackdrop";
import { useArtistMode } from "@/features/artist/components/studio/ArtistModeSwitch";
import { SONG_MODEL } from "@/features/artist/hooks/useSongBuilder";
import { CLIP_MODEL } from "@/features/artist/hooks/useVideoClipBuilder";
import {
  useArtistPlayerStore,
  useCurrentTrack,
} from "@/features/artist/stores/useArtistPlayerStore";

/** The Artist page: create a song, or make a video clip of one (`?tab=clip`). */
export default function ArtistPage() {
  const { model, setMediaType, setModel } = useAiGenerationControlStore();
  const hasTrack = !!useCurrentTrack();
  const [mode] = useArtistMode();
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
    <div className="relative h-full overflow-y-auto [scrollbar-width:thin]">
      <SpectrumBackdrop />
      <div
        className={`relative z-10 mx-auto flex w-full max-w-[1800px] flex-col gap-8 px-3 pt-1 sm:px-6 lg:px-10 ${
          // Phones: clear the docked DJ (and the player bar under it).
          hasTrack ? "pb-80 md:pb-28" : "pb-64 md:pb-10"
        }`}
      >
        {ready && <ArtistStudioPanel />}
        {mode === "clip" ? <ClipLibrary /> : <ArtistLibrary />}
      </div>

      {ready && (mode === "clip" ? <MobileClipDock /> : <MobileDjDock />)}

      <PlayerBar />
    </div>
  );
}
