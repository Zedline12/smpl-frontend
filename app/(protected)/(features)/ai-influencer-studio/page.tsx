"use client";
import { useEffect } from "react";
import MediaExplorer from "@/features/media/components/MediaExplorer";
import InfluencerBuilder from "@/features/ai-influencer/components/InfluencerBuilder";
import { InfluencerHero } from "@/features/ai-influencer/components/InfluencerHero";
import { useAiGenerationControlStore } from "@/stores/useAiGenerationControlStore";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import { GenerationTypeEnum } from "@/features/generation/types/generation";

export default function AiInfluencerStudioPage() {
  const { model, setMediaType, setModel } = useAiGenerationControlStore();

  useEffect(() => {
    // setMediaType resets the model to the media type's default, so set the model after it.
    setMediaType(GenerationTypeEnum.IMAGE);
    setModel(AiModelsEnum.HIGGSFIELD_AI_INFLUENCER);
    // /create has no composer for this model, so hand back the default image model on leave.
    return () => setMediaType(GenerationTypeEnum.IMAGE);
  }, [setMediaType, setModel]);

  // The builder reads the model's state from the shared store; wait until it's selected.
  const ready = model === AiModelsEnum.HIGGSFIELD_AI_INFLUENCER;

  return (
    // Phones: the builder takes 80% of the screen and Explore/History follows; the page scrolls.
    <div className="custom-scrollbar flex h-full min-h-0 flex-col gap-3 overflow-y-auto lg:flex-row lg:overflow-hidden lg:rounded-2xl lg:border lg:border-white/[0.07]">
      <aside className="h-[80dvh] min-h-0 shrink-0 overflow-y-auto overscroll-contain rounded-2xl border border-white/[0.07] bg-white/[0.03] [scrollbar-width:none] lg:h-full lg:w-1/4 lg:rounded-none lg:border-0 lg:border-r lg:border-r-white/[0.07] [&::-webkit-scrollbar]:hidden">
        {ready && <InfluencerBuilder />}
      </aside>

      <section className="custom-scrollbar flex min-h-[70dvh] min-w-0 shrink-0 flex-col lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:p-5">
        <MediaExplorer explore defaultModel={AiModelsEnum.HIGGSFIELD_AI_INFLUENCER}>
          <InfluencerHero />
        </MediaExplorer>
      </section>
    </div>
  );
}
