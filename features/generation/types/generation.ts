import { MediaType } from "@/features/media/types/media";
import {
  KlingO3ImageOptions,
  klingO3ImageValidationSchema,
} from "./models/kling-o3-image.type";
import {
  Veo3AspectRatio,
  Veo3Input,
  Veo3Resolution,
  veo3ValidationSchema,
} from "./models/veo-3.type";
import {
  GeminiFlashImageAspectRatio,
  GeminiFlashImageInput,
  GeminiFlashImageResolution,
  geminiFlashImageValidationSchema,
} from "./models/gemini-flash-image.type";
import {
  IKlingV3ProMotionControlInput,
  klingV3ProMotionValidationSchema,
} from "./models/kling-v3-pro-motion-control";
import { AiModelsEnum } from "../enums/models.enum";
import {
  IKlingV3ImageToVideoInput,
  klingV3ImageToVideoValidationSchema,
} from "./models/kling-v3-image-to-video.type";
import {
  IKlingV3TextToVideoInput,
  klingV3TextToVideoValidationSchema,
} from "./models/kling-v3-text-to-video.type";
import {
  IElevenLabsV3Input,
  elevenLabsV3ValidationSchema,
} from "./models/elevenlabs-v3.type";
import {
  ISeedreamV45Input,
  seedreamV45ValidationSchema,
} from "./models/seedream-v4-5.type";
import {
  ISeedance20Input,
  seedance20ValidationSchema,
} from "./models/seedance-2.0.type";
import {
  ISeedance25Input,
  seedance25ValidationSchema,
} from "./models/seedance-2.5.type";
import {
  GptImage2AspectRatio,
  IGptImage2Input,
  gptImage2ValidationSchema,
} from "./models/gpt-image-2.type";
import {
  GrokImagineVideo15AspectRatio,
  IGrokImagineVideo15Input,
  grokImagineVideo15ValidationSchema,
} from "./models/grok-imagine-video-1.5.type";
import {
  IGensuInput,
  gensuValidationSchema,
} from "./models/gensu.type";
import { IRemixInput, remixValidationSchema } from "./models/remix.type";
import {
  IAiInfluencerInput,
  aiInfluencerValidationSchema,
} from "./models/higgsfield-ai-influencer.type";
import {
  IAdsStudioInput,
  adsStudioValidationSchema,
} from "./models/higgsfield-ads-studio.type";
import { IKatanaInput, katanaValidationSchema } from "./models/higgsfield-katana.type";
import { IMusicV25Input, musicV25ValidationSchema } from "./models/elevenlabs-music-v2-5.type";
import {
  IAdsMultiplierInput,
  adsMultiplierValidationSchema,
} from "./models/ads-multiplier.type";
import {
  ISeedance25RefToVideoInput,
  seedance25RefValidationSchema,
} from "./models/seedance-2.5-ref-to-video.type";

export interface BaseAiInput {
  prompt: string;
}
export type AllModelsAspectRatio =
  | KlingO3ImageOptions["aspectRatio"]
  | Veo3AspectRatio
  | GeminiFlashImageAspectRatio
  | GptImage2AspectRatio
  | GrokImagineVideo15AspectRatio;
export type AllModelsResolution =
  | KlingO3ImageOptions["resolution"]
  | Veo3Resolution
  | GeminiFlashImageResolution;
export type AllModelsInput =
  | KlingO3ImageOptions
  | Veo3Input
  | GeminiFlashImageInput
  | IKlingV3ProMotionControlInput
  | IKlingV3ImageToVideoInput
  | IKlingV3TextToVideoInput
  | IElevenLabsV3Input
  | ISeedreamV45Input
  | ISeedance20Input
  | ISeedance25Input
  | IGptImage2Input
  | IGrokImagineVideo15Input
  | IGensuInput
  | IRemixInput
  | IAiInfluencerInput
  | IAdsStudioInput
  | IKatanaInput
  | IMusicV25Input
  | ISeedance25RefToVideoInput
  | IAdsMultiplierInput;

export const ModelsValidatorSchemaMap = {
  [AiModelsEnum.VEO_3]: veo3ValidationSchema,
  [AiModelsEnum.KLING_V3_PRO_MOTION_CONTROL]: klingV3ProMotionValidationSchema,
  [AiModelsEnum.GEMINI_FLASH_IMAGE]: geminiFlashImageValidationSchema,
  [AiModelsEnum.KLING_O3_IMAGE]: klingO3ImageValidationSchema,
  [AiModelsEnum.KLING_V3_IMAGE_TO_VIDEO]: klingV3ImageToVideoValidationSchema,
  [AiModelsEnum.KLING_V3_TEXT_TO_VIDEO]: klingV3TextToVideoValidationSchema,
  [AiModelsEnum.ELEVEN_LABS_V3_TTS]: elevenLabsV3ValidationSchema,
  [AiModelsEnum.SEEDREAM_V4_5]: seedreamV45ValidationSchema,
  [AiModelsEnum.SEEDANCE_2_0]: seedance20ValidationSchema,
  [AiModelsEnum.SEEDANCE_2_5]: seedance25ValidationSchema,
  [AiModelsEnum.GPT_IMAGE_2]: gptImage2ValidationSchema,
  [AiModelsEnum.GROK_IMAGINE_VIDEO_1_5]: grokImagineVideo15ValidationSchema,
  [AiModelsEnum.SMPL_GENSU]:
    gensuValidationSchema,
  [AiModelsEnum.SMPL_REMIX]: remixValidationSchema,
  [AiModelsEnum.HIGGSFIELD_AI_INFLUENCER]: aiInfluencerValidationSchema,
  [AiModelsEnum.HIGGSFIELD_ADS_STUDIO]: adsStudioValidationSchema,
  [AiModelsEnum.HIGGSFIELD_KATANA]: katanaValidationSchema,
  [AiModelsEnum.ELEVENLABS_MUSIC_V2_5]: musicV25ValidationSchema,
  [AiModelsEnum.SEEDANCE_2_5_REF_TO_VIDEO]: seedance25RefValidationSchema,
  [AiModelsEnum.ADS_MULTIPLIER]: adsMultiplierValidationSchema,
};
export enum GenerationTypeEnum {
  VIDEO = "video",
  IMAGE = "image",
  AUDIO = "audio",
}
export interface GenerationQueue {
  id: string;
  jobId: string;
  prompt: string;
  type: MediaType;
  status: "pending" | "processing" | "success" | "failure";
  resultUrl: string;
  mediaId?: string;
  providerUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
export enum GenerationStatus {
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}
export interface Generation {
  id: string;

  user: string;

  model: AiModelsEnum;

  type: string;

  input: any;

  creditsUsed: number;

  status: GenerationStatus;

  errorMessage?: string;

  createdAt: Date;

  updatedAt: Date;
}
