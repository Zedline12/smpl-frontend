"use client";
import { useRef, useState } from "react";
import {
  Dices,
  Layers,
  Palette,
  Ruler,
  Scissors,
  Shirt,
  Shuffle,
  Smile,
  Sparkles,
  Upload,
  User,
  X,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/providers/AuthProvider";
import { MediaManagerDialog } from "@/features/generation/components/prompt/MediaManagerDialog";
import ProjectSelector from "@/features/generation/components/prompt/selectors/ProjectSelector";
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
} from "@/features/generation/types/models/higgsfield-ai-influencer.type";
import {
  useGenerateMutation,
  useGenerationCostQuery,
} from "@/features/generation/hooks/generation";
import {
  useAiGenerationControlStore,
  useAiModelStore,
} from "@/stores/useAiGenerationControlStore";
import AppearanceCategory from "./AppearanceCategory";
import { useGenerateTemplateMutation } from "@/features/media/hooks/useTemplates";
import {
  AiInfluencerOption,
  categoriesForTier,
  pruneSelectionForTier,
  toggleOption,
  useAiInfluencerOptions,
} from "../hooks/useAiInfluencerOptions";
import type { ComponentType } from "react";

const MODEL = AiModelsEnum.HIGGSFIELD_AI_INFLUENCER;

const mkOpt = (key: string, label: string): AiInfluencerOption => ({
  key, label, img: null, color: null, tiers: null, slot: null, exclusive: false,
});

const CHARACTER_OPTIONS: AiInfluencerOption[] = [
  mkOpt("normal", "Average"),
  mkOpt("freak", "Bold"),
  mkOpt("total", "Extreme"),
  mkOpt("insects", "Insect"),
  mkOpt("frogs", "Frog"),
  mkOpt("cats", "Cat"),
  mkOpt("dogs", "Dog"),
  mkOpt("capybaras", "Rodent"),
  mkOpt("birds", "Bird"),
];

// Map each API category key to a lucide icon
const CATEGORY_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  gender: User,
  build: Layers,
  hairstyle: Scissors,
  hair_color: Palette,
  style: Shirt,
  ethnicity: Sparkles,
  age: Sparkles,
  skin_color: Palette,
  height: Ruler,
  proportions: Layers,
  head_shape: Sparkles,
  neck: Sparkles,
  eye_shape: Smile,
  eye_color: Palette,
  features: Smile,
  facial_hair: Scissors,
  distinctive_features: Sparkles,
  accessories: Sparkles,
};

const randomSeed = () =>
  Math.floor(Math.random() * AiInfluencerInputConst.maxSeed) + 1;

