import { BaseAiInput } from "../generation";
import { z } from "zod";
export const Seedance20InputConst = {
  resolution: ["480p", "720p", "1080p"] as const,
  duration: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] as const,
  aspectRatio: ["21:9", "16:9", "4:3", "1:1", "3:4", "9:16"] as const,
  generateAudio: [true, false] as const,
};

export interface ISeedance20Input extends BaseAiInput {
  resolution?: (typeof Seedance20InputConst.resolution)[number];
  duration?: (typeof Seedance20InputConst.duration)[number];
  aspectRatio?: (typeof Seedance20InputConst.aspectRatio)[number];
  generateAudio?: boolean;
  imageUrl?: string;
  endImageUrl?: string;
}

export const seedance20ValidationSchema = z.object({
  prompt: z.string().nonempty(),
  resolution: z.enum(Seedance20InputConst.resolution).optional(),
  duration: z.number().optional(),
  aspectRatio: z.enum(Seedance20InputConst.aspectRatio).optional(),
  generateAudio: z.boolean().optional(),
  imageUrl: z.string().optional(),
  endImageUrl: z.string().optional(),
}) as z.ZodType<ISeedance20Input>;