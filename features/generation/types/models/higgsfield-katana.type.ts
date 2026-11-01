import { z } from "zod";

export const KATANA_MAX_IMAGES = 1;

export const KatanaInputConst = {
  resolution: ["480p", "720p", "1080p"] as const,
};

export interface IKatanaInput {
  prompt?: string;
  videoUrl: string;
  images: string[];
  resolution?: (typeof KatanaInputConst.resolution)[number];
}

export const katanaValidationSchema = z.object({
  prompt: z.string().max(10000).optional(),
  videoUrl: z.string().url().nonempty(),
  images: z
    .array(z.string().url())
    .min(1)
    .max(KATANA_MAX_IMAGES),
  resolution: z.enum(KatanaInputConst.resolution).optional(),
}) as z.ZodType<IKatanaInput>;
