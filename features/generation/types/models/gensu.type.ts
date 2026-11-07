import { z } from "zod";

export const GENSU_MAX_IMAGES = 3;

export const GensuInputConst = {
  resolution: ["480p", "720p", "1080p"] as const,
};

export interface IGensuInput {
  prompt: string;
  videoUrl: string;
  images: string[];
  resolution?: (typeof GensuInputConst.resolution)[number];
}

export const gensuValidationSchema = z.object({
  prompt: z.string().max(10000).optional(),
  videoUrl: z.string().url().nonempty(),
  images: z
    .array(z.string().url())
    .min(1)
    .max(GENSU_MAX_IMAGES),
  resolution: z.enum(GensuInputConst.resolution).optional(),
}) as z.ZodType<IGensuInput>;
