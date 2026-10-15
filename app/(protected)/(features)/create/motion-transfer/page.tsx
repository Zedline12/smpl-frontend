"use client";
import { useEffect } from "react";
import MediaExplorer from "@/features/media/components/MediaExplorer";
import PromptComposer from "@/features/generation/components/prompt/PromptComposer";
import { useAiGenerationControlStore } from "@/stores/useAiGenerationControlStore";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import { GenerationTypeEnum } from "@/features/generation/types/generation";

export default function MotionTransferPage() {
  const { setMediaType, setModel } = useAiGenerationControlStore();

  useEffect(() => {
    // setMediaType resets the model to the media type's default, so set the model after it.
    setMediaType(GenerationTypeEnum.VIDEO);
    setModel(AiModelsEnum.HIGGSFIELD_GENJUTSU_MOTION_TRANSFER);
  }, [setMediaType, setModel]);

  return (
    <>
      <div className="md:grid hidden w-full h-full text-foreground">
        <div className="relative col-span-2 px-5 w-full flex flex-col justify-between gap-2">
          <div className="h-[500px]">
            <MediaExplorer />
          </div>
          <section className="lg:w-1/2 w-full fixed sm:bottom-10 bottom-19 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
            <PromptComposer />
          </section>
        </div>
      </div>
      <div className="p-5 md:hidden block h-full grid grid-cols-1 gap-6 text-foreground">
        <div className="col-span-1 h-[600px]">
          <MediaExplorer />
        </div>
        <section className="lg:w-1/2 w-full fixed sm:bottom-10 bottom-19 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
          <PromptComposer />
        </section>
      </div>
    </>
  );
}
