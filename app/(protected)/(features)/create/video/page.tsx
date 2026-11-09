"use client";

import { useEffect } from "react";
import MediaExplorer from "@/features/media/components/MediaExplorer";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import PromptComposer from "@/features/generation/components/prompt/PromptComposer";
import { useAiGenerationControlStore } from "@/stores/useAiGenerationControlStore";
import { GenerationTypeEnum } from "@/features/generation/types/generation";
import { HowItWorks } from "@/components/HowItWorks";
import { HOW_IT_WORKS_MAP } from "@/features/generation/data/how-it-works";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import { GensuHero } from "@/features/gensu/components/GensuHero";

export default function CreateVideoPage() {
  const { setMediaType, model, sidebarView } = useAiGenerationControlStore();

  useEffect(() => {
    setMediaType(GenerationTypeEnum.VIDEO);
  }, [setMediaType]);

  // Model intros shown above the Explore templates.
  const hero = model === AiModelsEnum.SMPL_GENSU ? <GensuHero /> : null;

  const howItWorksSlides = HOW_IT_WORKS_MAP[model];
  if (sidebarView === "howItWorks" && howItWorksSlides) {
    return <HowItWorks slides={howItWorksSlides} />;
  }

  return (
    <>
      {/* Desktop */}
      <div className="md:flex hidden w-full h-full flex-col text-foreground">
        <div className="flex-1 overflow-hidden">
          <MediaExplorer explore>{hero}</MediaExplorer>
        </div>
        <section className="lg:w-1/2 w-full fixed sm:bottom-10 bottom-19 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
          {/* <PromptComposer /> */}
        </section>
      </div>

      {/* Mobile */}
      <div className="p-5 md:hidden block h-full text-foreground">
        <div className="h-[600px]">
          <MediaExplorer explore>{hero}</MediaExplorer>
        </div>
        <section className="lg:w-1/2 w-full fixed sm:bottom-10 bottom-19 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
          {/* <PromptComposer /> */}
        </section>
      </div>
    </>
  );
}
