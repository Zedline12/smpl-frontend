"use client";
import { useState } from "react";
import { Image as ImageIcon, Plus, X } from "lucide-react";
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
  AdsStudioAspectRatio,
  AdsStudioInputConst,
  IAdsStudioInput,
} from "@/features/generation/types/models/higgsfield-ads-studio.type";
import {
  useGenerateMutation,
  useGenerationCostQuery,
} from "@/features/generation/hooks/generation";
import { useGenerateTemplateMutation } from "@/features/media/hooks/useTemplates";
import {
  useAiGenerationControlStore,
  useAiModelStore,
} from "@/stores/useAiGenerationControlStore";

const MODEL = AiModelsEnum.HIGGSFIELD_ADS_STUDIO;
const c = AdsStudioInputConst;

/**
 * Ads Studio composer for the admin Templates page. Users reach Ads Studio from
 * the Create page sidebar (/create/image), which has its own controls.
 */

/** A small box with the ratio's shape, fitted inside 22×22. */
function RatioShape({ ratio }: { ratio: AdsStudioAspectRatio }) {
  const [w, h] = ratio.split(":").map(Number);
  const scale = 22 / Math.max(w, h);
  return (
    <span
      className="rounded-[3px] border-[1.5px] border-current"
      style={{ width: w * scale, height: h * scale }}
    />
  );
}

export default function AdsBuilder() {
  const { user } = useAuth();
  const { projectId, templateMode } = useAiGenerationControlStore();
  const { states, setField: setModelField } = useAiModelStore();
  const state = states[MODEL] as IAdsStudioInput;
  const setField = (key: keyof IAdsStudioInput, value: unknown) =>
    setModelField(MODEL, key, value);

  const { data: cost } = useGenerationCostQuery();
  const generation = useGenerateMutation();
  const templateGeneration = useGenerateTemplateMutation();
  const [imagesOpen, setImagesOpen] = useState(false);

  const { prompt, images, niche, targetAudience, language, aspectRatio, resolution, batchSize } =
    state;
  const isValid = ModelsValidatorSchemaMap[MODEL].safeParse(state).success;
  const pending = generation.isPending || templateGeneration.isPending;

  const handleGenerate = () => {
    const payload = { model: MODEL, mediaType: GenerationTypeEnum.IMAGE, input: state };
    if (templateMode) templateGeneration.mutate(payload);
    else generation.mutate({ ...payload, projectId });
  };

  const inputClass =
    "h-9 w-full rounded-lg border border-white/10 bg-white/[0.02] px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-white/30";

  return (
    <div className="flex flex-col gap-6 p-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Ads Studio</h1>
        <p className="text-sm text-muted-foreground">
          From a simple brief to ready-to-use ads. Bring your product, describe your
          vision, and let Ads Studio handle the creative.
        </p>
      </div>

      {/* Brief */}
      <section className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Brief</p>
          <span className="text-xs text-muted-foreground">
            {prompt.length}/{c.maxPromptLength}
          </span>
        </div>
        <Textarea
          value={prompt}
          maxLength={c.maxPromptLength}
          onChange={(e) => setField("prompt", e.target.value)}
          placeholder="Describe the ad: your product, the offer, the vibe… e.g. Summer sale on our iced coffee, bright and playful, 20% off this week."
          className="min-h-[120px] resize-none border-white/10 bg-white/[0.02] text-foreground"
        />
      </section>

      {/* Product images */}
      <section className="flex flex-col gap-1.5">
        <p className="text-sm font-medium text-foreground">
          Product & reference images ({images.length}/{c.maxImages})
        </p>
        <div className="flex flex-wrap gap-2">
          {images.map((url, i) => (
            <div
              key={url + i}
              className="group relative h-20 w-20 overflow-hidden rounded-xl border border-white/10 bg-white/5"
            >
              <img src={url} alt="Product" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setField("images", images.filter((u) => u !== url))}
                className="absolute top-1 right-1 rounded-full bg-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
              >
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
          ))}
          {images.length < c.maxImages && (
            <button
              type="button"
              onClick={() => setImagesOpen(true)}
              className="group flex h-20 w-20 flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 transition-all hover:border-primary/50 hover:bg-white/5"
            >
              <ImageIcon className="mb-1 h-5 w-5 text-muted transition-colors group-hover:text-primary" />
              <Plus className="h-3 w-3 text-muted transition-colors group-hover:text-primary" />
            </button>
          )}
        </div>
      </section>

      {/* Format */}
      <section className="flex flex-col gap-1.5">
        <p className="text-sm font-medium text-foreground">Format</p>
        <div className="grid grid-cols-5 gap-2">
          {c.aspectRatio.map((ratio) => (
            <button
              key={ratio}
              type="button"
              onClick={() => setField("aspectRatio", ratio)}
              className={`flex flex-col items-center gap-1.5 rounded-lg border px-1 py-2 text-[11px] transition-colors ${
                aspectRatio === ratio
                  ? "border-primary bg-primary/15 text-foreground"
                  : "border-white/10 text-muted-foreground hover:border-white/30 hover:text-foreground"
              }`}
            >
              <span className="flex h-6 items-center justify-center">
                <RatioShape ratio={ratio} />
              </span>
              {ratio}
            </button>
          ))}
        </div>
      </section>

      {/* Resolution */}
      <section className="flex flex-col gap-1.5">
        <p className="text-sm font-medium text-foreground">Resolution</p>
        <div className="flex rounded-lg border border-white/10 p-1">
          {c.resolution.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setField("resolution", r)}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                resolution === r
                  ? "bg-white text-black"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </section>

      {/* Number of ads */}
      <section className="flex flex-col gap-1.5">
        <p className="text-sm font-medium text-foreground">Number of ads</p>
        <div className="flex rounded-lg border border-white/10 p-1">
          {c.batchSize.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setField("batchSize", n)}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                batchSize === n
                  ? "bg-white text-black"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </section>

      {/* Details */}
      <section className="flex flex-col gap-3">
        <p className="text-sm font-medium text-foreground">
          Details <span className="font-normal text-muted-foreground">(optional)</span>
        </p>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Niche</label>
          <input
            value={niche}
            maxLength={c.maxNicheLength}
            onChange={(e) => setField("niche", e.target.value)}
            placeholder="e.g. Specialty coffee"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Target audience</label>
          <input
            value={targetAudience}
            maxLength={c.maxTargetAudienceLength}
            onChange={(e) => setField("targetAudience", e.target.value)}
            placeholder="e.g. Students and young professionals, 18–30"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Language</label>
          <input
            value={language}
            maxLength={c.maxLanguageLength}
            onChange={(e) => setField("language", e.target.value)}
            placeholder="e.g. English"
            className={inputClass}
          />
        </div>
      </section>

      {/* Footer */}
      <div className="sticky bottom-0 -mx-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-background/90 px-5 py-4 backdrop-blur">
        <div>{user && !templateMode && <ProjectSelector />}</div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!isValid || (!templateMode && !projectId) || pending}
          className="rounded-full px-5 py-2 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          style={{ background: "var(--gradient-create)" }}
        >
          {pending
            ? "Starting…"
            : `${templateMode ? "Create template" : `Generate ${batchSize} ${batchSize === 1 ? "ad" : "ads"}`} · ${cost?.creditsCost ?? 0} credits`}
        </button>
      </div>

      <MediaManagerDialog
        open={imagesOpen}
        onOpenChange={setImagesOpen}
        selectedImages={images}
        onSelect={(urls) => setField("images", urls.slice(0, c.maxImages))}
        maxSelections={c.maxImages}
      />
    </div>
  );
}
