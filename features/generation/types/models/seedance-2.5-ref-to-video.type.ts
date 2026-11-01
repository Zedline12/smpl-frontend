import { BaseAiInput } from "../generation";
import { z } from "zod";

/** Seedance 2.5 reference-to-video (fal). Kept in sync with the backend. */
export const Seedance25RefInputConst = {
  resolution: ["480p", "720p", "1080p"] as const,
  duration: [
    4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
    24, 25, 26, 27, 28, 29, 30,
  ] as const,
  aspectRatio: ["auto", "21:9", "16:9", "4:3", "1:1", "3:4", "9:16"] as const,
  generateAudio: [true, false] as const,
};

export const Seedance25RefLimits = {
  maxImages: 9,
  maxVideos: 3,
  maxAudios: 3,
  maxPromptLength: 5000,
  minDurationSec: 4,
  maxDurationSec: 30,
  /** fal accepts reference videos/audio of 1.8–30.2 s. */
  minReferenceSec: 2,
  maxReferenceSec: 30,
} as const;

export type Seedance25RefDuration =
  (typeof Seedance25RefInputConst.duration)[number];

export interface ISeedance25RefToVideoInput extends BaseAiInput {
  /** @Image1, @Image2, … in the prompt */
  images: string[];
  /** @Video1, … */
  videos: string[];
  /** @Audio1, … */
  audios: string[];
  resolution: (typeof Seedance25RefInputConst.resolution)[number];
  duration: Seedance25RefDuration;
  aspectRatio: (typeof Seedance25RefInputConst.aspectRatio)[number];
  generateAudio: boolean;
}

export const seedance25RefValidationSchema = z
  .object({
    prompt: z.string().max(Seedance25RefLimits.maxPromptLength),
    images: z.array(z.string().url()).max(Seedance25RefLimits.maxImages),
    videos: z.array(z.string().url()).max(Seedance25RefLimits.maxVideos),
    audios: z.array(z.string().url()).max(Seedance25RefLimits.maxAudios),
    resolution: z.enum(Seedance25RefInputConst.resolution),
    duration: z
      .number()
      .int()
      .min(Seedance25RefLimits.minDurationSec)
      .max(Seedance25RefLimits.maxDurationSec),
    aspectRatio: z.enum(Seedance25RefInputConst.aspectRatio),
    generateAudio: z.boolean(),
  })
  .refine((v) => v.images.length + v.videos.length + v.audios.length > 0, {
    message: "Add at least one image, video or audio reference",
  }) as unknown as z.ZodType<ISeedance25RefToVideoInput>;
