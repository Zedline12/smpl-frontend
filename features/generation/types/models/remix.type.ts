import { z } from "zod";
import { GensuInputConst } from "./gensu.type";

/** Remix runs on Gensu: same 4-30s reference video rule. */
export const REMIX_MIN_SECONDS = 4;
export const REMIX_MAX_SECONDS = 30;

export const RemixInputConst = {
  resolution: GensuInputConst.resolution,
};

/** Remix: a reference video plus one character image. */
export interface IRemixInput {
  prompt: string;
  videoUrl: string;
  /** The character photo. */
  image: string;
  resolution?: (typeof RemixInputConst.resolution)[number];
}

export const remixValidationSchema = z.object({
  prompt: z.string().max(5000).optional(),
  videoUrl: z.string().url().nonempty(),
  image: z.string().url().nonempty(),
  resolution: z.enum(RemixInputConst.resolution).optional(),
}) as z.ZodType<IRemixInput>;
