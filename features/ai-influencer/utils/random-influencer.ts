import {
  AiInfluencerInputConst,
  AiInfluencerTier,
  IAiInfluencerInput,
  isHumanTier,
} from "@/features/generation/types/models/higgsfield-ai-influencer.type";
import {
  AiInfluencerCatalog,
  categoriesForTier,
  toggleOption,
} from "../hooks/useAiInfluencerOptions";

/** Always filled, so every influencer has a complete, coherent base look. */
const CORE_CATEGORIES = new Set([
  "gender",
  "ethnicity_origin_base",
  "age",
  "skin_tone",
  "body_type",
  "hair",
  "hair_colour",
  "eye_color",
]);

/** Chance that an optional category (face details, accessories…) gets a pick. */
const OPTIONAL_CHANCE: Record<string, number> = {
  aesthetic: 0.7,
  accessory: 0.4,
  freak_face: 0.5,
  distinctive: 0.25,
  eye_shape: 0.35,
  freak_head: 0.3,
  height: 0.3,
  proportions: 0.2,
  freak_neck: 0.15,
  facial_hair: 0.5,
};

const pick = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];
const randomSeed = () => Math.floor(Math.random() * AiInfluencerInputConst.maxSeed) + 1;
const randomHex = () =>
  `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0")}`;

/** A random but valid appearance for one character type, following the catalog rules. */
export function randomSelection(
  catalog: AiInfluencerCatalog,
  tier: AiInfluencerTier,
): Record<string, string[]> {
  let selection: Record<string, string[]> = {};
  const categories = categoriesForTier(catalog, tier);
  const gender = (() => {
    const c = categories.find((c) => c.key === "gender");
    return c ? pick(c.options.filter((o) => !o.exclusive)) : undefined;
  })();

  for (const category of categories) {
    const core = CORE_CATEGORIES.has(category.key);
    if (!core) {
      // Beards only for male-presenting characters.
      if (category.key === "facial_hair" && !/(^|_)man$|^male$/.test(gender?.key ?? "")) continue;
      if (Math.random() > (OPTIONAL_CHANCE[category.key] ?? 0.3)) continue;
    }
    // Random picks never use "None"-style exclusive options.
    const options = category.options.filter((o) => !o.exclusive);
    if (!options.length) continue;
    if (category.key === "gender" && gender) {
      selection = toggleOption(selection, category, gender);
      continue;
    }
    const count = 1 + Math.floor(Math.random() * Math.min(category.max, 2));
    for (let i = 0; i < count; i++) {
      const option = pick(options);
      if (!(selection[category.key] ?? []).includes(option.key)) {
        selection = toggleOption(selection, category, option);
      }
    }
  }
  return selection;
}

export interface BulkInfluencerOptions {
  count: number;
  tiers: AiInfluencerTier[];
  resolution: IAiInfluencerInput["resolution"];
  /** One direction per line; each influencer gets a random one (or none). */
  directions: string[];
}

/** `count` different, valid influencer inputs spread across the chosen character types. */
export function buildBulkInfluencerInputs(
  catalog: AiInfluencerCatalog,
  { count, tiers, resolution, directions }: BulkInfluencerOptions,
): IAiInfluencerInput[] {
  const inputs: IAiInfluencerInput[] = [];
  const seen = new Set<string>();
  // Cycle through the types so each one is represented evenly.
  for (let i = 0, attempts = 0; inputs.length < count && attempts < count * 20; attempts++) {
    const tier = tiers[i % tiers.length];
    const selection = randomSelection(catalog, tier);
    const key = `${tier}:${JSON.stringify(selection)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    i++;
    const human = isHumanTier(tier);
    inputs.push({
      prompt: "",
      tier,
      selection,
      brief: directions.length ? pick(directions) : "",
      imageUrl: "",
      itemImageUrls: [],
      seed: randomSeed(),
      variationIndex: human ? 0 : Math.floor(Math.random() * 5),
      bodyColor: human || Math.random() < 0.5 ? "" : randomHex(),
      resolution,
    });
  }
  return inputs;
}
