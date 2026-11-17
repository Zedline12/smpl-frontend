"use client";

import { useEffect } from "react";
import MediaExplorer from "@/features/media/components/MediaExplorer";
import { useAiGenerationControlStore } from "@/stores/useAiGenerationControlStore";
import { GenerationTypeEnum } from "@/features/generation/types/generation";
import { HowItWorks } from "@/components/HowItWorks";
import { HOW_IT_WORKS_MAP } from "@/features/generation/data/how-it-works";
import {
  AiModelsEnum,
  VIDEO_MODELS,
  normalizeModelId,
} from "@/features/generation/enums/models.enum";
import { GensuHero } from "@/features/gensu/components/GensuHero";

export default function CreateVideoPage() {
  const { setMediaType, setModel, model, sidebarView } = useAiGenerationControlStore();

  useEffect(() => {
    // setMediaType resets the model to the default, and it runs after the sidebar
    // read ?model= — so re-apply a linked video model (e.g. an Edit Video tool) here.
    setMediaType(GenerationTypeEnum.VIDEO);
    const linked = normalizeModelId(new URLSearchParams(window.location.search).get("model"));
    if (linked && VIDEO_MODELS.some((m) => m.id === linked)) {
      setModel(linked as AiModelsEnum);
    }
  }, [setMediaType, setModel]);

  // Model intros shown above the Explore templates.
  const hero = model === AiModelsEnum.SMPL_GENSU ? <GensuHero /> : null;

  const howItWorksSlides = HOW_IT_WORKS_MAP[model];
  if (sidebarView === "howItWorks" && howItWorksSlides) {
    return <HowItWorks slides={howItWorksSlides} />;
  }

  return (
    <>
      {/* The prompt and settings live in the layout's sidebar (above this on phones). */}
      <div className="flex h-full w-full flex-1 flex-col text-foreground">
        <div className="flex min-h-0 flex-1 flex-col sm:overflow-hidden">
          <MediaExplorer explore styles>{hero}</MediaExplorer>
        </div>
      </div>
    </>
  );
}
