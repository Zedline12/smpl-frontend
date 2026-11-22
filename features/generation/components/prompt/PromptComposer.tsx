"use client";
import React, { useState } from "react";
import PromptInputHeader from "@/features/generation/components/prompt/PromptComposerHeader";
import {
  GenerateImageRequest,
  GenerateVideoRequest,
} from "@/features/generation/types/api";
import { useAiGenerationControlStore } from "@/stores/useAiGenerationControlStore";
import {
  AiModelsEnum,
  getModel,
} from "@/features/generation/enums/models.enum";
import { MediaTypeDefaultModel } from "@/stores/aiGenerationStore.type";
import GeminiFlashImageComposer from "./composers/gemini-flash-image.composer";
import KlingO3ImageComposer from "./composers/kling-03-image.composer";
import Veo3Composer from "./composers/veo-3.composer";
import KlingV3ProMotionControlComposer from "./composers/kling-v3-pro-motion-control";
import KlingV3ImageToVideoComposer from "./composers/kling-v3-image-to-video.composer";
import KlingV3TextToVideoComposer from "./composers/kling-v3-text-to-video.composer";
import ElevenLabsV3Composer from "./composers/eleven-labs-v3.composer";
import { useCatalog } from "@/features/catalog/catalog";
import SeedreamV45Composer from "./composers/seedream-v4-5.composer";
import Seedance20Composer from "./composers/seedance-2.0.composer";
import Seedance25RefComposer from "./composers/seedance-2.5-ref.composer";
import GptImage2Composer from "./composers/gpt-image-2.composer";
import GrokImagineVideo15Composer from "./composers/grok-imagine-video-1.5.composer";
import OmniHumanV2Composer from "./composers/omnihuman-v2.composer";
import GensuComposer from "./composers/gensu.composer";
import Kling40Composer from "./composers/kling-4-0.composer";
/** Models this composer can drive; the rest (Ad Multiplier, edit tools) only exist in the sidebar. */
const HAS_COMPOSER: ReadonlySet<AiModelsEnum> = new Set([
  AiModelsEnum.GEMINI_FLASH_IMAGE,
  AiModelsEnum.KLING_O3_IMAGE,
  AiModelsEnum.VEO_3,
  AiModelsEnum.KLING_V3_PRO_MOTION_CONTROL,
  AiModelsEnum.KLING_V3_IMAGE_TO_VIDEO,
  AiModelsEnum.KLING_V3_TEXT_TO_VIDEO,
  AiModelsEnum.ELEVEN_LABS_V3_TTS,
  AiModelsEnum.SEEDREAM_V4_5,
  AiModelsEnum.SEEDANCE_2_0,
  AiModelsEnum.SEEDANCE_2_5,
  AiModelsEnum.FAL_SEEDANCE_2_5,
  AiModelsEnum.GPT_IMAGE_2,
  AiModelsEnum.GROK_IMAGINE_VIDEO_1_5,
  AiModelsEnum.OMNIHUMAN_V2,
  AiModelsEnum.SMPL_GENSU,
  AiModelsEnum.KLING_4_0,
  AiModelsEnum.KLING_4_0_FLASH,
]);

export interface MediaComposerHandle {
  isValid: boolean;
  getPayload(): GenerateImageRequest | GenerateVideoRequest;
  reset(): void;
}

export default function PromptComposer() {
  const { model, mediaType, setMediaType, templateMode } =
    useAiGenerationControlStore();
  // getModel() names below follow the catalog.
  useCatalog();

  const [isFocused, setIsFocused] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
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
      id="tour-prompt-composer"
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
        {!HAS_COMPOSER.has(model) && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-2 py-3">
            <p className="text-foreground/70 text-sm">
              <span className="text-foreground font-semibold">
                {getModel(model)?.name ?? "This tool"}
              </span>{" "}
              isn't available in this prompt box.
            </p>
            {/* Not in the admin templates editor, where the model is picked on purpose. */}
            {!templateMode && (
              <button
                type="button"
                // setMediaType switches back to that type's default model.
                onClick={() => setMediaType(mediaType)}
                className="bg-primary cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Use{" "}
                {getModel(MediaTypeDefaultModel[mediaType])?.name ??
                  "the default model"}
              </button>
            )}
          </div>
        )}
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
        {model === AiModelsEnum.KLING_V3_IMAGE_TO_VIDEO && (
          <KlingV3ImageToVideoComposer isFocused={isFocused} />
        )}
        {model === AiModelsEnum.KLING_V3_TEXT_TO_VIDEO && (
          <KlingV3TextToVideoComposer isFocused={isFocused} />
        )}
        {model === AiModelsEnum.ELEVEN_LABS_V3_TTS && (
          <ElevenLabsV3Composer isFocused={isFocused} />
        )}
        {model === AiModelsEnum.SEEDREAM_V4_5 && (
          <SeedreamV45Composer isFocused={isFocused} />
        )}
        {model === AiModelsEnum.SEEDANCE_2_0 && (
          <Seedance20Composer isFocused={isFocused} />
        )}
        {(model === AiModelsEnum.SEEDANCE_2_5 ||
          model === AiModelsEnum.FAL_SEEDANCE_2_5) && (
          <Seedance25RefComposer isFocused={isFocused} model={model} />
        )}
        {model === AiModelsEnum.GPT_IMAGE_2 && (
          <GptImage2Composer isFocused={isFocused} />
        )}
        {model === AiModelsEnum.GROK_IMAGINE_VIDEO_1_5 && (
          <GrokImagineVideo15Composer isFocused={isFocused} />
        )}
        {model === AiModelsEnum.OMNIHUMAN_V2 && (
          <OmniHumanV2Composer isFocused={isFocused} />
        )}
        {model === AiModelsEnum.SMPL_GENSU && (
          <GensuComposer isFocused={isFocused} />
        )}
        {(model === AiModelsEnum.KLING_4_0 ||
          model === AiModelsEnum.KLING_4_0_FLASH) && (
          <Kling40Composer isFocused={isFocused} model={model} />
        )}
      </div>
    </div>
  );
}
