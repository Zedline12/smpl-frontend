import { z } from "zod";

/** Ads Studio runs on Nano Banana Pro, so ratios and sizes follow that model. */
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
  ] as const,
  resolution: ["1K", "2K", "4K"] as const,
  batchSize: [1, 2, 3, 4, 5, 6, 7, 8] as const,
  maxImages: 10,
  maxPromptLength: 8000,
  maxNicheLength: 1000,
  maxTargetAudienceLength: 2000,
  maxLanguageLength: 80,
  /** Limits for the brand kit sent with an ad (same as the backend's). */
  brand: {
    text: 120,
    tagline: 200,
    description: 1500,
    audience: 1000,
    item: 200,
    list: 12,
    colors: 12,
  },
};

export type AdsStudioAspectRatio =
  (typeof AdsStudioInputConst.aspectRatio)[number];
export type AdsStudioResolution =
  (typeof AdsStudioInputConst.resolution)[number];

/** The brand kit an ad is for (picked in Ads Studio); the logo goes in `images`. */
export interface AdsStudioBrand {
  name?: string;
  tagline?: string;
  description?: string;
  primaryColor?: string;
  /** The palette, main colour first. */
  colors?: string[];
  headerFont?: string;
  bodyFont?: string;
  sellingPoints?: string[];
  audience?: string;
  aesthetics?: string[];
  toneOfVoice?: string[];
}

export interface IAdsStudioInput {
  prompt: string;
  images: string[];
  niche: string;
  targetAudience: string;
  language: string;
  aspectRatio: AdsStudioAspectRatio;
  resolution: AdsStudioResolution;
  batchSize: number;
  brand?: AdsStudioBrand;
}

const c = AdsStudioInputConst;
const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const brandList = z.array(z.string().max(c.brand.item)).max(c.brand.list);
export const adsStudioValidationSchema = z.object({
  prompt: z.string().trim().min(1).max(c.maxPromptLength),
  images: z.array(z.string().url()).max(c.maxImages),
  niche: z.string().max(c.maxNicheLength),
  targetAudience: z.string().max(c.maxTargetAudienceLength),
  language: z.string().max(c.maxLanguageLength),
  aspectRatio: z.enum(c.aspectRatio),
  resolution: z.enum(c.resolution),
  batchSize: z.number().int().min(1).max(8),
  brand: z
    .object({
      name: z.string().max(c.brand.text).optional(),
      tagline: z.string().max(c.brand.tagline).optional(),
      description: z.string().max(c.brand.description).optional(),
      primaryColor: hexColor.optional(),
      colors: z.array(hexColor).max(c.brand.colors).optional(),
      headerFont: z.string().max(c.brand.text).optional(),
      bodyFont: z.string().max(c.brand.text).optional(),
      sellingPoints: brandList.optional(),
      audience: z.string().max(c.brand.audience).optional(),
      aesthetics: brandList.optional(),
      toneOfVoice: brandList.optional(),
    })
    .optional(),
}) as z.ZodType<IAdsStudioInput>;
