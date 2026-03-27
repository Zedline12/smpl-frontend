import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import { AllModelsInput } from "@/features/generation/types/generation";
import { ImageAspectRatio,VideoAspectRatio, MediaType, ImageResolution, VideoResolution } from "@/features/media/types/media";

export interface GenerateMediaRequest {
  prompt: string;
  mediaType: MediaType;
  projectId: string;
  referenceImages?: File[];
  resolution?: ImageResolution | VideoResolution;
  aspectRatio?: ImageAspectRatio | VideoAspectRatio;
}
export interface CalculateMediaCostRequest{
  model: AiModelsEnum,
  input:AllModelsInput
}
export interface CalculateMediaCostResponse{
    creditsCost: number;
}