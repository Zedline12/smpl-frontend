import { BaseAiInput } from "../generation";
import { z } from "zod";

export const KlingV3ImageToVideoInputConst = {
  duration: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] as const,
  generateAudio: [true, false] as const,
  
};
export type KlingV3ImageToVideoDuration = (typeof KlingV3ImageToVideoInputConst.duration)[number];

export interface IKlingV3ImageToVideoInput extends BaseAiInput {
  startImageUrl: string;
  duration: KlingV3ImageToVideoDuration;
  generateAudio: boolean;
  endImageUrl?: string;
  multiPrompt?: { prompt: string; duration: number }[];
  elements?: {
    referenceImageUrls?: string[];
    frontalImageUrl?: string;
    videoUrl?: string;
  }[];
}

export const klingV3ImageToVideoValidationSchema = z.object({
  prompt: z.string().optional(),
  startImageUrl: z.string().nonempty(),
  duration: z.number(),
  generateAudio: z.boolean(),
  endImageUrl: z.string().optional(),
  multiPrompt: z
    .array(
      z.object({
        prompt: z.string(),
        duration: z.number().min(1).max(15),
      })
    )
    .optional(),
  elements: z
    .array(
      z.object({
        referenceImageUrls: z.array(z.string()).optional(),
        frontalImageUrl: z.string().optional(),
        videoUrl: z.string().optional(),
      })
    )
    .optional(),
}) as z.ZodType<IKlingV3ImageToVideoInput>;