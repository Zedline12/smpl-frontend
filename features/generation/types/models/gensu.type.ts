import { z } from "zod";

export const GENSU_MAX_IMAGES = 3;

export const GensuInputConst = {
  /** Gensu runs on Kling 4.0 (720p/1080p); saved 480p requests become 720p. */
  resolution: ["720p", "1080p"] as const,
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
  resolution: z
    .preprocess((v) => (v === "480p" ? "720p" : v), z.enum(GensuInputConst.resolution))
    .optional(),
}) as z.ZodType<IGensuInput>;
