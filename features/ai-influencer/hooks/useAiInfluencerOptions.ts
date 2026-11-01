import { useQuery } from "@tanstack/react-query";
import { AiInfluencerTier } from "@/features/generation/types/models/higgsfield-ai-influencer.type";

export interface AiInfluencerOption {
  key: string;
  label: string;
  img: string | null;
  color: string | null;
  tiers: AiInfluencerTier[] | null;
  slot: string | null;
  exclusive: boolean;
}

export interface AiInfluencerCategory {
  key: string;
  label: string;
  tiers: AiInfluencerTier[];
  max: number;
  options: AiInfluencerOption[];
}

export interface AiInfluencerCatalog {
  config_revision: string;
  categories: AiInfluencerCategory[];
}

export function useAiInfluencerOptions() {
  return useQuery({
    queryKey: ["ai-influencer-options"],
    queryFn: async (): Promise<AiInfluencerCatalog> => {
      const res = await fetch("/api/ai-influencer/options");
      if (!res.ok) throw new Error("Could not load appearance options");
      return res.json();
    },
    staleTime: 1000 * 60 * 60,
  });
}

/**
 * Categories (and their options) available for a character type. Human and animal
 * categories can share a key, so the category is chosen by key + type.
 */
export function categoriesForTier(
  catalog: AiInfluencerCatalog | undefined,
  tier: AiInfluencerTier,
): AiInfluencerCategory[] {
  if (!catalog) return [];
  return catalog.categories
    .filter((c) => c.tiers.includes(tier))
    .map((c) => ({
      ...c,
      options: c.options.filter((o) => !o.tiers || o.tiers.includes(tier)),
    }))
    .filter((c) => c.options.length > 0);
}

/**
 * Toggles an option in a selection while keeping the catalog rules: an exclusive
 * option stands alone, one option per facial slot, and at most `max` per category
 * (the oldest pick is dropped when full).
 */
export function toggleOption(
  selection: Record<string, string[]>,
  category: AiInfluencerCategory,
  option: AiInfluencerOption,
): Record<string, string[]> {
  const current = selection[category.key] ?? [];
  const byKey = new Map(category.options.map((o) => [o.key, o]));
  let next: string[];

  if (current.includes(option.key)) {
    next = current.filter((k) => k !== option.key);
  } else if (option.exclusive) {
    next = [option.key];
  } else {
    next = current.filter((k) => {
      const other = byKey.get(k);
      if (!other) return false;
      if (other.exclusive) return false;
      if (option.slot && other.slot === option.slot) return false;
      return true;
    });
    next.push(option.key);
    while (next.length > category.max) next.shift();
  }

  const result = { ...selection };
  if (next.length) result[category.key] = next;
  else delete result[category.key];
  return result;
}

/** Drops selected keys that aren't valid for the given character type. */
export function pruneSelectionForTier(
  selection: Record<string, string[]>,
  catalog: AiInfluencerCatalog | undefined,
  tier: AiInfluencerTier,
): Record<string, string[]> {
  if (!catalog) return {};
  const categories = categoriesForTier(catalog, tier);
  const result: Record<string, string[]> = {};
  for (const [key, values] of Object.entries(selection)) {
    const category = categories.find((c) => c.key === key);
    if (!category) continue;
    const valid = values
      .filter((v) => category.options.some((o) => o.key === v))
      .slice(0, category.max);
    if (valid.length) result[key] = valid;
  }
  return result;
}
