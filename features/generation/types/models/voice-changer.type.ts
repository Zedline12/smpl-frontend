import { z } from "zod";

export const VoiceChangerInputConst = {
  minSeconds: 1,
  maxSeconds: 60,
};

export interface IVoiceChangerInput {
  /** Unused; the model has no prompt. */
  prompt: string;
  videoUrl: string;
  voiceId: string;
  removeBackgroundNoise: boolean;
  /** The picked video's length, for the price preview. */
  duration: number;
}

export interface VoiceChangerVoice {
  id: string;
  name: string;
  gender: "female" | "male" | "neutral";
  age: "young" | "middle_aged" | "old";
  accent: string;
  description: string;
  previewUrl: string | null;
}

export const voiceChangerValidationSchema = z.object({
  prompt: z.string().optional(),
  videoUrl: z.string().url().nonempty(),
  voiceId: z.string().nonempty(),
  removeBackgroundNoise: z.boolean().optional(),
  duration: z.number().optional(),
}) as unknown as z.ZodType<IVoiceChangerInput>;
