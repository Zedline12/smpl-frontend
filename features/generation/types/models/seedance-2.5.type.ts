import { BaseAiInput } from "../generation";
import { z } from "zod";
export const Seedance25InputConst = {
  resolution: ["480p", "720p", "1080p"] as const,
  duration: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] as const,
  aspectRatio: ["21:9", "16:9", "4:3", "1:1", "3:4", "9:16"] as const,
  generateAudio: [true, false] as const,
};

export interface ISeedance25Input extends BaseAiInput {
  resolution?: (typeof Seedance25InputConst.resolution)[number];
  duration?: (typeof Seedance25InputConst.duration)[number];
  aspectRatio?: (typeof Seedance25InputConst.aspectRatio)[number];
  generateAudio?: boolean;
  imageUrl?: string;
  endImageUrl?: string;
}

export const seedance25ValidationSchema = z.object({
  prompt: z.string().nonempty(),
  resolution: z.enum(Seedance25InputConst.resolution).optional(),
  duration: z.number().optional(),
  aspectRatio: z.enum(Seedance25InputConst.aspectRatio).optional(),
  generateAudio: z.boolean().optional(),
  imageUrl: z.string().optional(),
  endImageUrl: z.string().optional(),
}) as z.ZodType<ISeedance25Input>;
