"use client";
import { useEffect } from "react";
import MediaExplorer from "@/features/media/components/MediaExplorer";
import AdsBuilder from "@/features/ads-studio/components/AdsBuilder";
import { useAiGenerationControlStore } from "@/stores/useAiGenerationControlStore";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import { GenerationTypeEnum } from "@/features/generation/types/generation";

/** Ads Studio jobs live in their own domain, so other pages never show them. */
const ADS_JOBS_DOMAIN = "ads-studio";

export default function AdsStudioPage() {
  const { model, setMediaType, setModel } = useAiGenerationControlStore();

  useEffect(() => {
    // setMediaType resets the model to the media type's default, so set the model after it.
    setMediaType(GenerationTypeEnum.IMAGE);
    setModel(AiModelsEnum.HIGGSFIELD_ADS_STUDIO);
    // /create has no composer for this model, so hand back the default image model on leave.
    return () => setMediaType(GenerationTypeEnum.IMAGE);
  }, [setMediaType, setModel]);

  const ready = model === AiModelsEnum.HIGGSFIELD_ADS_STUDIO;

  return (
    <div className="flex h-full min-h-0 flex-col lg:flex-row">
      <aside className="custom-scrollbar border-border min-h-0 shrink-0 overflow-y-auto border-b lg:h-full lg:w-[460px] lg:border-r lg:border-b-0">
        {ready && <AdsBuilder />}
      </aside>
      <section className="custom-scrollbar min-h-[600px] flex-1 overflow-y-auto p-5 lg:min-h-0">
        <MediaExplorer
          explore
          defaultModel={AiModelsEnum.HIGGSFIELD_ADS_STUDIO}
          jobsDomain={ADS_JOBS_DOMAIN}
        />
      </section>
    </div>
  );
}
