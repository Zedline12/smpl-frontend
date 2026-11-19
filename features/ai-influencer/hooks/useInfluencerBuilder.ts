"use client";

import type { ComponentType } from "react";
import {
  Eye,
  Glasses,
  Globe,
  Hourglass,
  Layers,
  Palette,
  Ruler,
  Scissors,
  Shirt,
  Smile,
  Sparkles,
  User,
} from "lucide-react";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import {
  GenerationTypeEnum,
  ModelsValidatorSchemaMap,
} from "@/features/generation/types/generation";
import {
  AiInfluencerInputConst,
  AiInfluencerTier,
  IAiInfluencerInput,
  isHumanTier,
  TIER_LABELS,
} from "@/features/generation/types/models/ai-influencer.type";
import {
  useGenerateMutation,
  useGenerationCostQuery,
} from "@/features/generation/hooks/generation";
import { useAuth } from "@/providers/AuthProvider";
import { useDefaultProject } from "@/features/projects/hooks/use-default-project";
import { useGenerateTemplateMutation } from "@/features/media/hooks/useTemplates";
import {
  useAiGenerationControlStore,
  useAiModelStore,
} from "@/stores/useAiGenerationControlStore";
import {
  AiInfluencerCategory,
  AiInfluencerOption,
  categoriesForTier,
  pruneSelectionForTier,
  useAiInfluencerOptions,
} from "./useAiInfluencerOptions";

export const INFLUENCER_MODEL = AiModelsEnum.SMPL_AI_INFLUENCER;

const mkOpt = (key: string, label: string): AiInfluencerOption => ({
  key, label, img: null, color: null, tiers: null, slot: null, exclusive: false,
});

/** The "Character type" picker, shaped like a catalog category. */
export const CHARACTER_CATEGORY: AiInfluencerCategory = {
  key: "characterType",
  label: "Character type",
  max: 1,
  options: AiInfluencerInputConst.tier.map((tier) => mkOpt(tier, TIER_LABELS[tier])),
  tiers: [],
};

// Catalog category key → icon
export const CATEGORY_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  gender: User,
  ethnicity_origin_base: Globe,
  age: Hourglass,
  skin_tone: Palette,
  height: Ruler,
  body_type: Layers,
  proportions: Layers,
  eye_color: Eye,
  eye_shape: Eye,
  freak_head: Smile,
  freak_face: Smile,
  freak_neck: User,
  hair: Scissors,
  hair_colour: Palette,
  facial_hair: Scissors,
  distinctive: Sparkles,
  aesthetic: Shirt,
  accessory: Glasses,
};

export const categoryIcon = (key: string) => CATEGORY_ICONS[key] ?? Sparkles;

export const randomSeed = () =>
  Math.floor(Math.random() * AiInfluencerInputConst.maxSeed) + 1;

/** State, catalog and actions shared by the desktop builder and the phone composer. */
export function useInfluencerBuilder() {
  const { user } = useAuth();
  const { projectId, templateMode } = useAiGenerationControlStore();
  // No project picker: generations go to the first project.
  useDefaultProject(!!user && !templateMode);
  const { states, setField: setModelField } = useAiModelStore();
  const state = states[INFLUENCER_MODEL] as IAiInfluencerInput;
  const setField = (key: keyof IAiInfluencerInput, value: unknown) =>
    setModelField(INFLUENCER_MODEL, key, value);

  const catalogQuery = useAiInfluencerOptions();
  const { data: cost, error: costError } = useGenerationCostQuery();
  const generation = useGenerateMutation();
  const templateGeneration = useGenerateTemplateMutation();

  const categories = categoriesForTier(catalogQuery.data, state.tier);
  const isValid = ModelsValidatorSchemaMap[INFLUENCER_MODEL].safeParse(state).success;
  const isPending = generation.isPending || templateGeneration.isPending;
  // No price for the model yet (estimate error): nothing can be charged.
  const canGenerate = isValid && !costError && (templateMode || !!projectId) && !isPending;

  const changeTier = (next: AiInfluencerTier) => {
    if (next === state.tier) return;
    setField("tier", next);
    setField("selection", pruneSelectionForTier(state.selection, catalogQuery.data, next));
    setField("variationIndex", 0);
    if (isHumanTier(next)) setField("bodyColor", "");
  };

  const generate = () => {
    if (templateMode) {
      templateGeneration.mutate({
        model: INFLUENCER_MODEL,
        mediaType: GenerationTypeEnum.IMAGE,
        input: state,
      });
      return;
    }
    generation.mutate({
      model: INFLUENCER_MODEL,
      projectId,
      mediaType: GenerationTypeEnum.IMAGE,
      input: state,
    });
  };

  const randomize = () => {
    setField("selection", {});
    setField("seed", null);
  };

  return {
    state,
    setField,
    catalogQuery,
    categories,
    cost: cost?.creditsCost ?? 0,
    templateMode,
    isPending,
    canGenerate,
    changeTier,
    generate,
    randomize,
  };
}
