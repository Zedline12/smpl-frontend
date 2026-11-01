"use client";
import { useEffect } from "react";
import MediaExplorer from "@/features/media/components/MediaExplorer";
import RemixBuilder from "@/features/remix/components/RemixBuilder";
import { useAiGenerationControlStore } from "@/stores/useAiGenerationControlStore";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import { GenerationTypeEnum } from "@/features/generation/types/generation";

const MODEL = AiModelsEnum.SEEDANCE_2_5_REF_TO_VIDEO;

export default function RemixPage() {
  const { model, setMediaType, setModel } = useAiGenerationControlStore();

  useEffect(() => {
    // setMediaType resets the model to the media type's default, so set the model after it.
    setMediaType(GenerationTypeEnum.VIDEO);
    setModel(MODEL);
    return () => setMediaType(GenerationTypeEnum.VIDEO);
  }, [setMediaType, setModel]);

  // The builder reads the model's state from the shared store; wait until it's selected.
  const ready = model === MODEL;

  // Same shape as /artist: a 25% sidebar, then the explorer with a gap so its border shows.
  return (
    <div className="relative h-full">
      {/* Primary-only stage light */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary absolute -top-48 -left-40 size-[36rem] rounded-full opacity-[0.12] blur-[130px]" />
        <div className="bg-primary absolute -right-32 -bottom-32 size-[24rem] rounded-full opacity-[0.06] blur-[110px]" />
      </div>

      <div className="relative flex h-full flex-col overflow-y-auto sm:grid sm:grid-cols-[25%_1fr] sm:overflow-hidden">
        <div className="min-h-[70vh] sm:h-full sm:min-h-0">{ready && <RemixBuilder />}</div>
        <section className="min-h-[600px] p-3 sm:h-full sm:min-h-0 sm:pt-0 sm:pr-0 sm:pl-4 sm:pb-3">
          <MediaExplorer explore defaultModel={MODEL} variant="remix" />
        </section>
      </div>
    </div>
  );
}
