
import { BaseAiInput } from "../generation";
import { z } from "zod";
export const VEO3_ASPECT_RATIOS = ["16:9", "9:16"] as const;
export const VEO3_RESOLUTIONS = ["720p", "1080p", "4k"] as const;

export const VEO3_DURATION_SECONDS = [4, 6, 8];

export type Veo3Resolution = (typeof VEO3_RESOLUTIONS)[number]; 
export type Veo3AspectRatio = (typeof VEO3_ASPECT_RATIOS)[number];
export type Veo3Duration = (typeof VEO3_DURATION_SECONDS)[number];

export interface Veo3Options {
  aspectRatio: Veo3AspectRatio;
  resolution: Veo3Resolution;
  durationSeconds: Veo3Duration;
  images: string[];
  generateAudio: boolean;
}
export interface Veo3Input extends BaseAiInput, Veo3Options {}
export const veo3ValidationSchema = z.object({
  prompt: z.string().nonempty(),
  aspectRatio: z.string().nonempty(),
  resolution: z.string().nonempty(),
  durationSeconds: z.number(),
  images: z.array(z.string()).optional(),
  generateAudio: z.boolean(),
}) as z.ZodType<Veo3Input>;
