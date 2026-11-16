"use client";
import { useEffect } from "react";
import { useAiGenerationControlStore } from "@/stores/useAiGenerationControlStore";
import { GenerationTypeEnum } from "@/features/generation/types/generation";
import { ArtistStudioPanel } from "@/features/artist/components/studio/ArtistStudioPanel";
import { ArtistLibrary } from "@/features/artist/components/studio/ArtistLibrary";
import { PlayerBar } from "@/features/artist/components/studio/PlayerBar";
import { SpectrumBackdrop } from "@/features/artist/components/studio/SpectrumBackdrop";
import { SONG_MODEL } from "@/features/artist/hooks/useSongBuilder";
import { useArtistPlayerStore, useCurrentTrack } from "@/features/artist/stores/useArtistPlayerStore";

/** The Artist page: music creation only. */
export default function ArtistPage() {
  const { model, setMediaType, setModel } = useAiGenerationControlStore();
  const hasTrack = !!useCurrentTrack();

  // Recreate can load another model; this page always works on the song model.
  useEffect(() => {
    if (model === SONG_MODEL) return;
    // setMediaType resets the model to the media type's default, so set the model after it.
    setMediaType(GenerationTypeEnum.AUDIO);
    setModel(SONG_MODEL);
  }, [model, setMediaType, setModel]);

  useEffect(
    () => () => {
      setMediaType(GenerationTypeEnum.AUDIO);
      useArtistPlayerStore.getState().reset();
    },
    [setMediaType],
  );

  return (
    <div className="relative h-full overflow-y-auto [scrollbar-width:thin]">
      <SpectrumBackdrop />
      <div
        className={`relative z-10 mx-auto flex w-full max-w-[1800px] flex-col gap-8 px-3 pt-1 sm:px-6 lg:px-10 ${
          hasTrack ? "pb-28" : "pb-10"
        }`}
      >
        {/* The settings read the song model's state; wait until it's selected (it drives the cost). */}
        {model === SONG_MODEL && <ArtistStudioPanel />}
        <ArtistLibrary />
      </div>

      <PlayerBar />
    </div>
  );
}
