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

const mkOpt = (key: string, label: string, img: string | null = null): AiInfluencerOption => ({
  key, label, img, color: null, tiers: null, slot: null, exclusive: false,
});

const IMG = "https://royal-violet-313a.smplappteam.workers.dev/generations/images/6af53e03ae8301d1c4acdef6/";

/** Thumbnails for the character types (generated, hosted on the app media host). */
export const TIER_IMAGES: Record<AiInfluencerTier, string> = {
  normal: IMG + "6b0594863846f72ee3215db2-9a270eee-a363-45bf-b73c-8ee4c88b8984",
  freak: IMG + "6b0594883846f72ee3215dc2-cf0a61ad-3e9b-4e4a-bfec-c68396a55181",
  total: IMG + "6b0594883846f72ee3215de3-19837b29-3303-460f-85cd-7ffb54acc9ac",
  insects: IMG + "6b0594893846f72ee3215ded-df90a2fd-180e-48a9-9735-9a55c7596166",
  frogs: IMG + "6b05948b3846f72ee3215dfe-e62cf2cb-3fdd-45b3-95bb-8336ad5db595",
  cats: IMG + "6b05948b3846f72ee3215e03-5ad3d5eb-3691-4b45-93c9-732837ae9978",
  dogs: IMG + "6b05948f3846f72ee3215e2e-03e7a11d-5b3c-460a-bc64-d51e607f6da5",
  capybaras: IMG + "6b05948d3846f72ee3215e17-8c3c2f10-4942-4939-8952-cdbf07a75d46",
  birds: IMG + "6b05948d3846f72ee3215e1b-7837607b-d522-447c-9e9b-1a160229ae76",
};

/** The "Character type" picker, shaped like a catalog category. */
export const CHARACTER_CATEGORY: AiInfluencerCategory = {
  key: "characterType",
  label: "Character type",
  max: 1,
  options: AiInfluencerInputConst.tier.map((tier) => mkOpt(tier, TIER_LABELS[tier], TIER_IMAGES[tier])),
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
    // Fixed 1K, no direction or seed: the studio no longer offers them.
    const input: IAiInfluencerInput = { ...state, resolution: "1K", brief: "", seed: null };
    if (templateMode) {
      templateGeneration.mutate({
        model: INFLUENCER_MODEL,
        mediaType: GenerationTypeEnum.IMAGE,
        input,
      });
      return;
    }
    generation.mutate({
      model: INFLUENCER_MODEL,
      projectId,
      mediaType: GenerationTypeEnum.IMAGE,
      input,
    });
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
  };
}
