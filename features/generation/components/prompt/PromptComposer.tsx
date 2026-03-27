"use client";
import React, { useState } from "react";
import PromptInputHeader from "@/features/generation/components/prompt/PromptComposerHeader";
import {
  GenerateImageRequest,
  GenerateVideoRequest,
} from "@/features/generation/types/api";
import { useAiGenerationControlStore } from "@/stores/useAiGenerationControlStore";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import GeminiFlashImageComposer from "./composers/gemini-flash-image.composer";
import KlingO3ImageComposer from "./composers/kling-03-image.composer";
import Veo3Composer from "./composers/veo-3.composer";
import KlingV3ProMotionControlComposer from "./composers/kling-v3-pro-motion-control";
export interface MediaComposerHandle {
  isValid: boolean;
  getPayload(): GenerateImageRequest | GenerateVideoRequest;
  reset(): void;
}


export default function PromptComposer() {
  const { model } = useAiGenerationControlStore();

  const [isFocused, setIsFocused] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    console.log(model);
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFocus = () => setIsFocused(true);

  return (
    <div
      ref={containerRef}
      onFocus={handleFocus}
      onClick={handleFocus}
      className="w-full bg-black/50 backdrop-blur-lg   rounded-2xl shadow-xl   transition-all duration-100"
    >
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isFocused ? "max-h-[100px] " : "max-h-0 "
        }`}
      >
        <PromptInputHeader />
      </div>

      <div className="p-2 ">
        {model === AiModelsEnum.GEMINI_FLASH_IMAGE && (
          <GeminiFlashImageComposer isFocused={isFocused} />
        )}
        {model === AiModelsEnum.KLING_O3_IMAGE && (
          <KlingO3ImageComposer isFocused={isFocused} />
        )}
        {model === AiModelsEnum.VEO_3 && <Veo3Composer isFocused={isFocused} />}
        {model === AiModelsEnum.KLING_V3_PRO_MOTION_CONTROL && (
          <KlingV3ProMotionControlComposer isFocused={isFocused} />
        )}
      </div>
    </div>
  );
}
