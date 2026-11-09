"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MediaExplorer from "@/features/media/components/MediaExplorer";
import ArtistSidebar, { ArtistTab } from "@/features/artist/components/ArtistSidebar";
import { useAiGenerationControlStore } from "@/stores/useAiGenerationControlStore";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import { GenerationTypeEnum } from "@/features/generation/types/generation";

const TAB_MODEL: Record<ArtistTab, { model: AiModelsEnum; mediaType: GenerationTypeEnum }> = {
  song: { model: AiModelsEnum.ELEVENLABS_MUSIC_V2_5, mediaType: GenerationTypeEnum.AUDIO },
  clip: { model: AiModelsEnum.SMPL_ARTIST, mediaType: GenerationTypeEnum.VIDEO },
};

export default function ArtistPage() {
  // useSearchParams needs a Suspense boundary on client pages.
  return (
    <Suspense>
      <ArtistStudio />
    </Suspense>
  );
}

function ArtistStudio() {
  const { model, setMediaType, setModel } = useAiGenerationControlStore();
  // "Recreate" on a clip links to /artist?tab=clip.
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<ArtistTab>(() =>
    searchParams.get("tab") === "clip" ? "clip" : "song",
  );

  useEffect(() => {
    const { model: tabModel, mediaType } = TAB_MODEL[tab];
    // setMediaType resets the model to the media type's default, so set the model after it.
    setMediaType(mediaType);
    setModel(tabModel);
  }, [tab, setMediaType, setModel]);

  useEffect(() => () => setMediaType(GenerationTypeEnum.AUDIO), [setMediaType]);

  // The builders read their own model's state; the shared model only drives the cost query.
  const ready = model === TAB_MODEL.song.model || model === TAB_MODEL.clip.model;
  const tabModel = TAB_MODEL[tab].model;

  // Same shape as /create: a 25% sidebar, then the explorer with a gap so its border shows.
  return (
    <div className="relative h-full">
      {/* Soft purple/pink stage lighting behind the page */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary absolute -top-40 -left-40 size-[32rem] rounded-full opacity-[0.09] blur-[120px]" />
        <div className="bg-secondary absolute -right-40 -bottom-40 size-[32rem] rounded-full opacity-[0.08] blur-[120px]" />
      </div>

      <div className="relative flex h-full flex-col overflow-y-auto sm:grid sm:grid-cols-[25%_1fr] sm:overflow-hidden">
        <div className="min-h-[70vh] sm:h-full sm:min-h-0">
          {ready && <ArtistSidebar tab={tab} onTabChange={setTab} />}
        </div>
        <section className="min-h-[600px] p-3 sm:h-full sm:min-h-0 sm:pt-0 sm:pr-0 sm:pl-4 sm:pb-3">
          <MediaExplorer
            key={tab}
            explore
            defaultModel={tabModel}
            variant={tab === "song" ? "music" : "default"}
          />
        </section>
      </div>
    </div>
  );
}
