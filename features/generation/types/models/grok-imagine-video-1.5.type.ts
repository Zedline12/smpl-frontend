import { BaseAiInput } from "../generation";
import { z } from "zod";

export const GrokImagineVideo15InputConst = {
  duration: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] as const,
  resolution: ["480p", "720p", "1080p"] as const,
  aspectRatio: ["16:9", "4:3", "3:2", "1:1", "2:3", "3:4", "9:16"] as const,
};

export type GrokImagineVideo15AspectRatio =
  (typeof GrokImagineVideo15InputConst.aspectRatio)[number];

export interface IGrokImagineVideo15Input extends BaseAiInput {
  duration?: (typeof GrokImagineVideo15InputConst.duration)[number];
  resolution?: (typeof GrokImagineVideo15InputConst.resolution)[number];
  aspectRatio?: GrokImagineVideo15AspectRatio;
  /** The endpoint takes a single image; the provider sends `images[0]`. */
  images?: string[];
}

export const grokImagineVideo15ValidationSchema = z.object({
  prompt: z.string().nonempty(),
  duration: z.number().optional(),
  resolution: z.enum(GrokImagineVideo15InputConst.resolution).optional(),
  aspectRatio: z.enum(GrokImagineVideo15InputConst.aspectRatio).optional(),
  images: z.array(z.string()).max(1).optional(),
}) as z.ZodType<IGrokImagineVideo15Input>;
