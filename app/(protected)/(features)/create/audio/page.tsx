"use client";

import { useEffect } from "react";
import MediaExplorer from "@/features/media/components/MediaExplorer";
import PromptComposer from "@/features/generation/components/prompt/PromptComposer";
import { useAiGenerationControlStore } from "@/stores/useAiGenerationControlStore";
import { GenerationTypeEnum } from "@/features/generation/types/generation";
import { AiModelsEnum,  normalizeModelId } from "@/features/generation/enums/models.enum";

export default function CreateAudioPage() {
  const { setMediaType, setModel, model } = useAiGenerationControlStore();
  // The voice changer is set up entirely in the sidebar (no prompt).
  const showComposer = model !== AiModelsEnum.SMPL_VOICE_CHANGER;

  useEffect(() => {
    // setMediaType resets the model to the default, and it runs after the sidebar
    // read ?model= — so re-apply a linked model (e.g. the voice changer) here.
    setMediaType(GenerationTypeEnum.AUDIO);
    const linked = normalizeModelId(new URLSearchParams(window.location.search).get("model"));
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
        {showComposer && (
          <section className="lg:w-1/2 w-full fixed sm:bottom-10 bottom-19 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
            <PromptComposer />
          </section>
        )}
      </div>

      {/* Mobile */}
      <div className="p-5 md:hidden block h-full text-foreground">
        <div className="h-[600px]">
          <MediaExplorer explore />
        </div>
        {showComposer && (
          <section className="lg:w-1/2 w-full fixed sm:bottom-10 bottom-19 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
            <PromptComposer />
          </section>
        )}
      </div>
    </>
  );
}
