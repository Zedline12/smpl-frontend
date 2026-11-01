"use client";
import { useState, useEffect } from "react";
import { SettingsSelect } from "@/components/SettingsSelect";
import { X, Plus, Image as ImageIcon, Video as VideoIcon, BookOpen } from "lucide-react";
import { HOW_IT_WORKS_MAP } from "@/features/generation/data/how-it-works";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MediaManagerDialog } from "@/features/generation/components/prompt/MediaManagerDialog";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAiGenerationControlStore,
  useAiModelStore,
} from "@/stores/useAiGenerationControlStore";
import {
  IMAGE_MODELS,
  VIDEO_MODELS,
  AUDIO_MODELS,
  AiModelsEnum,
  type Model,
} from "@/features/generation/enums/models.enum";
import { ModelsValidatorSchemaMap } from "@/features/generation/types/generation";
import {
  useGenerateMutation,
  useGenerationCostQuery,
} from "@/features/generation/hooks/generation";
import { useAuth } from "@/providers/AuthProvider";
import {
  VEO3_ASPECT_RATIOS,
  VEO3_RESOLUTIONS,
  VEO3_DURATION_SECONDS,
} from "@/features/generation/types/models/veo-3.type";
import { KlingV3TextToVideoInputConst } from "@/features/generation/types/models/kling-v3-text-to-video.type";
import { Seedance20InputConst } from "@/features/generation/types/models/seedance-2.0.type";
import { Seedance25InputConst } from "@/features/generation/types/models/seedance-2.5.type";
import { GrokImagineVideo15InputConst } from "@/features/generation/types/models/grok-imagine-video-1.5.type";
import { KlingV3ImageToVideoInputConst } from "@/features/generation/types/models/kling-v3-image-to-video.type";
import { KlingV3ProMotionControlInputConst } from "@/features/generation/types/models/kling-v3-pro-motion-control";
import {
  GEMINI_FLASH_IMAGE_ASPECT_RATIOS,
  GEMINI_FLASH_IMAGE_RESOLUTIONS,
} from "@/features/generation/types/models/gemini-flash-image.type";
import { KlingO3ImageOptionsConst } from "@/features/generation/types/models/kling-o3-image.type";
import { SeedreamV45OptionsConst } from "@/features/generation/types/models/seedream-v4-5.type";
import { GptImage2OptionsConst } from "@/features/generation/types/models/gpt-image-2.type";
import { ElevenLabsV3InputConst } from "@/features/generation/types/models/elevenlabs-v3.type";
import { GENJUTSU_MOTION_TRANSFER_MAX_IMAGES } from "@/features/generation/types/models/higgsfield-genjutsu-motion-transfer.type";
import { KATANA_MAX_IMAGES } from "@/features/generation/types/models/higgsfield-katana.type";
import { GPT_IMAGE_2_MAX_IMAGES } from "@/features/generation/types/models/gpt-image-2.type";
import {
  AdsMultiplierLimits,
  AdsMultiplierOptionsConst,
  type IAdsMultiplierInput,
} from "@/features/generation/types/models/ads-multiplier.type";
import { Seedance25RefLimits } from "@/features/generation/types/models/seedance-2.5-ref-to-video.type";
import { readVideoDuration } from "@/features/artist/utils/audio-clip";

// ─── constants ────────────────────────────────────────────────────────────────

const ALL_MODELS = [...VIDEO_MODELS, ...IMAGE_MODELS, ...AUDIO_MODELS];

const CREATE_VIDEO_MODEL_IDS = new Set([
  AiModelsEnum.VEO_3,
  AiModelsEnum.KLING_V3_TEXT_TO_VIDEO,
  AiModelsEnum.SEEDANCE_2_0,
  AiModelsEnum.SEEDANCE_2_5,
  AiModelsEnum.GROK_IMAGINE_VIDEO_1_5,
  AiModelsEnum.ADS_MULTIPLIER,
]);

type VideoMode = "create" | "edit";

// models where prompt is optional (toggle to show)
const OPTIONAL_PROMPT_MODELS = new Set([
  AiModelsEnum.HIGGSFIELD_GENJUTSU_MOTION_TRANSFER,
  AiModelsEnum.HIGGSFIELD_KATANA,
  AiModelsEnum.KLING_V3_PRO_MOTION_CONTROL,
  AiModelsEnum.KLING_V3_IMAGE_TO_VIDEO,
]);

// models with no prompt field at all
const NO_PROMPT_MODELS = new Set([
  AiModelsEnum.ELEVEN_LABS_V3_TTS,
  // Its optional prompt sits with the hook/CTA toggles in its own panel.
  AiModelsEnum.ADS_MULTIPLIER,
]);

// ─── prompt section ───────────────────────────────────────────────────────────

