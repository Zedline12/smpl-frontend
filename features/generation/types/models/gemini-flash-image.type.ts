import { BaseAiInput } from "../generation";
import {z} from "zod"
export const GEMINI_FLASH_IMAGE_ASPECT_RATIOS = [
  "16:9",
  "4:3",
  "1:1",
  "3:4",
  "9:16",
  "5:4",
] as const;

export const GEMINI_FLASH_IMAGE_RESOLUTIONS = ["1K", "2K", "4K"] as const;

export type GeminiFlashImageResolution =
  (typeof GEMINI_FLASH_IMAGE_RESOLUTIONS)[number];
export type GeminiFlashImageAspectRatio =
  (typeof GEMINI_FLASH_IMAGE_ASPECT_RATIOS)[number];

export interface GeminiFlashImageOptions {
  aspectRatio: GeminiFlashImageAspectRatio;
  resolution: GeminiFlashImageResolution;
  images: string[];
}
export interface GeminiFlashImageInput
  extends BaseAiInput, GeminiFlashImageOptions { }

export const geminiFlashImageValidationSchema = z.object({
  prompt: z.string().nonempty(),
  aspectRatio: z.string().nonempty(),
  resolution: z.string().nonempty(),
  images: z.array(z.string()).optional(),
}) as z.ZodType<GeminiFlashImageInput>;
