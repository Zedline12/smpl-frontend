import { BaseAiInput } from "../generation";
import { z } from "zod";

export const GptImage2OptionsConst = {
  aspectRatio: ["1:1", "3:4", "9:16", "4:3", "16:9", "auto"] as const,
  quality: ["auto", "low", "medium", "high"] as const,
};

export type GptImage2AspectRatio =
  (typeof GptImage2OptionsConst.aspectRatio)[number];

export type GptImage2Quality = (typeof GptImage2OptionsConst.quality)[number];

export const GPT_IMAGE_2_MAX_IMAGES = 16;

export interface IGptImage2Input extends BaseAiInput {
  images?: string[];
  aspectRatio?: GptImage2AspectRatio;
  quality?: GptImage2Quality;
}

export const gptImage2ValidationSchema = z.object({
  prompt: z.string().min(1),
  images: z.array(z.string()).max(GPT_IMAGE_2_MAX_IMAGES).optional(),
  aspectRatio: z.enum(GptImage2OptionsConst.aspectRatio).optional(),
  quality: z.enum(GptImage2OptionsConst.quality).optional(),
});
