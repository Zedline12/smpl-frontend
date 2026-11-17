"use client";

import { useEffect } from "react";
import MediaExplorer from "@/features/media/components/MediaExplorer";
import { useAiGenerationControlStore } from "@/stores/useAiGenerationControlStore";
import { GenerationTypeEnum } from "@/features/generation/types/generation";
import { AiModelsEnum,  normalizeModelId } from "@/features/generation/enums/models.enum";

export default function CreateImagePage() {
  const { setMediaType, setModel } = useAiGenerationControlStore();

  useEffect(() => {
    // setMediaType resets the model to the default, and it runs after the sidebar
    // read ?model= — so re-apply a linked model (e.g. Ads Studio) here.
    setMediaType(GenerationTypeEnum.IMAGE);
    const linked = normalizeModelId(new URLSearchParams(window.location.search).get("model"));
    if (linked && (Object.values(AiModelsEnum) as string[]).includes(linked)) {
      setModel(linked as AiModelsEnum);
    }
  }, [setMediaType, setModel]);

  return (
    <>
      {/* The prompt and settings live in the layout's sidebar (above this on phones). */}
      <div className="flex h-full w-full flex-1 flex-col text-foreground">
        <div className="flex min-h-0 flex-1 flex-col sm:overflow-hidden">
          <MediaExplorer explore styles />
        </div>
      </div>
    </>
  );
}
