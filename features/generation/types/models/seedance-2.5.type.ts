import { BaseAiInput } from "../generation";
import { z } from "zod";

/** Seedance 2.5 (llmapi). Kept in sync with the backend. */
export const Seedance25InputConst = {
  resolution: ["480p", "720p", "1080p"] as const,
  duration: [
    4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
    24, 25, 26, 27, 28, 29, 30,
  ] as const,
  aspectRatio: ["16:9", "4:3", "1:1", "3:4", "9:16"] as const,
  generateAudio: [true, false] as const,
};

export const Seedance25Limits = {
  maxImages: 9,
  maxVideos: 3,
  maxAudios: 3,
  maxPromptLength: 5000,
  /** Reference videos/audio should be about 2–30 s. */
  minReferenceSec: 2,
  maxReferenceSec: 30,
} as const;

export interface ISeedance25Input extends BaseAiInput {
  resolution?: (typeof Seedance25InputConst.resolution)[number];
  duration?: (typeof Seedance25InputConst.duration)[number];
  aspectRatio?: (typeof Seedance25InputConst.aspectRatio)[number];
  generateAudio?: boolean;
  /** Old start/end-frame inputs (older generations only). */
  imageUrl?: string;
  endImageUrl?: string;
  /** Reference images: [Image 1], [Image 2]… in the prompt. */
  images?: string[];
  /** Old single reference video. */
  videoUrl?: string;
  /** Reference videos: [Video 1]… */
  videos?: string[];
  /** Reference audio: [Audio 1]… */
  audios?: string[];
}

export const seedance25ValidationSchema = z
  .object({
    prompt: z.string().max(Seedance25Limits.maxPromptLength),
    resolution: z.enum(Seedance25InputConst.resolution).optional(),
    duration: z.number().optional(),
    aspectRatio: z.enum(Seedance25InputConst.aspectRatio).optional(),
    generateAudio: z.boolean().optional(),
    imageUrl: z.string().optional(),
    endImageUrl: z.string().optional(),
    images: z.array(z.string()).max(Seedance25Limits.maxImages).optional(),
    videoUrl: z.string().optional(),
    videos: z.array(z.string()).max(Seedance25Limits.maxVideos).optional(),
    audios: z.array(z.string()).max(Seedance25Limits.maxAudios).optional(),
  })
  .refine(
    (v) =>
      !!v.prompt?.trim() ||
      !!v.imageUrl ||
      !!v.videoUrl ||
      (v.images?.length ?? 0) + (v.videos?.length ?? 0) + (v.audios?.length ?? 0) > 0,
    { message: "Add a prompt or at least one reference" },
  ) as unknown as z.ZodType<ISeedance25Input>;
