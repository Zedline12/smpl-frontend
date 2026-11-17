"use client";
import { useRef, useState } from "react";
import { Dices, Shuffle, Upload, User, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { MediaManagerDialog } from "@/features/generation/components/prompt/MediaManagerDialog";
import {
  AiInfluencerInputConst,
  AiInfluencerTier,
  isHumanTier,
} from "@/features/generation/types/models/higgsfield-ai-influencer.type";
import AppearanceCategory from "./AppearanceCategory";
import { toggleOption } from "../hooks/useAiInfluencerOptions";
import {
  CHARACTER_CATEGORY,
  categoryIcon,
  randomSeed,
  useInfluencerBuilder,
} from "../hooks/useInfluencerBuilder";

export default function InfluencerBuilder() {
  const {
    state,
    setField,
    catalogQuery: { isLoading, isError },
    categories,
    cost,
    templateMode,
    isPending,
    canGenerate,
    changeTier,
    generate: handleGenerate,
    randomize,
  } = useInfluencerBuilder();

  // Multi-open accordion: set of open section ids
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(["characterType"])
  );
  const toggleSection = (id: string) =>
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
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
    resolution,
  } = state;
  const human = isHumanTier(tier);

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
          category={CHARACTER_CATEGORY}
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
              icon={categoryIcon(category.key)}
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

      {/* Resolution */}
      <section className="flex flex-col gap-1.5">
        <p className="text-sm font-medium text-foreground">Resolution</p>
        <div className="flex rounded-lg border border-white/10 p-1">
          {AiInfluencerInputConst.resolution.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setField("resolution", r)}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                (resolution ?? "2K") === r
                  ? "bg-white text-black"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </section>

      {/* Footer */}
      <div className="sticky bottom-0 -mx-4 flex items-center gap-2 border-t border-white/10 bg-background/90 px-4 py-4 backdrop-blur">
        <button
          type="button"
          onClick={randomize}
          aria-label="Randomize"
          title="Randomize"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-muted-foreground hover:text-foreground"
        >
          <Shuffle className="size-4" />
        </button>
        {/* Same look as the create pages' Generate (CreateSidebar). */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate}
          className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${
            canGenerate || isPending ? "bg-primary text-white hover:bg-primary/90" : "bg-primary/40 text-white/60"
          }`}
        >
          {isPending ? (
            <>
              <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Generating…
            </>
          ) : (
            <>
              <span>{templateMode ? "Create template" : "Generate"}</span>
              <span className="text-white/40">|</span>
              <span className="flex items-center gap-1 text-base font-bold tabular-nums opacity-80">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                  <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clipRule="evenodd" />
                </svg>
                {cost}
              </span>
            </>
          )}
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
