import { z } from "zod";

/** Kling 4.0 and 4.0 Flash (Kling's omni-video API). Kept in sync with the backend. */
const seconds = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

/** Fixed ratios only (no auto); 16:9 by default. */
const ASPECT_RATIOS = ["16:9", "9:16", "1:1", "4:3", "3:4", "21:9"] as const;
const AUDIO = ["native", "original"] as const;

export const Kling40InputConst = {
  resolution: ["720p", "1080p"] as const,
  duration: seconds(3, 30),
  aspectRatio: ASPECT_RATIOS,
  audio: AUDIO,
};

export const Kling40FlashInputConst = {
  resolution: ["720p"] as const,
  duration: seconds(3, 20),
  aspectRatio: ASPECT_RATIOS,
  audio: AUDIO,
};

export const KlingOmniLimits = {
  maxImages: 10,
  maxVideos: 3,
  maxPromptLength: 10000,
  /** Each reference video: 3-30 s (Flash: 3-20 s in total). */
  minReferenceSec: 3,
} as const;

export type KlingOmniAspectRatio = (typeof ASPECT_RATIOS)[number];
export type KlingOmniAudio = (typeof AUDIO)[number];

export interface IKling40Input {
  prompt: string;
  /** @Image1, @Image2, … in the prompt */
  images: string[];
  /** @Video1, … */
  videos: string[];
  resolution: "720p" | "1080p";
  duration: number;
  aspectRatio: KlingOmniAspectRatio;
  /** native: generated sound; original: keep @Video1's sound. */
  audio: KlingOmniAudio;
}

function schema(consts: typeof Kling40InputConst | typeof Kling40FlashInputConst) {
  const durations = consts.duration;
  return z
    .object({
      prompt: z.string().max(KlingOmniLimits.maxPromptLength),
      images: z.array(z.string().url()).max(KlingOmniLimits.maxImages),
      videos: z.array(z.string().url()).max(KlingOmniLimits.maxVideos),
      resolution: z.enum(consts.resolution as unknown as [string, ...string[]]),
      duration: z.number().int().min(durations[0]).max(durations[durations.length - 1]),
      // Older saved requests may hold "adaptive": they run at 16:9.
      aspectRatio: z.preprocess((v) => ((ASPECT_RATIOS as readonly unknown[]).includes(v) ? v : "16:9"), z.enum(ASPECT_RATIOS)),
      audio: z.enum(AUDIO),
    })
    .refine((v) => v.prompt.trim().length > 0 || v.images.length + v.videos.length > 0, {
      message: "Write a prompt or add a reference",
    })
    .refine((v) => v.audio !== "original" || v.videos.length > 0, {
      message: "Keeping the original sound needs a reference video",
    }) as unknown as z.ZodType<IKling40Input>;
}

export const kling40ValidationSchema = schema(Kling40InputConst);
export const kling40FlashValidationSchema = schema(Kling40FlashInputConst);
