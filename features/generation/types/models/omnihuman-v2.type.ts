import { z } from "zod";

/**
 * OmniHuman v2 (ByteDance, on fal): the person in one image sings or speaks an audio,
 * lip-synced. The video is as long as the audio and has the image's shape. Kept in sync with the backend.
 */
export const OmniHumanV2InputConst = {
  minSeconds: 4,
  maxSeconds: 300,
  maxPromptLength: 2000,
  /** fal's limit on the audio file. */
  maxAudioBytes: 15 * 1024 * 1024,
  /** fal only takes wav or mp3. */
  audioTypes: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/wave"] as const,
};

export interface IOmniHumanV2Input {
  prompt: string;
  /** The person to animate. */
  imageUrl: string;
  /** What they sing or say (wav or mp3, 4-300 s). */
  audioUrl: string;
  /** The audio's length, for the price preview. */
  duration?: number;
}

export const omniHumanV2ValidationSchema = z.object({
  prompt: z.string().max(OmniHumanV2InputConst.maxPromptLength).optional(),
  imageUrl: z.string().url().nonempty(),
  audioUrl: z.string().url().nonempty(),
  duration: z.number().optional(),
}) as unknown as z.ZodType<IOmniHumanV2Input>;
