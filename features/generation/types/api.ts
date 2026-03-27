import {
  ImageResolution,
  VideoResolution,
  ImageAspectRatio,
  VideoAspectRatio,
  VideoDuration,
  MediaType,
} from "@/features/media/types/media";
import { AllModelsInput } from "./generation";
export interface GenerateRequest{
  model:string;
  projectId:string;
  mediaType:MediaType;
  input:AllModelsInput;
}
export interface GenerateImageRequest {
  prompt: string;
  projectId: string;
  referenceImages?: string[];
  resolution?: ImageResolution;
  aspectRatio?: ImageAspectRatio;
}
export interface GenerateVideoRequest {
  prompt: string;
  projectId: string;
  referenceImages?: string[];
  durationSeconds: VideoDuration;
  resolution?: VideoResolution;
  aspectRatio?: VideoAspectRatio;
  generateAudio: boolean;
}
export interface CalculateGenerationCostRequest {
  resolution: ImageResolution | VideoResolution;
  mediaType: MediaType;
}
export interface CalculateGenerationCostResponse {
  creditsCost: number;
}
