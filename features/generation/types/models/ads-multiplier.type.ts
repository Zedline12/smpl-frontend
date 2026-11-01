import { BaseAiInput } from "../generation";
import { z } from "zod";
import {
  Seedance25RefDuration,
  Seedance25RefInputConst,
  Seedance25RefLimits,
} from "./seedance-2.5-ref-to-video.type";

/** Ad Multiplier runs on Seedance 2.5 reference-to-video. Kept in sync with the backend. */
export const AdsMultiplierOptionsConst = {
  resolution: Seedance25RefInputConst.resolution,
};

export const AdsMultiplierLimits = {
  maxImages: Seedance25RefLimits.maxImages,
  maxPromptLength: 2000,
  maxHookLength: 300,
  maxCtaLength: 300,
} as const;

export interface IAdsMultiplierInput extends BaseAiInput {
  /** The ad to remake; its length sets `duration`. */
  videoUrl: string;
  /** Characters, products or clothes to put in the new ad. */
  images: string[];
  /** New opening hook; empty means keep the original. */
  hook: string;
  /** New call to action; empty means keep the original. */
  cta: string;
  resolution: (typeof AdsMultiplierOptionsConst.resolution)[number];
  duration: Seedance25RefDuration;
}

export const adsMultiplierValidationSchema = z.object({
  prompt: z.string().max(AdsMultiplierLimits.maxPromptLength),
  videoUrl: z.string().url(),
  images: z.array(z.string().url()).min(1).max(AdsMultiplierLimits.maxImages),
  hook: z.string().max(AdsMultiplierLimits.maxHookLength),
  cta: z.string().max(AdsMultiplierLimits.maxCtaLength),
  resolution: z.enum(AdsMultiplierOptionsConst.resolution),
  duration: z
    .number()
    .int()
    .min(Seedance25RefLimits.minDurationSec)
    .max(Seedance25RefLimits.maxDurationSec),
}) as unknown as z.ZodType<IAdsMultiplierInput>;
