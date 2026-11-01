"use client";
import { useEffect } from "react";
import MediaExplorer from "@/features/media/components/MediaExplorer";
import InfluencerBuilder from "@/features/ai-influencer/components/InfluencerBuilder";
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
    <div className="flex h-full min-h-0 flex-col gap-3 rounded-2xl border border-white/[0.07] lg:flex-row lg:overflow-hidden">
      <aside className="min-h-0 shrink-0 overflow-y-auto bg-white/[0.03] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:h-full lg:w-1/4 lg:border-r lg:border-r-white/[0.07]">
        {ready && <InfluencerBuilder />}
      </aside>
      <section className="custom-scrollbar min-h-[600px] flex-1 overflow-y-auto p-5 lg:min-h-0">
        <MediaExplorer explore defaultModel={AiModelsEnum.HIGGSFIELD_AI_INFLUENCER} />
      </section>
    </div>
  );
}
