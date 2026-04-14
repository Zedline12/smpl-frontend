import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import { GenerationTypeEnum } from "@/features/generation/types/generation";
import { GeminiFlashImageInput } from "@/features/generation/types/models/gemini-flash-image.type";
import { KlingO3ImageInput } from "@/features/generation/types/models/kling-o3-image.type";
import { Veo3Input } from "@/features/generation/types/models/veo-3.type";
import { IKlingV3ProMotionControlInput } from "@/features/generation/types/models/kling-v3-pro-motion-control";
import { IKlingV3ImageToVideoInput } from "@/features/generation/types/models/kling-v3-image-to-video.type";
import { IKlingV3TextToVideoInput } from "@/features/generation/types/models/kling-v3-text-to-video.type";
import { IElevenLabsV3Input, ElevenLabsV3ApplyTextNormalization, ElevenLabsV3Voice } from "@/features/generation/types/models/elevenlabs-v3.type";

export type ModelStateMap = {
  [AiModelsEnum.VEO_3]: Veo3Input;
  [AiModelsEnum.KLING_O3_IMAGE]: KlingO3ImageInput;
  [AiModelsEnum.GEMINI_FLASH_IMAGE]: GeminiFlashImageInput;
  [AiModelsEnum.KLING_V3_PRO_MOTION_CONTROL]: IKlingV3ProMotionControlInput;
  [AiModelsEnum.KLING_V3_IMAGE_TO_VIDEO]: IKlingV3ImageToVideoInput;
  [AiModelsEnum.KLING_V3_TEXT_TO_VIDEO]: IKlingV3TextToVideoInput;
  [AiModelsEnum.ELEVEN_LABS_V3_TTS]: IElevenLabsV3Input;
};
export const MediaTypeDefaultModel: Record<GenerationTypeEnum, AiModelsEnum> = {
  [GenerationTypeEnum.VIDEO]: AiModelsEnum.VEO_3,
  [GenerationTypeEnum.IMAGE]: AiModelsEnum.GEMINI_FLASH_IMAGE,
  [GenerationTypeEnum.AUDIO]: AiModelsEnum.ELEVEN_LABS_V3_TTS,
};
export const ModelDefaults: { [M in AiModelsEnum]: ModelStateMap[M] } = {
  [AiModelsEnum.VEO_3]: {
    prompt: "",
    aspectRatio: "16:9",
    resolution: "720p",
    durationSeconds: 4,
    images: [],
    generateAudio: false,
  },
  [AiModelsEnum.KLING_V3_IMAGE_TO_VIDEO]: {
    prompt: "",
    startImageUrl: "",
    duration: 4,
    generateAudio: false,
    endImageUrl: "",
  },
  [AiModelsEnum.KLING_V3_TEXT_TO_VIDEO]: {
    prompt: "",
    duration: 4,
    aspectRatio: "16:9",
    generateAudio: false,
  },
  [AiModelsEnum.KLING_O3_IMAGE]: {
    prompt: "",
    aspectRatio: "1:1",
    images: [],
    resolution: "1K",
  },
  [AiModelsEnum.GEMINI_FLASH_IMAGE]: {
    prompt: "",
    aspectRatio: "1:1",
    images: [],
    resolution: "1K",
  },
  [AiModelsEnum.KLING_V3_PRO_MOTION_CONTROL]: {
    prompt: "",
    videoUrl: "",
    imageUrl: "",
    keepOriginalSound: false,
    characterOrientation: "image",
  },
  [AiModelsEnum.ELEVEN_LABS_V3_TTS]: {
    prompt: "",
    voice: ElevenLabsV3Voice.ARIA,
    applyTextNormalization: ElevenLabsV3ApplyTextNormalization.AUTO,
    stability: 0.5,
    languageCode: "en",
  },
};