function PromptSection({ model }: { model: AiModelsEnum }) {
  const { states, setField } = useAiModelStore();
  const s = states[model] as any;
  const isOptional = OPTIONAL_PROMPT_MODELS.has(model);
  const hasNoPrompt = NO_PROMPT_MODELS.has(model);
  const [enabled, setEnabled] = useState(!!s?.prompt);

  if (hasNoPrompt) return null;

  const placeholder = isOptional ? "Add a prompt to guide generation…" : "Describe what you want to generate…";

  return (
    <div className="flex flex-col gap-2">
      {/* Header row — label + optional toggle */}
      <div className="flex items-center justify-between px-0.5">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
          Prompt{isOptional ? "" : ""}
        </span>
        {isOptional && (
          <button
            type="button"
            onClick={() => {
              const next = !enabled;
              setEnabled(next);
              if (!next) setField(model, "prompt", "");
            }}
            className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest transition-colors"
            style={{ color: enabled ? "var(--text)" : "var(--text-muted)" }}
            aria-pressed={enabled}
          >
            {/* pill toggle */}
            <span
              className="relative inline-flex w-7 h-4 rounded-full transition-colors duration-200 flex-shrink-0"
              style={{ backgroundColor: enabled ? "var(--primary)" : "var(--border)" }}
            >
              <span
                className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform duration-200"
                style={{ transform: enabled ? "translateX(12px)" : "translateX(0)" }}
              />
            </span>
            Optional
          </button>
        )}
      </div>

      {/* Textarea — always shown for required prompts, conditionally for optional */}
      {(!isOptional || enabled) && (
        <textarea
          value={s?.prompt ?? ""}
          onChange={(e) => setField(model, "prompt", e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full resize-none rounded-[10px] border px-4 py-3 text-sm focus:outline-none transition-colors"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border-subtle)",
            color: "var(--fg-1)",
            lineHeight: 1.5,
            animationName: "ssSelectIn",
            animationDuration: "150ms",
            animationTimingFunction: "ease",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.4)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        />
      )}
    </div>
  );
}

// ─── dropdown row ─────────────────────────────────────────────────────────────

function toDisplay(o: any): string {
  return typeof o === "boolean" ? (o ? "On" : "Off") : String(o);
}

function SelectRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly any[];
  value: any;
  onChange: (v: any) => void;
}) {
  const isBool = typeof options[0] === "boolean";
  const isNum = typeof options[0] === "number";
  const fromStr = (s: string | number | boolean) => {
    const str = String(s);
    if (isBool) return str === "true";
    if (isNum) return Number(str);
    return str;
  };

  const mappedOptions = options.map((o: any) => ({
    label: toDisplay(o),
    value: typeof o === "boolean" ? o : typeof o === "number" ? o : String(o),
  }));

  const current = value ?? options[0];
  const currentMapped =
    typeof current === "boolean" ? current : typeof current === "number" ? current : String(current);

  return (
    <SettingsSelect
      label={label}
      value={currentMapped}
      options={mappedOptions}
      onChange={(v) => onChange(fromStr(v))}
    />
  );
}

// ─── per-model settings ───────────────────────────────────────────────────────

