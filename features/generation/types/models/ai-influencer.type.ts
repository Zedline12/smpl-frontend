import { z } from "zod";

export const AiInfluencerInputConst = {
  tier: [
    "normal",
    "freak",
    "total",
    "insects",
    "frogs",
    "cats",
    "dogs",
    "capybaras",
    "birds",
  ] as const,
  humanTiers: ["normal", "freak", "total"] as const,
  /** Nano Banana Pro output size; also sets the price. */
  resolution: ["1K", "2K", "4K"] as const,
  maxItemImages: 3,
  maxSelectionCategories: 18,
  maxBriefLength: 4000,
  maxSeed: 1_000_000,
};

export type AiInfluencerTier = (typeof AiInfluencerInputConst.tier)[number];

/** Display names for the character types. */
export const TIER_LABELS: Record<AiInfluencerTier, string> = {
  normal: "Average",
  freak: "Bold",
  total: "Extreme",
  insects: "Insect",
  frogs: "Frog",
  cats: "Cat",
  dogs: "Dog",
  capybaras: "Rodent",
  birds: "Bird",
};

export const isHumanTier = (tier: AiInfluencerTier) =>
  (AiInfluencerInputConst.humanTiers as readonly string[]).includes(tier);

export interface IAiInfluencerInput {
  /** Unused by the model; kept so shared prompt-based code keeps working. */
  prompt: string;
  tier: AiInfluencerTier;
  selection: Record<string, string[]>;
  brief: string;
  imageUrl: string;
  itemImageUrls: string[];
  seed: number | null;
  variationIndex: number;
  bodyColor: string;
  resolution: (typeof AiInfluencerInputConst.resolution)[number];
}

export const aiInfluencerValidationSchema = z.object({
  prompt: z.string().optional(),
  tier: z.enum(AiInfluencerInputConst.tier),
  selection: z
    .record(z.string(), z.array(z.string()))
    .refine(
      (s) => Object.keys(s).length <= AiInfluencerInputConst.maxSelectionCategories,
    ),
  brief: z.string().max(AiInfluencerInputConst.maxBriefLength),
  imageUrl: z.string().url().or(z.literal("")),
  itemImageUrls: z
    .array(z.string().url())
    .max(AiInfluencerInputConst.maxItemImages),
  seed: z.number().int().min(1).max(AiInfluencerInputConst.maxSeed).nullable(),
  variationIndex: z.number().int().min(0),
  bodyColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).or(z.literal("")),
  resolution: z.enum(AiInfluencerInputConst.resolution),
}) as z.ZodType<IAiInfluencerInput>;
