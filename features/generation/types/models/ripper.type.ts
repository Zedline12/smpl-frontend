import { z } from "zod";
import { GensuInputConst } from "./gensu.type";

/** Ripper runs on Gensu: same 4-30s source video rule (Kling 4.0). */
export const RIPPER_MIN_SECONDS = 4;
export const RIPPER_MAX_SECONDS = 30;

export const RipperInputConst = {
  resolution: GensuInputConst.resolution,
};

/** Ripper: an uploaded social video plus one character image (the user confirms they have the rights to it). */
export interface IRipperInput {
  prompt: string;
  /** The uploaded TikTok / Instagram / YouTube video. */
  videoUrl: string;
  /** The character photo. */
  image: string;
  resolution?: (typeof RipperInputConst.resolution)[number];
}

export const ripperValidationSchema = z.object({
  prompt: z.string().max(5000).optional(),
  videoUrl: z.string().url().nonempty(),
  image: z.string().url().nonempty(),
  resolution: z.enum(RipperInputConst.resolution).optional(),
}) as z.ZodType<IRipperInput>;
