import { BaseAiInput } from "../generation";
import {z} from "zod"

export const KlingV3ProMotionControlInputConst= {
  characterOrientation: ['image', 'video'] as const,
  keepOriginalSound: [true, false] as const,
}
export interface IKlingV3ProMotionControlInput extends BaseAiInput {
  videoUrl: string;
  imageUrl: string;
  keepOriginalSound?: (typeof KlingV3ProMotionControlInputConst.keepOriginalSound)[number];
  characterOrientation?: (typeof KlingV3ProMotionControlInputConst.characterOrientation)[number];
}

export const klingV3ProMotionValidationSchema = z.object({
  prompt: z.string().optional(),
  videoUrl: z.string().url().nonempty(),
  imageUrl: z.string().url().nonempty(),
  keepOriginalSound: z.boolean().optional(),
  characterOrientation: z.enum(KlingV3ProMotionControlInputConst.characterOrientation).optional(),
}) as z.ZodType<IKlingV3ProMotionControlInput>