export default function InfluencerBuilder() {
  const { user } = useAuth();
  const { projectId, templateMode } = useAiGenerationControlStore();
  const templateGeneration = useGenerateTemplateMutation();
  const { states, setField: setModelField } = useAiModelStore();
  const state = states[MODEL] as IAiInfluencerInput;
  const setField = (key: keyof IAiInfluencerInput, value: unknown) =>
    setModelField(MODEL, key, value);

  const { data: catalog, isLoading, isError } = useAiInfluencerOptions();
  const { data: cost } = useGenerationCostQuery();
  const generation = useGenerateMutation();

  // Multi-open accordion: set of open section ids
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(["characterType"])
  );
  const toggleSection = (id: string) =>
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [itemsOpen, setItemsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const {
    tier,
    selection,
    brief,
    imageUrl,
    itemImageUrls,
    seed,
    variationIndex,
    bodyColor,
  } = state;
  const human = isHumanTier(tier);
  const categories = categoriesForTier(catalog, tier);
  const isValid = ModelsValidatorSchemaMap[MODEL].safeParse(state).success;

  const changeTier = (next: AiInfluencerTier) => {
    if (next === tier) return;
    setField("tier", next);
    setField("selection", pruneSelectionForTier(selection, catalog, next));
    setField("variationIndex", 0);
    if (isHumanTier(next)) setField("bodyColor", "");
  };

  const handleGenerate = () => {
    if (templateMode) {
      templateGeneration.mutate({
        model: MODEL,
        mediaType: GenerationTypeEnum.IMAGE,
        input: state,
      });
      return;
    }
    generation.mutate({
      model: MODEL,
      projectId,
      mediaType: GenerationTypeEnum.IMAGE,
      input: state,
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setField("imageUrl", url);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <h1
        className="text-center text-xl font-black uppercase tracking-tight text-foreground"
        style={{ fontFamily: "var(--font-display)" }}
      >
        AI Influencer
      </h1>

      {/* Photo upload dropzone */}
      <div className="relative">
        {imageUrl ? (
          <div className="relative h-28 w-full overflow-hidden rounded-xl border border-white/10">
            <img src={imageUrl} alt="Your photo" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => setField("imageUrl", "")}
              className="absolute top-2 right-2 rounded-full bg-black/60 p-1 hover:bg-black/80"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          </div>
        ) : (
          <div
            ref={dropRef}
            onClick={() => setPhotoDialogOpen(true)}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex h-28 w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed transition-colors ${
              isDragging
                ? "border-primary/60 bg-primary/5"
                : "border-white/15 hover:border-white/30 hover:bg-white/[0.02]"
            }`}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
              <Upload className="size-4 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">Upload your photo</span>
          </div>
        )}
        <span className="absolute -top-2 right-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          Optional
        </span>
      </div>

      {/* Accordion sections */}
      <div className="flex flex-col gap-2">
        {/* Character type — always first, always has a value */}
        <AppearanceCategory
          category={{
            key: "characterType",
            label: "Character type",
            max: 1,
            options: CHARACTER_OPTIONS,
            tiers: [],
          }}
          icon={User}
          selected={[tier]}
          open={openSections.has("characterType")}
          onToggleOpen={() => toggleSection("characterType")}
          onToggleOption={(opt) => changeTier(opt.key as AiInfluencerTier)}
          onClear={() => {}}
        />

        {/* Appearance categories from API */}
        {isLoading && (
          <p className="px-4 py-2 text-xs text-muted-foreground">Loading options…</p>
        )}
        {isError && (
          <p className="px-4 py-2 text-xs text-red-400">
            Couldn&apos;t load appearance options.
          </p>
        )}
        {categories.map((category) => {
          const id = `${category.key}:${category.tiers.join(",")}`;
          return (
            <AppearanceCategory
              key={id}
              category={category}
              icon={CATEGORY_ICONS[category.key] ?? Sparkles}
              selected={selection[category.key] ?? []}
              open={openSections.has(id)}
              onToggleOpen={() => toggleSection(id)}
              onToggleOption={(option) =>
                setField("selection", toggleOption(selection, category, option))
              }
              onClear={() => {
                const next = { ...selection };
                delete next[category.key];
                setField("selection", next);
              }}
            />
          );
        })}

        {Object.keys(selection).length > 0 && (
          <button
            type="button"
            onClick={() => setField("selection", {})}
            className="self-start text-xs text-muted-foreground hover:text-foreground"
          >
            Reset all
          </button>
        )}
      </div>

      {/* Clothing & items */}
      <section className="flex flex-col gap-1.5">
        <p className="text-sm font-medium text-foreground">
          Clothing &amp; items ({itemImageUrls.length}/{AiInfluencerInputConst.maxItemImages})
        </p>
        <p className="text-xs text-muted-foreground">Outfits, shoes, props</p>
        <div className="flex flex-wrap gap-2">
          {itemImageUrls.map((url, i) => (
            <Thumb
              key={url + i}
              url={url}
              onRemove={() =>
                setField(
                  "itemImageUrls",
                  itemImageUrls.filter((u) => u !== url),
                )
              }
            />
          ))}
          {itemImageUrls.length < AiInfluencerInputConst.maxItemImages && (
            <AddTile onClick={() => setItemsOpen(true)} />
          )}
        </div>
      </section>

      {/* Animal extras */}
      {!human && (
        <section className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-medium text-foreground">Body color</p>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bodyColor || "#d9a066"}
                onChange={(e) => setField("bodyColor", e.target.value)}
                className="h-9 w-12 cursor-pointer rounded-md border border-white/10 bg-transparent"
              />
              {bodyColor ? (
                <button
                  type="button"
                  onClick={() => setField("bodyColor", "")}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              ) : (
                <span className="text-xs text-muted-foreground">Natural</span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-medium text-foreground">Variation</p>
            <div className="flex items-center gap-2">
              <span className="min-w-6 text-sm text-foreground">#{variationIndex}</span>
              <button
                type="button"
                onClick={() => setField("variationIndex", variationIndex + 1)}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-foreground hover:bg-white/5"
              >
                <Shuffle className="size-4" /> Next
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Brief */}
      <section className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Direction (optional)</p>
          <span className="text-xs text-muted-foreground">
            {brief.length}/{AiInfluencerInputConst.maxBriefLength}
          </span>
        </div>
        <Textarea
          value={brief}
          maxLength={AiInfluencerInputConst.maxBriefLength}
          onChange={(e) => setField("brief", e.target.value)}
          placeholder="e.g. A cheerful fitness coach who loves streetwear…"
          className="min-h-[80px] resize-none border-white/10 bg-white/[0.02] text-foreground"
        />
      </section>

      {/* Seed */}
      <section className="flex flex-col gap-1.5">
        <p className="text-sm font-medium text-foreground">Seed (optional)</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={AiInfluencerInputConst.maxSeed}
            value={seed ?? ""}
            placeholder="Random"
            onChange={(e) => {
              const v = e.target.value === "" ? null : Number(e.target.value);
              setField("seed", v);
            }}
            className="h-9 w-36 rounded-lg border border-white/10 bg-white/[0.02] px-3 text-sm text-foreground outline-none focus:border-white/30"
          />
          <button
            type="button"
            onClick={() => setField("seed", randomSeed())}
            title="Random seed"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 hover:bg-white/5"
          >
            <Dices className="size-4 text-foreground" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-background/90 px-4 py-4 backdrop-blur">
        <div className="flex items-center gap-2">
          {user && !templateMode && <ProjectSelector />}
          <button
            type="button"
            onClick={() => {
              setField("selection", {});
              setField("seed", null);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Shuffle className="size-4" /> Randomize
          </button>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={
            !isValid ||
            (!templateMode && !projectId) ||
            generation.isPending ||
            templateGeneration.isPending
          }
          className="rounded-full px-5 py-2 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          style={{ background: "var(--gradient-create)" }}
        >
          {generation.isPending || templateGeneration.isPending
            ? "Starting…"
            : `${templateMode ? "Create template" : "Generate"} · ${cost?.creditsCost ?? 0} credits`}
        </button>
      </div>

      <MediaManagerDialog
        open={photoDialogOpen}
        onOpenChange={setPhotoDialogOpen}
        selectedImage={imageUrl}
        onSelect={(urls) => setField("imageUrl", urls[0] ?? "")}
        maxSelections={1}
      />
      <MediaManagerDialog
        open={itemsOpen}
        onOpenChange={setItemsOpen}
        selectedImages={itemImageUrls}
        onSelect={(urls) =>
          setField(
            "itemImageUrls",
            urls.slice(0, AiInfluencerInputConst.maxItemImages),
          )
        }
        maxSelections={AiInfluencerInputConst.maxItemImages}
      />
    </div>
  );
}

function Thumb({ url, onRemove }: { url: string; onRemove: () => void }) {
  return (
    <div className="group relative h-20 w-20 overflow-hidden rounded-xl border border-white/10 bg-white/5">
      <img src={url} alt="Reference" className="h-full w-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 rounded-full bg-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
      >
        <X className="h-3 w-3 text-white" />
      </button>
    </div>
  );
}

function AddTile({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-20 w-20 flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 transition-all hover:border-primary/50 hover:bg-white/5"
    >
      <Upload className="mb-1 h-5 w-5 text-muted transition-colors group-hover:text-primary" />
    </button>
  );
}
