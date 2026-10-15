import { z } from "zod";

export const GENJUTSU_MOTION_TRANSFER_MAX_IMAGES = 8;

export const GenjutsuMotionTransferInputConst = {
  resolution: ["480p", "720p", "1080p"] as const,
};

export interface IGenjutsuMotionTransferInput {
  prompt: string;
  videoUrl: string;
  images: string[];
  resolution?: (typeof GenjutsuMotionTransferInputConst.resolution)[number];
}

export const genjutsuMotionTransferValidationSchema = z.object({
  prompt: z.string().max(10000).optional(),
  videoUrl: z.string().url().nonempty(),
  images: z
    .array(z.string().url())
    .min(1)
    .max(GENJUTSU_MOTION_TRANSFER_MAX_IMAGES),
  resolution: z.enum(GenjutsuMotionTransferInputConst.resolution).optional(),
}) as z.ZodType<IGenjutsuMotionTransferInput>;
