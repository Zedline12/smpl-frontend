import { BaseAiInput } from "../generation";
import { z } from "zod";
import { GensuInputConst } from "./gensu.type";

/** Ad Multiplier runs on Gensu (Kling 4.0). Kept in sync with the backend. */
export const AdsMultiplierOptionsConst = {
  resolution: GensuInputConst.resolution,
};

export const AdsMultiplierLimits = {
  maxImages: 8,
  maxPromptLength: 2000,
  maxHookLength: 300,
  maxCtaLength: 300,
  /** The reference ad's length; the new ad is as long as it (whole seconds, rounded down). */
  minReferenceSec: 4,
  maxReferenceSec: 30,
} as const;

export interface IAdsMultiplierInput extends BaseAiInput {
  /** The ad to remake; its length sets the new ad's length. */
  videoUrl: string;
  /** Characters, products or clothes to put in the new ad. */
  images: string[];
  /** New opening hook; empty means keep the original. A hint: the original audio is kept. */
  hook: string;
  /** New call to action; empty means keep the original. A hint: the original audio is kept. */
  cta: string;
  resolution: (typeof AdsMultiplierOptionsConst.resolution)[number];
  /** Shown to the user only; the backend measures the video itself. */
  duration: number;
}

export const adsMultiplierValidationSchema = z.object({
  prompt: z.string().max(AdsMultiplierLimits.maxPromptLength),
  videoUrl: z.string().url(),
  images: z.array(z.string().url()).min(1).max(AdsMultiplierLimits.maxImages),
  hook: z.string().max(AdsMultiplierLimits.maxHookLength),
  cta: z.string().max(AdsMultiplierLimits.maxCtaLength),
  resolution: z.enum(AdsMultiplierOptionsConst.resolution),
  duration: z.number().int().optional(),
}) as unknown as z.ZodType<IAdsMultiplierInput>;