function ModelSettingsPanel({ model }: { model: AiModelsEnum }) {
  const { states, setField: raw } = useAiModelStore();
  const set = (k: string, v: any) => raw(model, k, v);
  const s = states[model] as any;
  if (!s) return null;

  if (model === AiModelsEnum.VEO_3)
    return (
      <>
        <SelectRow label="Resolution" options={VEO3_RESOLUTIONS} value={s.resolution} onChange={(v) => set("resolution", v)} />
        <SelectRow label="Aspect Ratio" options={VEO3_ASPECT_RATIOS} value={s.aspectRatio} onChange={(v) => set("aspectRatio", v)} />
        <SelectRow label="Duration (s)" options={VEO3_DURATION_SECONDS} value={s.durationSeconds} onChange={(v) => set("durationSeconds", v)} />
        <SelectRow label="Audio" options={[true, false]} value={s.generateAudio} onChange={(v) => set("generateAudio", v)} />
      </>
    );

  if (model === AiModelsEnum.KLING_V3_TEXT_TO_VIDEO)
    return (
      <>
        <SelectRow label="Aspect Ratio" options={KlingV3TextToVideoInputConst.aspectRatio} value={s.aspectRatio} onChange={(v) => set("aspectRatio", v)} />
        <SelectRow label="Duration (s)" options={KlingV3TextToVideoInputConst.duration} value={s.duration} onChange={(v) => set("duration", v)} />
        <SelectRow label="Audio" options={[true, false]} value={s.generateAudio} onChange={(v) => set("generateAudio", v)} />
      </>
    );

  if (model === AiModelsEnum.SEEDANCE_2_0)
    return (
      <>
        <SelectRow label="Resolution" options={Seedance20InputConst.resolution} value={s.resolution} onChange={(v) => set("resolution", v)} />
        <SelectRow label="Aspect Ratio" options={Seedance20InputConst.aspectRatio} value={s.aspectRatio} onChange={(v) => set("aspectRatio", v)} />
        <SelectRow label="Duration (s)" options={Seedance20InputConst.duration} value={s.duration} onChange={(v) => set("duration", v)} />
        <SelectRow label="Audio" options={[true, false]} value={s.generateAudio} onChange={(v) => set("generateAudio", v)} />
      </>
    );

  if (model === AiModelsEnum.SEEDANCE_2_5)
    return (
      <>
        <SelectRow label="Resolution" options={Seedance25InputConst.resolution} value={s.resolution} onChange={(v) => set("resolution", v)} />
        <SelectRow label="Aspect Ratio" options={Seedance25InputConst.aspectRatio} value={s.aspectRatio} onChange={(v) => set("aspectRatio", v)} />
        <SelectRow label="Duration (s)" options={Seedance25InputConst.duration} value={s.duration} onChange={(v) => set("duration", v)} />
        <SelectRow label="Audio" options={[true, false]} value={s.generateAudio} onChange={(v) => set("generateAudio", v)} />
      </>
    );

  if (model === AiModelsEnum.ADS_MULTIPLIER)
    return <SelectRow label="Quality" options={AdsMultiplierOptionsConst.resolution} value={s.resolution} onChange={(v) => set("resolution", v)} />;

  if (model === AiModelsEnum.GROK_IMAGINE_VIDEO_1_5)
    return (
      <>
        <SelectRow label="Resolution" options={GrokImagineVideo15InputConst.resolution} value={s.resolution} onChange={(v) => set("resolution", v)} />
        <SelectRow label="Aspect Ratio" options={GrokImagineVideo15InputConst.aspectRatio} value={s.aspectRatio} onChange={(v) => set("aspectRatio", v)} />
        <SelectRow label="Duration (s)" options={GrokImagineVideo15InputConst.duration} value={s.duration} onChange={(v) => set("duration", v)} />
      </>
    );

  if (model === AiModelsEnum.KLING_V3_IMAGE_TO_VIDEO)
    return (
      <>
        <SelectRow label="Duration (s)" options={KlingV3ImageToVideoInputConst.duration} value={s.duration} onChange={(v) => set("duration", v)} />
        <SelectRow label="Audio" options={[true, false]} value={s.generateAudio} onChange={(v) => set("generateAudio", v)} />
      </>
    );

  if (model === AiModelsEnum.KLING_V3_PRO_MOTION_CONTROL)
    return (
      <>
        <SelectRow label="Character Orientation" options={KlingV3ProMotionControlInputConst.characterOrientation} value={s.characterOrientation} onChange={(v) => set("characterOrientation", v)} />
        <SelectRow label="Keep Original Sound" options={[true, false]} value={s.keepOriginalSound} onChange={(v) => set("keepOriginalSound", v)} />
      </>
    );

  if (model === AiModelsEnum.GEMINI_FLASH_IMAGE)
    return (
      <>
        <SelectRow label="Resolution" options={GEMINI_FLASH_IMAGE_RESOLUTIONS} value={s.resolution} onChange={(v) => set("resolution", v)} />
        <SelectRow label="Aspect Ratio" options={GEMINI_FLASH_IMAGE_ASPECT_RATIOS} value={s.aspectRatio} onChange={(v) => set("aspectRatio", v)} />
      </>
    );

  if (model === AiModelsEnum.KLING_O3_IMAGE)
    return (
      <>
        <SelectRow label="Resolution" options={KlingO3ImageOptionsConst.resolution} value={s.resolution} onChange={(v) => set("resolution", v)} />
        <SelectRow label="Aspect Ratio" options={KlingO3ImageOptionsConst.aspectRatio} value={s.aspectRatio} onChange={(v) => set("aspectRatio", v)} />
      </>
    );

  if (model === AiModelsEnum.SEEDREAM_V4_5)
    return <SelectRow label="Aspect Ratio" options={SeedreamV45OptionsConst.aspectRatio} value={s.aspectRatio} onChange={(v) => set("aspectRatio", v)} />;

  if (model === AiModelsEnum.GPT_IMAGE_2)
    return (
      <>
        <SelectRow label="Aspect Ratio" options={GptImage2OptionsConst.aspectRatio} value={s.aspectRatio} onChange={(v) => set("aspectRatio", v)} />
        <SelectRow label="Quality" options={GptImage2OptionsConst.quality} value={s.quality} onChange={(v) => set("quality", v)} />
      </>
    );

  if (model === AiModelsEnum.ELEVEN_LABS_V3_TTS)
    return (
      <>
        <SelectRow label="Voice" options={ElevenLabsV3InputConst.voice} value={s.voice} onChange={(v) => set("voice", v)} />
        <SelectRow label="Text Normalization" options={ElevenLabsV3InputConst.applyTextNormalization} value={s.applyTextNormalization} onChange={(v) => set("applyTextNormalization", v)} />
      </>
    );

  return null;
}

// ─── media slot primitives ────────────────────────────────────────────────────

