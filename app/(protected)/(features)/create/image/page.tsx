"use client";

import { useEffect } from "react";
import MediaExplorer from "@/features/media/components/MediaExplorer";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import PromptComposer from "@/features/generation/components/prompt/PromptComposer";
import { useAiGenerationControlStore } from "@/stores/useAiGenerationControlStore";
import { GenerationTypeEnum } from "@/features/generation/types/generation";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";

export default function CreateImagePage() {
  const { setMediaType, setModel } = useAiGenerationControlStore();

  useEffect(() => {
    // setMediaType resets the model to the default, and it runs after the sidebar
    // read ?model= — so re-apply a linked model (e.g. Ads Studio) here.
    setMediaType(GenerationTypeEnum.IMAGE);
    const linked = new URLSearchParams(window.location.search).get("model");
    if (linked && (Object.values(AiModelsEnum) as string[]).includes(linked)) {
      setModel(linked as AiModelsEnum);
    }
  }, [setMediaType, setModel]);

  return (
    <>
      {/* Desktop */}
      <div className="md:flex hidden w-full h-full flex-col text-foreground">
        <div className="flex-1 overflow-hidden">
          <MediaExplorer explore />
        </div>
        <section className="lg:w-1/2 w-full fixed sm:bottom-10 bottom-19 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
          {/* <PromptComposer /> */}
        </section>
      </div>

      {/* Mobile */}
      <div className="p-5 md:hidden block h-full text-foreground">
        <div className="h-[600px]">
          <MediaExplorer explore />
        </div>
        <section className="lg:w-1/2 w-full fixed sm:bottom-10 bottom-19 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
          {/* <PromptComposer /> */}
        </section>
      </div>
    </>
  );
}
