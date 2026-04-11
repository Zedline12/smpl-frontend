import { BaseAiInput } from "../generation";
import { z } from "zod";

export const KlingV3ImageToVideoInputConst = {
  duration: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] as const,
  generateAudio: [true, false] as const,
  
};
export type KlingV3ImageToVideoDuration = (typeof KlingV3ImageToVideoInputConst.duration)[number];

export interface IKlingV3ImageToVideoInput extends BaseAiInput {
  startImageUrl: string;
  duration: KlingV3ImageToVideoDuration;
  generateAudio: boolean;
  endImageUrl?: string;
}
export const klingV3ImageToVideoValidationSchema = z.object({
    prompt: z.string().nonempty(),
  startImageUrl: z.string().nonempty(),
  duration: z.number(),
  generateAudio: z.boolean(),
  endImageUrl: z.string().optional(),
}) as z.ZodType<IKlingV3ImageToVideoInput>;