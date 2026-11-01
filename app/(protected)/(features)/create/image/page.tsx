"use client";

import { useEffect } from "react";
import MediaExplorer from "@/features/media/components/MediaExplorer";
import PromptComposer from "@/features/generation/components/prompt/PromptComposer";
import { useAiGenerationControlStore } from "@/stores/useAiGenerationControlStore";
import { GenerationTypeEnum } from "@/features/generation/types/generation";

export default function CreateImagePage() {
  const { setMediaType } = useAiGenerationControlStore();

  useEffect(() => {
    setMediaType(GenerationTypeEnum.IMAGE);
  }, [setMediaType]);

  return (
    <>
      {/* Desktop */}
      <div className="md:flex hidden w-full h-full flex-col text-foreground">
        <div className="flex-1 overflow-hidden">
          <MediaExplorer explore />
        </div>
        <section className="lg:w-1/2 w-full fixed sm:bottom-10 bottom-19 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
          <PromptComposer />
        </section>
      </div>

      {/* Mobile */}
      <div className="p-5 md:hidden block h-full text-foreground">
        <div className="h-[600px]">
          <MediaExplorer explore />
        </div>
        <section className="lg:w-1/2 w-full fixed sm:bottom-10 bottom-19 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
          <PromptComposer />
        </section>
      </div>
    </>
  );
}
