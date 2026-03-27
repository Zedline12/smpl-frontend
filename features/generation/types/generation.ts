import { MediaType } from "@/features/media/types/media";
import { KlingO3ImageOptions, klingO3ImageValidationSchema } from "./models/kling-o3-image.type";
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
import { IKlingV3ProMotionControlInput, klingV3ProMotionValidationSchema } from "./models/kling-v3-pro-motion-control";
import { AiModelsEnum } from "../enums/models.enum";
export interface BaseAiInput {
  prompt: string;
}
export type AllModelsAspectRatio =
  | KlingO3ImageOptions["aspectRatio"]
  | Veo3AspectRatio
  | GeminiFlashImageAspectRatio;
export type AllModelsResolution =
  | KlingO3ImageOptions["resolution"]
  | Veo3Resolution
  | GeminiFlashImageResolution;
export type AllModelsInput =
  | KlingO3ImageOptions
  | Veo3Input
  | GeminiFlashImageInput | IKlingV3ProMotionControlInput;

  export const ModelsValidatorSchemaMap = {
    [AiModelsEnum.VEO_3]:veo3ValidationSchema,
    [AiModelsEnum.KLING_V3_PRO_MOTION_CONTROL]:klingV3ProMotionValidationSchema,
    [AiModelsEnum.GEMINI_FLASH_IMAGE]:geminiFlashImageValidationSchema,
    [AiModelsEnum.KLING_O3_IMAGE]:klingO3ImageValidationSchema,
  };
export enum GenerationTypeEnum {
  VIDEO = "video",
  IMAGE = "image",
}
export interface GenerationQueue {
  id: string;
  jobId: string;
  prompt: string;
  type: MediaType;
  status: "pending" | "processing" | "success" | "failure";
  resultUrl: string;
  createdAt: Date;
  updatedAt: Date;
}