export function SingleMediaSlot({
  label,
  type = "image",
  url,
  onOpenPicker,
  onClear,
}: {
  label: string;
  type?: "image" | "video";
  url?: string;
  onOpenPicker: () => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-0.5">
        {label}
      </span>
      <div
        className="relative w-full h-28 rounded-xl overflow-hidden border border-dashed border-border bg-card cursor-pointer group"
        onClick={!url ? onOpenPicker : undefined}
      >
        {url ? (
          type === "video" ? (
            <video
              src={url}
              className="absolute inset-0 w-full h-full object-cover"
              muted
              loop
              autoPlay
              playsInline
            />
          ) : (
            <img src={url} alt={label} className="absolute inset-0 w-full h-full object-cover" />
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-1.5 text-muted-foreground group-hover:text-foreground transition-colors">
            {type === "video" ? (
              <VideoIcon className="w-6 h-6" />
            ) : (
              <ImageIcon className="w-6 h-6" />
            )}
            <span className="text-[10px] font-medium">Click to select</span>
          </div>
        )}
        {url && (
          <>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onOpenPicker(); }}
              className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Change
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function MultiImageSlots({
  label,
  images,
  maxImages,
  onOpenPicker,
  onRemove,
}: {
  label: string;
  images: string[];
  maxImages: number;
  onOpenPicker: () => void;
  onRemove: (url: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-0.5">
        {label} ({images.length}/{maxImages})
      </span>
      <div className="flex flex-wrap gap-2">
        {images.map((url, i) => (
          <div key={url + i} className="relative w-[72px] h-[72px] rounded-xl overflow-hidden border border-border bg-card group flex-shrink-0">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onRemove(url)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}
        {images.length < maxImages && (
          <button
            type="button"
            onClick={onOpenPicker}
            className="w-[72px] h-[72px] rounded-xl border-2 border-dashed border-border bg-card hover:border-foreground/50 flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── per-model media panels ───────────────────────────────────────────────────

function ModelMediaPanel({ model }: { model: AiModelsEnum }) {
  const { states, setField: raw } = useAiModelStore();
  const set = (k: string, v: any) => raw(model, k, v);
  const s = states[model] as any;

  // dialog open states — each slot can open independently
  const [dlg, setDlg] = useState<string | null>(null);

  if (!s) return null;

  // ── VEO 3 ──────────────────────────────────────────────────────────────────
  if (model === AiModelsEnum.VEO_3) {
    const images: string[] = s.images ?? [];
    return (
      <>
        <MultiImageSlots
          label="Reference Images"
          images={images}
          maxImages={4}
          onOpenPicker={() => setDlg("images")}
          onRemove={(url) => set("images", images.filter((u) => u !== url))}
        />
        <MediaManagerDialog
          open={dlg === "images"}
          onOpenChange={(o) => !o && setDlg(null)}
          selectedImages={images}
          onSelect={(urls) => { set("images", urls); setDlg(null); }}
          maxSelections={4}
        />
      </>
    );
  }

  // ── SEEDANCE 2.0 ───────────────────────────────────────────────────────────
  if (model === AiModelsEnum.SEEDANCE_2_0) {
    return (
      <>
        <SingleMediaSlot
          label="Start Image (optional)"
          url={s.imageUrl}
          onOpenPicker={() => setDlg("start")}
          onClear={() => set("imageUrl", "")}
        />
        <SingleMediaSlot
          label="End Image (optional)"
          url={s.endImageUrl}
          onOpenPicker={() => setDlg("end")}
          onClear={() => set("endImageUrl", "")}
        />
        <MediaManagerDialog open={dlg === "start"} onOpenChange={(o) => !o && setDlg(null)}
          selectedImage={s.imageUrl} onSelect={(u) => { set("imageUrl", u[0]); setDlg(null); }} maxSelections={1} />
        <MediaManagerDialog open={dlg === "end"} onOpenChange={(o) => !o && setDlg(null)}
          selectedImage={s.endImageUrl} onSelect={(u) => { set("endImageUrl", u[0]); setDlg(null); }} maxSelections={1} />
      </>
    );
  }

  // ── SEEDANCE 2.5 ───────────────────────────────────────────────────────────
  if (model === AiModelsEnum.SEEDANCE_2_5) {
    return (
      <>
        <SingleMediaSlot
          label="Start Image (optional)"
          url={s.imageUrl}
          onOpenPicker={() => setDlg("start")}
          onClear={() => set("imageUrl", "")}
        />
        <SingleMediaSlot
          label="End Image (optional)"
          url={s.endImageUrl}
          onOpenPicker={() => setDlg("end")}
          onClear={() => set("endImageUrl", "")}
        />
        <MediaManagerDialog open={dlg === "start"} onOpenChange={(o) => !o && setDlg(null)}
          selectedImage={s.imageUrl} onSelect={(u) => { set("imageUrl", u[0]); setDlg(null); }} maxSelections={1} />
        <MediaManagerDialog open={dlg === "end"} onOpenChange={(o) => !o && setDlg(null)}
          selectedImage={s.endImageUrl} onSelect={(u) => { set("endImageUrl", u[0]); setDlg(null); }} maxSelections={1} />
      </>
    );
  }

  // ── GROK ───────────────────────────────────────────────────────────────────
  if (model === AiModelsEnum.GROK_IMAGINE_VIDEO_1_5) {
    const images: string[] = s.images ?? [];
    const url = images[0];
    return (
      <>
        <SingleMediaSlot
          label="Reference Image (optional)"
          url={url}
          onOpenPicker={() => setDlg("img")}
          onClear={() => set("images", [])}
        />
        <MediaManagerDialog open={dlg === "img"} onOpenChange={(o) => !o && setDlg(null)}
          selectedImage={url} onSelect={(u) => { set("images", u.slice(0, 1)); setDlg(null); }} maxSelections={1} />
      </>
    );
  }

  // ── KLING Image-to-Video ───────────────────────────────────────────────────
  if (model === AiModelsEnum.KLING_V3_IMAGE_TO_VIDEO) {
    return (
      <>
        <SingleMediaSlot
          label="Start Image"
          url={s.startImageUrl}
          onOpenPicker={() => setDlg("start")}
          onClear={() => set("startImageUrl", "")}
        />
        <SingleMediaSlot
          label="End Image (optional)"
          url={s.endImageUrl}
          onOpenPicker={() => setDlg("end")}
          onClear={() => set("endImageUrl", "")}
        />
        <MediaManagerDialog open={dlg === "start"} onOpenChange={(o) => !o && setDlg(null)}
          selectedImage={s.startImageUrl} onSelect={(u) => { set("startImageUrl", u[0]); setDlg(null); }} maxSelections={1} />
        <MediaManagerDialog open={dlg === "end"} onOpenChange={(o) => !o && setDlg(null)}
          selectedImage={s.endImageUrl} onSelect={(u) => { set("endImageUrl", u[0]); setDlg(null); }} maxSelections={1} />
      </>
    );
  }

  // ── KLING Pro Motion Control ───────────────────────────────────────────────
  if (model === AiModelsEnum.KLING_V3_PRO_MOTION_CONTROL) {
    return (
      <>
        <SingleMediaSlot
          label="Motion Video"
          type="video"
          url={s.videoUrl}
          onOpenPicker={() => setDlg("video")}
          onClear={() => set("videoUrl", "")}
        />
        <SingleMediaSlot
          label="Character Image"
          url={s.imageUrl}
          onOpenPicker={() => setDlg("img")}
          onClear={() => set("imageUrl", "")}
        />
        <MediaManagerDialog open={dlg === "video"} onOpenChange={(o) => !o && setDlg(null)}
          selectedImage={s.videoUrl} onSelect={(u) => { set("videoUrl", u[0]); setDlg(null); }} maxSelections={1} mediaType="video" />
        <MediaManagerDialog open={dlg === "img"} onOpenChange={(o) => !o && setDlg(null)}
          selectedImage={s.imageUrl} onSelect={(u) => { set("imageUrl", u[0]); setDlg(null); }} maxSelections={1} />
      </>
    );
  }

  // ── GENJUTSU Motion Transfer ───────────────────────────────────────────────
  if (model === AiModelsEnum.HIGGSFIELD_GENJUTSU_MOTION_TRANSFER) {
    const images: string[] = s.images ?? [];
    return (
      <>
        <SingleMediaSlot
          label="Motion Video (4–30s)"
          type="video"
          url={s.videoUrl}
          onOpenPicker={() => setDlg("video")}
          onClear={() => set("videoUrl", "")}
        />
        <MultiImageSlots
          label="Reference Images"
          images={images}
          maxImages={GENJUTSU_MOTION_TRANSFER_MAX_IMAGES}
          onOpenPicker={() => setDlg("images")}
          onRemove={(url) => set("images", images.filter((u) => u !== url))}
        />
        <MediaManagerDialog open={dlg === "video"} onOpenChange={(o) => !o && setDlg(null)}
          selectedImage={s.videoUrl} onSelect={(u) => { set("videoUrl", u[0]); setDlg(null); }} maxSelections={1} mediaType="video" />
        <MediaManagerDialog open={dlg === "images"} onOpenChange={(o) => !o && setDlg(null)}
          selectedImages={images} onSelect={(u) => { set("images", u); setDlg(null); }} maxSelections={GENJUTSU_MOTION_TRANSFER_MAX_IMAGES} />
      </>
    );
  }

  // ── KATANA ─────────────────────────────────────────────────────────────────
  if (model === AiModelsEnum.HIGGSFIELD_KATANA) {
    const images: string[] = s.images ?? [];
    return (
      <>
        <SingleMediaSlot
          label="Put your edit video reference"
          type="video"
          url={s.videoUrl}
          onOpenPicker={() => setDlg("video")}
          onClear={() => set("videoUrl", "")}
        />
        <MultiImageSlots
          label="Add Your Character"
          images={images}
          maxImages={KATANA_MAX_IMAGES}
          onOpenPicker={() => setDlg("images")}
          onRemove={(url) => set("images", images.filter((u) => u !== url))}
        />
        <MediaManagerDialog open={dlg === "video"} onOpenChange={(o) => !o && setDlg(null)}
          selectedImage={s.videoUrl} onSelect={(u) => { set("videoUrl", u[0]); setDlg(null); }} maxSelections={1} mediaType="video" />
        <MediaManagerDialog open={dlg === "images"} onOpenChange={(o) => !o && setDlg(null)}
          selectedImages={images} onSelect={(u) => { set("images", u); setDlg(null); }} maxSelections={KATANA_MAX_IMAGES} />
      </>
    );
  }

  // ── GEMINI Flash Image ─────────────────────────────────────────────────────
  if (model === AiModelsEnum.GEMINI_FLASH_IMAGE) {
    const images: string[] = s.images ?? [];
    return (
      <>
        <MultiImageSlots
          label="Reference Images (optional)"
          images={images}
          maxImages={4}
          onOpenPicker={() => setDlg("images")}
          onRemove={(url) => set("images", images.filter((u) => u !== url))}
        />
        <MediaManagerDialog open={dlg === "images"} onOpenChange={(o) => !o && setDlg(null)}
          selectedImages={images} onSelect={(u) => { set("images", u); setDlg(null); }} maxSelections={4} />
      </>
    );
  }

  // ── KLING O3 Image ─────────────────────────────────────────────────────────
  if (model === AiModelsEnum.KLING_O3_IMAGE) {
    const images: string[] = s.images ?? [];
    return (
      <>
        <MultiImageSlots
          label="Reference Images (optional)"
          images={images}
          maxImages={4}
          onOpenPicker={() => setDlg("images")}
          onRemove={(url) => set("images", images.filter((u) => u !== url))}
        />
        <MediaManagerDialog open={dlg === "images"} onOpenChange={(o) => !o && setDlg(null)}
          selectedImages={images} onSelect={(u) => { set("images", u); setDlg(null); }} maxSelections={4} />
      </>
    );
  }

  // ── SEEDREAM V4.5 ──────────────────────────────────────────────────────────
  if (model === AiModelsEnum.SEEDREAM_V4_5) {
    const images: string[] = s.images ?? [];
    return (
      <>
        <MultiImageSlots
          label="Reference Images (optional)"
          images={images}
          maxImages={4}
          onOpenPicker={() => setDlg("images")}
          onRemove={(url) => set("images", images.filter((u) => u !== url))}
        />
        <MediaManagerDialog open={dlg === "images"} onOpenChange={(o) => !o && setDlg(null)}
          selectedImages={images} onSelect={(u) => { set("images", u); setDlg(null); }} maxSelections={4} />
      </>
    );
  }

  // ── GPT Image 2 ────────────────────────────────────────────────────────────
  if (model === AiModelsEnum.GPT_IMAGE_2) {
    const images: string[] = s.images ?? [];
    return (
      <>
        <MultiImageSlots
          label="Reference Images (optional)"
          images={images}
          maxImages={GPT_IMAGE_2_MAX_IMAGES}
          onOpenPicker={() => setDlg("images")}
          onRemove={(url) => set("images", images.filter((u) => u !== url))}
        />
        <MediaManagerDialog open={dlg === "images"} onOpenChange={(o) => !o && setDlg(null)}
          selectedImages={images} onSelect={(u) => { set("images", u); setDlg(null); }} maxSelections={GPT_IMAGE_2_MAX_IMAGES} />
      </>
    );
  }

  // ── AD MULTIPLIER ──────────────────────────────────────────────────────────
  if (model === AiModelsEnum.ADS_MULTIPLIER) return <AdsMultiplierPanel />;

  return null;
}

// ─── toggle + input ───────────────────────────────────────────────────────────

/** Small on/off pill, the same look as the prompt's "Optional" switch. */
function PillToggle({ on }: { on: boolean }) {
  return (
    <span
      className="relative inline-flex w-7 h-4 rounded-full transition-colors duration-200 flex-shrink-0"
      style={{ backgroundColor: on ? "var(--primary)" : "var(--border)" }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: on ? "translateX(12px)" : "translateX(0)" }}
      />
    </span>
  );
}

/** A labelled switch that reveals a text field; switching it off clears the value. */
function ToggleField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  maxLength: number;
  multiline?: boolean;
}) {
  const [enabled, setEnabled] = useState(!!value);

  const fieldStyle = {
    backgroundColor: "var(--bg-card)",
    borderColor: "var(--border-subtle)",
    color: "var(--fg-1)",
    lineHeight: 1.5,
    animationName: "ssSelectIn",
    animationDuration: "150ms",
    animationTimingFunction: "ease",
  };
  const fieldClass =
    "w-full rounded-[10px] border px-3 text-sm focus:outline-none focus:border-[rgba(139,92,246,0.4)] transition-colors";

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => {
          const next = !enabled;
          setEnabled(next);
          if (!next) onChange("");
        }}
        aria-pressed={enabled}
        className="flex items-center justify-between px-0.5 text-[10px] font-semibold uppercase tracking-widest transition-colors"
        style={{ color: enabled ? "var(--text)" : "var(--text-muted)" }}
      >
        {label}
        <PillToggle on={enabled} />
      </button>

      {enabled &&
        (multiline ? (
          <textarea
            autoFocus
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={3}
            className={`${fieldClass} resize-none py-2.5`}
            style={fieldStyle}
          />
        ) : (
          <input
            autoFocus
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            className={`${fieldClass} h-10`}
            style={fieldStyle}
          />
        ))}
    </div>
  );
}

// ─── ad multiplier ────────────────────────────────────────────────────────────

const { minReferenceSec, maxReferenceSec, minDurationSec, maxDurationSec } = Seedance25RefLimits;

function AdsMultiplierPanel() {
  const model = AiModelsEnum.ADS_MULTIPLIER;
  const { states, setField: raw } = useAiModelStore();
  const set = (k: keyof IAdsMultiplierInput, v: unknown) => raw(model, k, v);
  const s = states[model] as IAdsMultiplierInput;
  const images = s.images ?? [];

  const [dlg, setDlg] = useState<"video" | "images" | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  // The new ad is as long as the reference; duration drives the price.
  const pickVideo = async (url: string | undefined) => {
    setDlg(null);
    if (!url) return;
    setVideoError(null);
    const seconds = await readVideoDuration(url);
    if (seconds !== null && (seconds < minReferenceSec || seconds > maxReferenceSec + 0.2)) {
      setVideoError(
        `The reference ad must be ${minReferenceSec}–${maxReferenceSec} seconds (this one is ${Math.round(seconds)}s).`,
      );
      return;
    }
    set("videoUrl", url);
    set("duration", Math.min(Math.max(Math.round(seconds ?? 10), minDurationSec), maxDurationSec));
  };

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <SingleMediaSlot
          label="Reference video"
          type="video"
          url={s.videoUrl || undefined}
          onOpenPicker={() => setDlg("video")}
          onClear={() => {
            set("videoUrl", "");
            setVideoError(null);
          }}
        />
        {videoError ? (
          <p className="px-0.5 text-[11px] leading-snug text-red-400">{videoError}</p>
        ) : (
          <p className="px-0.5 text-[11px] text-muted-foreground">
            {s.videoUrl ? `New ad will be ${s.duration}s, like the original.` : "The ad to multiply, 2–30 seconds."}
          </p>
        )}
      </div>

      <MultiImageSlots
        label="Add your characters, products, or clothes"
        images={images}
        maxImages={AdsMultiplierLimits.maxImages}
        onOpenPicker={() => setDlg("images")}
        onRemove={(url) => set("images", images.filter((u) => u !== url))}
      />

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card/40 p-3">
        <ToggleField
          label="Prompt"
          value={s.prompt}
          onChange={(v) => set("prompt", v)}
          placeholder="Anything else to change, e.g. 'set it on a beach at sunset'"
          maxLength={AdsMultiplierLimits.maxPromptLength}
          multiline
        />
        <ToggleField
          label="Change hook"
          value={s.hook}
          onChange={(v) => set("hook", v)}
          placeholder="New opening line, e.g. 'Stop scrolling if you hate ironing'"
          maxLength={AdsMultiplierLimits.maxHookLength}
        />
        <ToggleField
          label="Change CTA"
          value={s.cta}
          onChange={(v) => set("cta", v)}
          placeholder="New call to action, e.g. 'Get 20% off today'"
          maxLength={AdsMultiplierLimits.maxCtaLength}
        />
      </div>

      <MediaManagerDialog
        open={dlg === "video"}
        onOpenChange={(o) => !o && setDlg(null)}
        selectedImage={s.videoUrl || undefined}
        onSelect={(u) => void pickVideo(u[0])}
        maxSelections={1}
        mediaType="video"
      />
      <MediaManagerDialog
        open={dlg === "images"}
        onOpenChange={(o) => !o && setDlg(null)}
        selectedImages={images}
        onSelect={(u) => {
          set("images", u.slice(0, AdsMultiplierLimits.maxImages));
          setDlg(null);
        }}
        maxSelections={AdsMultiplierLimits.maxImages}
      />
    </>
  );
}

// ─── model hero card ──────────────────────────────────────────────────────────

function ModelHeroCard({
  model,
  onChangePicker,
}: {
  model: AiModelsEnum;
  onChangePicker: () => void;
}) {
  const isGenjutsu = model === AiModelsEnum.HIGGSFIELD_GENJUTSU_MOTION_TRANSFER;
  const isKatana = model === AiModelsEnum.HIGGSFIELD_KATANA;
  const modelDef = ALL_MODELS.find((m) => m.id === model);
  const title = isGenjutsu ? "Smpl Riven" : isKatana ? "Katana" : (modelDef?.name ?? model);
  const subtitle = isGenjutsu ? "Reality Manipulation" : isKatana ? "Character Motion Transfer" : (modelDef?.description ?? "");

  // Per-model hero videos — add more as assets become available
  const VIDEO_MAP: Partial<Record<AiModelsEnum, string>> = {
    [AiModelsEnum.HIGGSFIELD_GENJUTSU_MOTION_TRANSFER]:
      "https://pub-c9ce2e0e90ea4982abdc05b1e4bd66bb.r2.dev/Models%20Selection%20Thumbnail%20Videos/Smpl%20Riven.mp4",
    [AiModelsEnum.ADS_MULTIPLIER]:
      "https://pub-c9ce2e0e90ea4982abdc05b1e4bd66bb.r2.dev/Models%20Selection%20Thumbnail%20Videos/ads-multiplier.mp4",
  };
  const videoSrc = VIDEO_MAP[model];

  return (
    <div className="relative rounded-2xl overflow-hidden h-44 flex-shrink-0 bg-muted">
      {videoSrc && (
        <video
          key={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          src={videoSrc}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />

      {/* Change button — top right */}
      <button
        type="button"
        onClick={onChangePicker}
        className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/10 text-white/80 border border-white/20 hover:bg-white/20 transition-colors backdrop-blur-sm"
      >
        Change
      </button>

      {/* Text — bottom left */}
      <div className="absolute bottom-0 left-0 p-4">
        <h2 className="text-primary font-bold text-xl leading-tight tracking-tight">
          {title}
        </h2>
        <p className="text-white/50 text-xs mt-1 font-medium tracking-wide line-clamp-2">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

// ─── model picker panel (shown when Change is clicked) ────────────────────────

function ModelPickerPanel({
  modelsToShow,
  activeModel,
  onSelect,
  onClose,
}: {
  modelsToShow: Model[];
  activeModel: AiModelsEnum;
  onSelect: (id: AiModelsEnum) => void;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between pb-2 mb-1 border-b border-border flex-shrink-0">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Select Model
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
            <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {modelsToShow.map((m) => {
        const isActive = m.id === activeModel;
        return (
          <button
            key={m.id}
            type="button"
            className={`w-full flex items-start gap-3 rounded-xl p-3 text-left transition-colors ${
              isActive
                ? "bg-accent border border-border"
                : "hover:bg-accent/50 border border-transparent"
            }`}
            onClick={() => {
              onSelect(m.id);
              onClose();
            }}
          >
            <span
              className={`mt-0.5 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg ${
                isActive ? "bg-foreground text-background" : "bg-muted text-foreground"
              }`}
            >
              {m.svg}
            </span>
            <div className="flex flex-col gap-0 min-w-0">
              <span className={`text-xs font-semibold leading-tight truncate ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                {m.name}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight line-clamp-2 mt-0.5">
                {m.description}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── generate button ──────────────────────────────────────────────────────────

function GenerateButton() {
  const { model, projectId, mediaType } = useAiGenerationControlStore();
  const { states } = useAiModelStore();
  const { data: costData } = useGenerationCostQuery();
  const generation = useGenerateMutation();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const isValid = () => {
    const v = ModelsValidatorSchemaMap[model];
    return v ? v.safeParse(states[model]).success : false;
  };

  const handleGenerate = async () => {
    try {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      await generation.mutateAsync({ model, projectId, mediaType, input: states[model]! });
      if (pathname !== "/create" && !pathname.startsWith("/create/motion-transfer")) {
        router.push("/create");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const valid = isValid();

  return (
    <div className="relative group/btn">
      <div
        className={`absolute -inset-1.5 rounded-xl blur-lg pointer-events-none transition-opacity duration-500 ${valid ? "opacity-40 group-hover/btn:opacity-70" : "opacity-[0.05]"}`}
        style={{ background: "var(--gradient-create)" }}
      />
      <div
        className={`relative rounded-xl p-px`}
        style={{ background: valid ? "var(--gradient-create)" : "var(--border)" }}
      >
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!valid || generation.isPending}
          className={`w-full flex items-center justify-center gap-2 rounded-xl backdrop-blur-md px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${
            valid ? "bg-black/50 text-white hover:bg-black/30" : "bg-black/60 text-white/40"
          }`}
        >
          {generation.isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <span>Generate</span>
              <span className="text-white/40">|</span>
              <span className="flex items-center gap-1 opacity-60 text-xs">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
                  <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clipRule="evenodd" />
                </svg>
                {costData?.creditsCost ?? 0}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── main sidebar ─────────────────────────────────────────────────────────────

export function CreateSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { model, setModel, sidebarView, setSidebarView } = useAiGenerationControlStore();
  const [videoMode, setVideoMode] = useState<VideoMode>("create");
  const [pickerOpen, setPickerOpen] = useState(false);

  // Sync model from ?model= URL param on mount
  useEffect(() => {
    const urlModel = searchParams.get("model") as AiModelsEnum | null;
    if (urlModel && Object.values(AiModelsEnum).includes(urlModel)) {
      setModel(urlModel);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleModelSelect = (id: AiModelsEnum) => {
    setModel(id);
    const params = new URLSearchParams(searchParams.toString());
    params.set("model", id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const isImage = pathname.includes("/image");
  const isAudio = pathname.includes("/audio");
  const isVideo = !isImage && !isAudio;

  let modelsToShow: Model[];
  if (isImage) {
    modelsToShow = IMAGE_MODELS;
  } else if (isAudio) {
    modelsToShow = AUDIO_MODELS;
  } else if (videoMode === "create") {
    modelsToShow = VIDEO_MODELS.filter((m) => CREATE_VIDEO_MODEL_IDS.has(m.id));
  } else {
    modelsToShow = VIDEO_MODELS.filter((m) => !CREATE_VIDEO_MODEL_IDS.has(m.id));
  }

  const handleVideoModeChange = (mode: VideoMode) => {
    setVideoMode(mode);
    setSidebarView("default");
    const next =
      mode === "create"
        ? VIDEO_MODELS.filter((m) => CREATE_VIDEO_MODEL_IDS.has(m.id))
        : VIDEO_MODELS.filter((m) => !CREATE_VIDEO_MODEL_IDS.has(m.id));
    if (next.length > 0 && !next.some((m) => m.id === model)) {
      handleModelSelect(next[0].id);
    }
  };

  const showSettings =
    !pickerOpen &&
    model !== AiModelsEnum.HIGGSFIELD_GENJUTSU_MOTION_TRANSFER &&
    model !== AiModelsEnum.HIGGSFIELD_KATANA;

  return (
    // The panel sits one shade above the page, so its controls move one shade up too.
    <aside className="h-full border-r border-border bg-white/[0.025] flex flex-col overflow-hidden [--card:var(--background-light)] [--bg-card:var(--background-light)] [--bg-elevated:var(--background-lighter)]">
      {/* Video Create / Edit sub-tabs */}
      {isVideo && (
        <div className="flex flex-col border-b border-border flex-shrink-0">
          <div className="flex w-full">
            {(["create", "edit"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => handleVideoModeChange(mode)}
                className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-colors ${
                  videoMode === mode && sidebarView === "default"
                    ? "border-white text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {mode === "create" ? "Create Video" : "Edit Video"}
              </button>
            ))}
          </div>

          {/* How it works tab — only for models that have data */}
          {HOW_IT_WORKS_MAP[model] && (
            <button
              type="button"
              onClick={() =>
                setSidebarView(sidebarView === "howItWorks" ? "default" : "howItWorks")
              }
              className={`m-3 flex items-center justify-center gap-1.5 w-[calc(100%-1.5rem)] py-1.5 rounded-[8px] text-[13px] font-semibold transition-colors ${
                sidebarView === "howItWorks"
                  ? "bg-accent text-foreground border border-border"
                  : "bg-background-light text-foreground/75 hover:text-foreground hover:bg-accent"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              How it works
            </button>
          )}
        </div>
      )}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {/* Hero card — always visible */}
        <ModelHeroCard model={model} onChangePicker={() => setPickerOpen((o) => !o)} />

        {/* Model picker panel — replaces settings when open */}
        {pickerOpen ? (
          <ModelPickerPanel
            modelsToShow={modelsToShow}
            activeModel={model}
            onSelect={handleModelSelect}
            onClose={() => setPickerOpen(false)}
          />
        ) : (
          <>
            {/* Prompt section */}
            <PromptSection model={model} />

            {/* Media inputs section */}
            <ModelMediaPanel model={model} />

            {/* Settings section */}
            {showSettings && (
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Settings
                </span>
                <ModelSettingsPanel model={model} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Generate button */}
      <div className="p-3 border-t border-border flex-shrink-0">
        <GenerateButton />
      </div>
    </aside>
  );
}
