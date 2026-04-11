import { BaseAiInput } from "../generation";
import { z } from "zod";

export const KlingV3TextToVideoInputConst = {
  duration: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] as const,
  generateAudio: [true, false] as const,
  aspectRatio: ['16:9', '9:16', '1:1'] as const,
};

export type KlingV3TextToVideoDuration = (typeof KlingV3TextToVideoInputConst.duration)[number];
export type KlingV3TextToVideoAspectRatio = (typeof KlingV3TextToVideoInputConst.aspectRatio)[number];

export interface IKlingV3TextToVideoInput extends BaseAiInput {
  duration: KlingV3TextToVideoDuration;
  generateAudio: boolean;
  aspectRatio: KlingV3TextToVideoAspectRatio;
}
export const klingV3TextToVideoValidationSchema = z.object({
  prompt: z.string().nonempty(),
  aspectRatio: z.enum(KlingV3TextToVideoInputConst.aspectRatio),
  duration: z.number(),
  generateAudio: z.boolean(),
}) as z.ZodType<IKlingV3TextToVideoInput>;