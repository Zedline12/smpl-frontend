import { BaseAiInput } from "../generation";
import { z } from "zod";

export const SeedreamV45OptionsConst = {
  aspectRatio: ["1:1", "3:4", "9:16", "4:3", "16:9"] as const,
};

export type SeedreamV45AspectRatio =
  (typeof SeedreamV45OptionsConst.aspectRatio)[number];

export interface ISeedreamV45Input extends BaseAiInput {
  images?: string[];
  aspectRatio?: SeedreamV45AspectRatio;
}

export const seedreamV45ValidationSchema = z.object({
  prompt: z.string().min(1),
  images: z.array(z.string()).optional(),
  aspectRatio: z.enum(SeedreamV45OptionsConst.aspectRatio).optional(),
});
