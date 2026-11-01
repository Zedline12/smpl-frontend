import { z } from "zod";

export const AdsStudioInputConst = {
  aspectRatio: [
    "1:1",
    "4:5",
    "5:4",
    "16:9",
    "9:16",
    "4:3",
    "3:4",
    "21:9",
    "3:2",
    "2:3",
    "2:1",
    "1:2",
  ] as const,
  batchSize: [1, 2, 3, 4, 5, 6, 7, 8] as const,
  maxImages: 10,
  maxPromptLength: 8000,
  maxNicheLength: 1000,
  maxTargetAudienceLength: 2000,
  maxLanguageLength: 80,
};

export type AdsStudioAspectRatio = (typeof AdsStudioInputConst.aspectRatio)[number];

export interface IAdsStudioInput {
  prompt: string;
  images: string[];
  niche: string;
  targetAudience: string;
  language: string;
  aspectRatio: AdsStudioAspectRatio;
  batchSize: number;
}

const c = AdsStudioInputConst;
export const adsStudioValidationSchema = z.object({
  prompt: z.string().trim().min(1).max(c.maxPromptLength),
  images: z.array(z.string().url()).max(c.maxImages),
  niche: z.string().max(c.maxNicheLength),
  targetAudience: z.string().max(c.maxTargetAudienceLength),
  language: z.string().max(c.maxLanguageLength),
  aspectRatio: z.enum(c.aspectRatio),
  batchSize: z.number().int().min(1).max(8),
}) as z.ZodType<IAdsStudioInput>;
