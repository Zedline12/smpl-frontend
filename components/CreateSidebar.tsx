"use client";
import { useState, useEffect } from "react";
import { SettingsDuration } from "@/components/SettingsDuration";
import { SettingsSelect } from "@/components/SettingsSelect";
import { X, Plus, Image as ImageIcon, Video as VideoIcon, BookOpen, Upload, ChevronRight } from "lucide-react";
import {
  STYLE_FALLBACK_GRADIENTS,
  STYLE_MODEL_IDS,
  findStyle,
  hasReferences,
  withStyle,
} from "@/features/styles/styles";
import { useStylesQuery } from "@/features/styles/api";
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
  isEditTool,
 normalizeModelId } from "@/features/generation/enums/models.enum";
import { offeringDescription, offeringName, offeringThumbnail, useCatalog } from "@/features/catalog/catalog";
import { ModelsValidatorSchemaMap } from "@/features/generation/types/generation";
import {
  useGenerateMutation,
  useGenerationCostQuery,
} from "@/features/generation/hooks/generation";
import { useAuth } from "@/providers/AuthProvider";
import { useDefaultProject } from "@/features/projects/hooks/use-default-project";
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
import { GENSU_MAX_IMAGES } from "@/features/generation/types/models/gensu.type";
import { GPT_IMAGE_2_MAX_IMAGES } from "@/features/generation/types/models/gpt-image-2.type";
import {
  AdsMultiplierLimits,
  AdsMultiplierOptionsConst,
  type IAdsMultiplierInput,
} from "@/features/generation/types/models/ads-multiplier.type";
import {
  Seedance25RefInputConst,
  Seedance25RefLimits,
} from "@/features/generation/types/models/seedance-2.5-ref-to-video.type";
import { Seedance25RefPanel } from "@/components/Seedance25RefPanel";
import { Kling40RefPanel } from "@/components/Kling40RefPanel";
import { MediaThumb } from "@/components/MediaThumb";
import { Kling40FlashInputConst, Kling40InputConst } from "@/features/generation/types/models/kling-4-0.type";
import { readVideoDuration } from "@/features/artist/utils/audio-clip";
import { VoicePickerButton } from "@/features/voice-changer/components/VoicePicker";
import {
  IVoiceChangerInput,
  VoiceChangerInputConst,
} from "@/features/generation/types/models/voice-changer.type";
import {
  FIT_LABELS,
  FPS_LABELS,
  FPS_MODE_LABELS,
  MediaEditToolLimits,
  MediaEditToolOptions,
  POSITION_LABELS,
  RESOLUTION_LABELS,
  SCALE_LABELS,
  nearestAspectRatio,
} from "@/features/generation/types/models/media-edit-tools.type";

// ─── constants ────────────────────────────────────────────────────────────────

/** Ads Studio has its own page (/ads-studio), so it isn't in this list. */
const CREATE_IMAGE_MODELS: Model[] = IMAGE_MODELS.filter((m) => !isEditTool(m.id));
/** Edit Image: the ffmpeg tools (reframe, upscale). */
const EDIT_IMAGE_MODELS: Model[] = IMAGE_MODELS.filter((m) => isEditTool(m.id));

const ALL_MODELS = [...VIDEO_MODELS, ...CREATE_IMAGE_MODELS, ...EDIT_IMAGE_MODELS, ...AUDIO_MODELS];

const CREATE_VIDEO_MODEL_IDS = new Set([
  AiModelsEnum.KLING_4_0,
  AiModelsEnum.KLING_4_0_FLASH,
  AiModelsEnum.VEO_3,
  AiModelsEnum.KLING_V3_TEXT_TO_VIDEO,
  AiModelsEnum.SEEDANCE_2_0,
  AiModelsEnum.SEEDANCE_2_5,
  AiModelsEnum.GROK_IMAGINE_VIDEO_1_5,
  AiModelsEnum.SMPL_AD_MULTIPLIER,
]);

/** Edit Video: every video model that isn't a "create" one, plus the ffmpeg tools (reframe, FPS boost, upscale). */
const CREATE_VIDEO_MODELS = VIDEO_MODELS.filter((m) => CREATE_VIDEO_MODEL_IDS.has(m.id));
const EDIT_VIDEO_MODELS = VIDEO_MODELS.filter((m) => !CREATE_VIDEO_MODEL_IDS.has(m.id));

type EditMode = "create" | "edit";

// models where prompt is optional (toggle to show)
const OPTIONAL_PROMPT_MODELS = new Set([
  AiModelsEnum.SMPL_GENSU,
  AiModelsEnum.SMPL_RIPPER,
  AiModelsEnum.KLING_V3_PRO_MOTION_CONTROL,
  AiModelsEnum.KLING_V3_IMAGE_TO_VIDEO,
]);

// models whose prompt is optional once a reference image or video is added
const OPTIONAL_WITH_REFERENCES = new Set([AiModelsEnum.KLING_4_0, AiModelsEnum.KLING_4_0_FLASH]);

// models with no prompt field at all
const NO_PROMPT_MODELS = new Set([
  AiModelsEnum.ELEVEN_LABS_V3_TTS,
  // Its optional prompt sits with the hook/CTA toggles in its own panel.
  AiModelsEnum.SMPL_AD_MULTIPLIER,
  // Video + voice only.
  AiModelsEnum.SMPL_VOICE_CHANGER,
  // ffmpeg edit tools: a file and settings, no prompt.
  AiModelsEnum.SMPL_IMAGE_REFRAME,
  AiModelsEnum.SMPL_IMAGE_UPSCALE,
  AiModelsEnum.SMPL_VIDEO_REFRAME,
  AiModelsEnum.SMPL_VIDEO_FPS_BOOST,
  AiModelsEnum.SMPL_VIDEO_UPSCALE,
]);

// per-model prompt label/placeholder (default: "Prompt")
const PROMPT_COPY: Partial<Record<AiModelsEnum, { label: string; placeholder: string }>> = {
};

// ─── prompt section ───────────────────────────────────────────────────────────

function PromptSection({ model }: { model: AiModelsEnum }) {
  const { states, setField } = useAiModelStore();
  const styleId = useAiGenerationControlStore((st) => st.styleId);
  const s = states[model] as any;
  const alwaysOptional = OPTIONAL_PROMPT_MODELS.has(model);
  const hasNoPrompt = NO_PROMPT_MODELS.has(model);
  // A picked style describes the look, so a required prompt becomes optional.
  // A picked style plus reference images/videos makes a required prompt optional.
  const styled = !!styleId && STYLE_MODEL_IDS.has(model) && !!s && hasReferences(s);
  const styleNoRefs = !!styleId && STYLE_MODEL_IDS.has(model) && !styled;
  const [enabled, setEnabled] = useState(!!s?.prompt);
  // Optional for these models, or because a style / reference covers it.
  const isOptional =
    alwaysOptional || styled || (OPTIONAL_WITH_REFERENCES.has(model) && !!s && hasReferences(s));
  // A prompt already written stays visible (e.g. it became optional after typing).
  const showInput = !isOptional || enabled || !!s?.prompt;

  if (hasNoPrompt) return null;

  const copy = PROMPT_COPY[model];
  const placeholder = styled
    ? "Optional: describe what's in the shot. The style sets the look."
    : (copy?.placeholder ??
      (isOptional ? "Add a prompt to guide generation…" : "Describe what you want to generate…"));

  return (
    <div className="flex flex-col gap-2">
      {/* Header row — label + optional toggle */}
      <div className="flex items-center justify-between px-0.5">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
          {copy?.label ?? "Prompt"}
          {styleNoRefs && !alwaysOptional && (
            <span className="ml-1.5 normal-case tracking-normal font-medium text-white/40">
              required, or add a reference
            </span>
          )}
        </span>
        {isOptional && (
          <span className="flex items-center gap-2">
          {/* Same tag as the other cards (images, videos…). */}
          <span className="rounded-md bg-white/[0.07] px-2 py-0.5 text-[10px] font-medium text-white/50">Optional</span>
          <button
            type="button"
            onClick={() => {
              const next = !showInput;
              setEnabled(next);
              if (!next) setField(model, "prompt", "");
            }}
            className="flex cursor-pointer items-center"
            aria-pressed={showInput}
            aria-label={showInput ? "Remove the prompt" : "Add a prompt"}
          >
            {/* pill toggle */}
            <span
              className="relative inline-flex w-7 h-4 rounded-full transition-colors duration-200 flex-shrink-0"
              style={{ backgroundColor: showInput ? "var(--primary)" : "var(--border)" }}
            >
              <span
                className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform duration-200"
                style={{ transform: showInput ? "translateX(12px)" : "translateX(0)" }}
              />
            </span>
          </button>
          </span>
        )}
      </div>

      {/* Required prompts always show the input; optional ones when the toggle is on. */}
      {showInput && (
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
  labels,
}: {
  label: string;
  options: readonly any[];
  value: any;
  onChange: (v: any) => void;
  /** Display text per option value (default: the value itself). */
  labels?: Record<string, string>;
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
    label: labels?.[String(o)] ?? toDisplay(o),
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
        <SettingsDuration options={VEO3_DURATION_SECONDS} value={s.durationSeconds} onChange={(v) => set("durationSeconds", v)} />
        <SelectRow label="Audio" options={[true, false]} value={s.generateAudio} onChange={(v) => set("generateAudio", v)} />
      </>
    );

  if (model === AiModelsEnum.KLING_V3_TEXT_TO_VIDEO)
    return (
      <>
        <SelectRow label="Aspect Ratio" options={KlingV3TextToVideoInputConst.aspectRatio} value={s.aspectRatio} onChange={(v) => set("aspectRatio", v)} />
        <SettingsDuration options={KlingV3TextToVideoInputConst.duration} value={s.duration} onChange={(v) => set("duration", v)} />
        <SelectRow label="Audio" options={[true, false]} value={s.generateAudio} onChange={(v) => set("generateAudio", v)} />
      </>
    );

  if (model === AiModelsEnum.SEEDANCE_2_0)
    return (
      <>
        <SelectRow label="Resolution" options={Seedance20InputConst.resolution} value={s.resolution} onChange={(v) => set("resolution", v)} />
        <SelectRow label="Aspect Ratio" options={Seedance20InputConst.aspectRatio} value={s.aspectRatio} onChange={(v) => set("aspectRatio", v)} />
        <SettingsDuration options={Seedance20InputConst.duration} value={s.duration} onChange={(v) => set("duration", v)} />
        <SelectRow label="Audio" options={[true, false]} value={s.generateAudio} onChange={(v) => set("generateAudio", v)} />
      </>
    );

  if (model === AiModelsEnum.SEEDANCE_2_5)
    return (
      <>
        <SelectRow label="Resolution" options={Seedance25InputConst.resolution} value={s.resolution} onChange={(v) => set("resolution", v)} />
        <SelectRow label="Aspect Ratio" options={Seedance25InputConst.aspectRatio} value={s.aspectRatio} onChange={(v) => set("aspectRatio", v)} />
        <SettingsDuration options={Seedance25InputConst.duration} value={s.duration} onChange={(v) => set("duration", v)} />
        <SelectRow label="Audio" options={[true, false]} value={s.generateAudio} onChange={(v) => set("generateAudio", v)} />
      </>
    );

  if (model === AiModelsEnum.FAL_SEEDANCE_2_5)
    return (
      <>
        <SelectRow label="Resolution" options={Seedance25RefInputConst.resolution} value={s.resolution} onChange={(v) => set("resolution", v)} />
        <SelectRow label="Aspect Ratio" options={Seedance25RefInputConst.aspectRatio} value={s.aspectRatio} onChange={(v) => set("aspectRatio", v)} />
        <SettingsDuration options={Seedance25RefInputConst.duration} value={s.duration} onChange={(v) => set("duration", v)} />
        <SelectRow label="Audio" options={[true, false]} value={s.generateAudio} onChange={(v) => set("generateAudio", v)} />
      </>
    );

  if (model === AiModelsEnum.KLING_4_0 || model === AiModelsEnum.KLING_4_0_FLASH) {
    const c = model === AiModelsEnum.KLING_4_0 ? Kling40InputConst : Kling40FlashInputConst;
    const hasVideo = (s.videos ?? []).length > 0;
    return (
      <>
        <SelectRow label="Resolution" options={c.resolution} value={(c.resolution as readonly string[]).includes(s.resolution) ? s.resolution : c.resolution[c.resolution.length - 1]} onChange={(v) => set("resolution", v)} />
        <SelectRow label="Aspect Ratio" options={c.aspectRatio} value={(c.aspectRatio as readonly string[]).includes(s.aspectRatio) ? s.aspectRatio : "16:9"} onChange={(v) => set("aspectRatio", v)} />
        <SettingsDuration options={c.duration} value={s.duration} onChange={(v) => set("duration", v)} />
        <SelectRow
          label="Sound"
          options={hasVideo ? c.audio : ["native"]}
          labels={{ native: "Generated", original: "Original (from @Video1)" }}
          value={hasVideo ? s.audio : "native"}
          onChange={(v) => set("audio", v)}
        />
      </>
    );
  }

  if (model === AiModelsEnum.SMPL_AD_MULTIPLIER)
    return <SelectRow label="Quality" options={AdsMultiplierOptionsConst.resolution} value={s.resolution} onChange={(v) => set("resolution", v)} />;


  if (model === AiModelsEnum.GROK_IMAGINE_VIDEO_1_5)
    return (
      <>
        <SelectRow label="Resolution" options={GrokImagineVideo15InputConst.resolution} value={s.resolution} onChange={(v) => set("resolution", v)} />
        <SelectRow label="Aspect Ratio" options={GrokImagineVideo15InputConst.aspectRatio} value={s.aspectRatio} onChange={(v) => set("aspectRatio", v)} />
        <SettingsDuration options={GrokImagineVideo15InputConst.duration} value={s.duration} onChange={(v) => set("duration", v)} />
      </>
    );

  if (model === AiModelsEnum.KLING_V3_IMAGE_TO_VIDEO)
    return (
      <>
        <SettingsDuration options={KlingV3ImageToVideoInputConst.duration} value={s.duration} onChange={(v) => set("duration", v)} />
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

  if (model === AiModelsEnum.SMPL_IMAGE_REFRAME || model === AiModelsEnum.SMPL_VIDEO_REFRAME)
    return (
      <>
        <SelectRow label="Aspect Ratio" options={MediaEditToolOptions.aspectRatio} value={s.aspectRatio} onChange={(v) => set("aspectRatio", v)} />
        <SelectRow label="Fill" options={MediaEditToolOptions.fit} labels={FIT_LABELS} value={s.fit} onChange={(v) => set("fit", v)} />
        {s.fit === "crop" && (
          <SelectRow label="Focus" options={MediaEditToolOptions.position} labels={POSITION_LABELS} value={s.position} onChange={(v) => set("position", v)} />
        )}
      </>
    );

  if (model === AiModelsEnum.SMPL_IMAGE_UPSCALE)
    return <SelectRow label="Scale" options={MediaEditToolOptions.imageScale} labels={SCALE_LABELS} value={s.scale} onChange={(v) => set("scale", v)} />;

  if (model === AiModelsEnum.SMPL_VIDEO_UPSCALE)
    return <SelectRow label="Resolution" options={MediaEditToolOptions.videoResolution} labels={RESOLUTION_LABELS} value={s.resolution} onChange={(v) => set("resolution", v)} />;

  if (model === AiModelsEnum.SMPL_VIDEO_FPS_BOOST)
    return (
      <>
        <SelectRow label="Frame Rate" options={MediaEditToolOptions.fps} labels={FPS_LABELS} value={s.fps} onChange={(v) => set("fps", v)} />
        <SelectRow label="Mode" options={MediaEditToolOptions.fpsMode} labels={FPS_MODE_LABELS} value={s.mode} onChange={(v) => set("mode", v)} />
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

/** "Required" / "Optional" chip in a slot card's top-right corner. */
export function RequirementTag({ optional }: { optional?: boolean }) {
  return (
    <span className="absolute top-2.5 right-2.5 z-[2] rounded-md bg-white/[0.07] px-2 py-0.5 text-[10px] font-medium text-white/50 backdrop-blur-sm">
      {optional ? "Optional" : "Required"}
    </span>
  );
}

/** Round icon bubble used in empty slot cards. */
export function SlotIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-[#1b1c20] text-white/85 shadow-[0_2px_10px_rgba(0,0,0,.35)] transition-transform group-hover:scale-105">
      {children}
    </span>
  );
}

/** Labels mark optional slots with "(optional)"; the card shows a tag instead. */
function parseSlotLabel(label: string) {
  const optional = /\(optional\)/i.test(label);
  return { optional, title: label.replace(/\s*\(optional\)\s*/i, " ").trim() };
}

const slotCard =
  "group relative w-full overflow-hidden rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.035] transition-colors hover:border-white/25 hover:bg-white/[0.05]";

export function SingleMediaSlot({
  label,
  type = "image",
  url,
  onOpenPicker,
  onClear,
  description,
}: {
  label: string;
  type?: "image" | "video";
  url?: string;
  onOpenPicker: () => void;
  onClear: () => void;
  description?: string;
}) {
  const { optional, title } = parseSlotLabel(label);
  const Icon = type === "video" ? VideoIcon : ImageIcon;

  if (!url) {
    return (
      <button type="button" onClick={onOpenPicker} className={`${slotCard} flex flex-col items-center px-4 pt-7 pb-5 text-center`}>
        <RequirementTag optional={optional} />
        <span className="flex -space-x-2">
          <SlotIcon>
            <Icon className="size-4" />
          </SlotIcon>
          <SlotIcon>
            <Upload className="size-4" />
          </SlotIcon>
        </span>
        <span className="mt-3 text-[14px] font-bold text-white">{title}</span>
        <span className="mt-1 text-[12px] leading-snug text-white/45">
          {description ?? (type === "video" ? "Upload a video or pick one from your library" : "Upload an image or pick one from your library")}
        </span>
      </button>
    );
  }

  return (
    <div className={`${slotCard} h-44 cursor-pointer border-solid`} onClick={onOpenPicker}>
      <MediaThumb url={url} type={type} alt={title} play />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/30" />
      <RequirementTag optional={optional} />
      <span className="absolute bottom-2.5 left-3 z-[1] text-[12px] font-semibold text-white">{title}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClear();
        }}
        aria-label="Remove"
        className="absolute top-2.5 left-2.5 z-[2] flex size-6 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
      >
        <X className="size-3" />
      </button>
      <span className="absolute right-2.5 bottom-2.5 z-[1] rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
        Change
      </span>
    </div>
  );
}

function MultiImageSlots({
  label,
  images,
  maxImages,
  onOpenPicker,
  onRemove,
  description,
}: {
  label: string;
  images: string[];
  maxImages: number;
  onOpenPicker: () => void;
  onRemove: (url: string) => void;
  description?: string;
}) {
  const { optional, title } = parseSlotLabel(label);

  if (images.length === 0) {
    return (
      <button type="button" onClick={onOpenPicker} className={`${slotCard} flex flex-col items-center px-4 pt-7 pb-5 text-center`}>
        <RequirementTag optional={optional} />
        <span className="flex -space-x-2">
          <SlotIcon>
            <ImageIcon className="size-4" />
          </SlotIcon>
          <SlotIcon>
            <Upload className="size-4" />
          </SlotIcon>
        </span>
        <span className="mt-3 text-[14px] font-bold text-white">{title}</span>
        <span className="mt-1 text-[12px] leading-snug text-white/45">
          {description ?? `Add up to ${maxImages} image${maxImages === 1 ? "" : "s"}`}
        </span>
      </button>
    );
  }

  return (
    <div className={`${slotCard} border-solid p-3`}>
      <RequirementTag optional={optional} />
      <p className="mb-2.5 pr-16 text-[13px] font-bold text-white">
        {title} <span className="font-normal text-white/40">{images.length}/{maxImages}</span>
      </p>
      <div className="grid grid-cols-4 gap-2">
        {images.map((url, i) => (
          <div key={url + i} className="group/img relative aspect-square w-full overflow-hidden rounded-xl border border-white/10">
            <MediaThumb url={url} />
            <button
              type="button"
              onClick={() => onRemove(url)}
              aria-label="Remove image"
              className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover/img:opacity-100"
            >
              <X className="size-2.5" />
            </button>
          </div>
        ))}
        {images.length < maxImages && (
          <button
            type="button"
            onClick={onOpenPicker}
            aria-label="Add image"
            className="flex aspect-square w-full items-center justify-center rounded-xl border border-dashed border-white/20 text-white/50 transition-colors hover:border-white/40 hover:text-white"
          >
            <Plus className="size-5" />
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

  // ── SEEDANCE 2.5 (references: images, videos, audio) ──────────────────────
  if (model === AiModelsEnum.SEEDANCE_2_5) return <Seedance25RefPanel model={model} />;
  if (model === AiModelsEnum.FAL_SEEDANCE_2_5) return <Seedance25RefPanel model={model} />;

  // ── KLING 4.0 / 4.0 FLASH (reference images and videos) ───────────────────
  if (model === AiModelsEnum.KLING_4_0 || model === AiModelsEnum.KLING_4_0_FLASH) return <Kling40RefPanel model={model} />;

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

  // ── Gensu (motion transfer) ───────────────────────────────────────────────
  if (model === AiModelsEnum.SMPL_GENSU) {
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
          maxImages={GENSU_MAX_IMAGES}
          onOpenPicker={() => setDlg("images")}
          onRemove={(url) => set("images", images.filter((u) => u !== url))}
        />
        <MediaManagerDialog open={dlg === "video"} onOpenChange={(o) => !o && setDlg(null)}
          selectedImage={s.videoUrl} onSelect={(u) => { set("videoUrl", u[0]); setDlg(null); }} maxSelections={1} mediaType="video" />
        <MediaManagerDialog open={dlg === "images"} onOpenChange={(o) => !o && setDlg(null)}
          selectedImages={images} onSelect={(u) => { set("images", u); setDlg(null); }} maxSelections={GENSU_MAX_IMAGES} />
      </>
    );
  }

  // ── Ripper (social video + character, watermarks removed) ──────────────────
  if (model === AiModelsEnum.SMPL_RIPPER) {
    return (
      <>
        <SingleMediaSlot
          label="Social Video (4–30s)"
          type="video"
          url={s.videoUrl}
          description="Upload a TikTok, Instagram or YouTube video. Watermarks are removed."
          onOpenPicker={() => setDlg("video")}
          onClear={() => set("videoUrl", "")}
        />
        <SingleMediaSlot
          label="Your Character"
          url={s.image}
          onOpenPicker={() => setDlg("img")}
          onClear={() => set("image", "")}
        />
        <MediaManagerDialog open={dlg === "video"} onOpenChange={(o) => !o && setDlg(null)}
          selectedImage={s.videoUrl} onSelect={(u) => { set("videoUrl", u[0]); setDlg(null); }} maxSelections={1} mediaType="video" />
        <MediaManagerDialog open={dlg === "img"} onOpenChange={(o) => !o && setDlg(null)}
          selectedImage={s.image} onSelect={(u) => { set("image", u[0]); setDlg(null); }} maxSelections={1} />
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
  if (model === AiModelsEnum.SMPL_AD_MULTIPLIER) return <AdsMultiplierPanel />;

  // ── VOICE CHANGER ──────────────────────────────────────────────────────────
  if (model === AiModelsEnum.SMPL_VOICE_CHANGER) return <VoiceChangerPanel />;

  // ── ADS STUDIO ─────────────────────────────────────────────────────────────

  // ── EDIT TOOLS (ffmpeg: reframe, upscale, FPS boost) ──────────────────────
  if (isEditTool(model)) return <EditToolPanel key={model} model={model} />;

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

const { minReferenceSec, maxReferenceSec } = AdsMultiplierLimits;

function AdsMultiplierPanel() {
  const model = AiModelsEnum.SMPL_AD_MULTIPLIER;
  const { states, setField: raw } = useAiModelStore();
  const set = (k: keyof IAdsMultiplierInput, v: unknown) => raw(model, k, v);
  const s = states[model] as IAdsMultiplierInput;
  const images = s.images ?? [];

  const [dlg, setDlg] = useState<"video" | "images" | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  // The new ad is as long as the reference (Gensu keeps its motion and audio).
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
    set("duration", Math.min(Math.max(Math.floor(seconds ?? 10), minReferenceSec), maxReferenceSec));
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
            {s.videoUrl ? `New ad will be ${s.duration}s, like the original.` : `The ad to multiply, ${minReferenceSec}–${maxReferenceSec} seconds.`}
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

// ─── voice changer ────────────────────────────────────────────────────────────

function VoiceChangerPanel() {
  const model = AiModelsEnum.SMPL_VOICE_CHANGER;
  const { states, setField: raw } = useAiModelStore();
  const set = (k: keyof IVoiceChangerInput, v: unknown) => raw(model, k, v);
  const s = states[model] as IVoiceChangerInput;
  const { minSeconds, maxSeconds } = VoiceChangerInputConst;

  const [dlg, setDlg] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Every second of the video is re-voiced, so its length sets the price.
  const pickVideo = async (url: string | undefined) => {
    setDlg(false);
    if (!url) return;
    setVideoError(null);
    const seconds = await readVideoDuration(url);
    if (seconds !== null && (seconds < minSeconds || seconds > maxSeconds + 0.5)) {
      setVideoError(`The video must be up to ${maxSeconds} seconds (this one is ${Math.round(seconds)}s).`);
      return;
    }
    set("videoUrl", url);
    set("duration", Math.min(Math.max(Math.ceil(seconds ?? 10), minSeconds), maxSeconds));
  };

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <SingleMediaSlot
          label="Video with someone talking"
          type="video"
          url={s.videoUrl || undefined}
          onOpenPicker={() => setDlg(true)}
          onClear={() => {
            set("videoUrl", "");
            set("duration", 0);
            setVideoError(null);
          }}
        />
        {videoError ? (
          <p className="px-0.5 text-[11px] leading-snug text-red-400">{videoError}</p>
        ) : (
          <p className="px-0.5 text-[11px] text-muted-foreground">
            {s.videoUrl
              ? `${s.duration}s video. Same words and timing, new voice.`
              : `Up to ${maxSeconds} seconds. The speech is re-voiced; the picture stays the same.`}
          </p>
        )}
      </div>

      <VoicePickerButton value={s.voiceId} onChange={(id) => set("voiceId", id)} />

      <SelectRow
        label="Remove background noise"
        options={[false, true]}
        value={s.removeBackgroundNoise}
        onChange={(v) => set("removeBackgroundNoise", v)}
      />

      <MediaManagerDialog
        open={dlg}
        onOpenChange={(o) => !o && setDlg(false)}
        selectedImage={s.videoUrl || undefined}
        onSelect={(u) => void pickVideo(u[0])}
        maxSelections={1}
        mediaType="video"
      />
    </>
  );
}

// ─── edit tools (reframe / upscale / fps boost) ───────────────────────────────

type MediaInfo = { width: number; height: number; duration: number };

/** Size (and length, for videos) of a picked file, read by the browser; null if it can't. */
function readMediaInfo(url: string, type: "image" | "video"): Promise<MediaInfo | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), 15_000);
    const done = (info: MediaInfo | null) => {
      clearTimeout(timer);
      resolve(info);
    };
    if (type === "image") {
      const img = new window.Image();
      img.onload = () => done({ width: img.naturalWidth, height: img.naturalHeight, duration: 0 });
      img.onerror = () => done(null);
      img.src = url;
      return;
    }
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.onloadedmetadata = () => {
      done({
        width: video.videoWidth,
        height: video.videoHeight,
        duration: Number.isFinite(video.duration) ? video.duration : 0,
      });
      video.removeAttribute("src");
      video.load();
    };
    video.onerror = () => done(null);
    video.src = url;
  });
}

const L = MediaEditToolLimits;
const EDIT_TOOL_COPY: Partial<Record<AiModelsEnum, { label: string; hint: string; maxSeconds?: number }>> = {
  [AiModelsEnum.SMPL_IMAGE_REFRAME]: { label: "Image to reframe", hint: "Pick a new aspect ratio and how to fill it." },
  [AiModelsEnum.SMPL_IMAGE_UPSCALE]: { label: "Image to upscale", hint: `Up to ${L.imageMaxLongSide}px on the long side.` },
  [AiModelsEnum.SMPL_VIDEO_REFRAME]: { label: "Video to reframe", hint: `Up to ${L.videoReframeMaxSeconds} seconds. The sound is kept.`, maxSeconds: L.videoReframeMaxSeconds },
  [AiModelsEnum.SMPL_VIDEO_FPS_BOOST]: { label: "Video to smooth", hint: `Up to ${L.fpsBoostMaxSeconds} seconds. Smooth mode works up to 1080p.`, maxSeconds: L.fpsBoostMaxSeconds },
  [AiModelsEnum.SMPL_VIDEO_UPSCALE]: { label: "Video to upscale", hint: `Up to ${L.videoUpscaleMaxSeconds} seconds. The sound is kept.`, maxSeconds: L.videoUpscaleMaxSeconds },
};
const UPSCALE_SHORT_SIDE: Record<string, number> = { "1080p": 1080, "1440p": 1440, "4k": 2160 };

/** One image or video slot, plus what the tool will make of it. Runs with ffmpeg on our backend. */
function EditToolPanel({ model }: { model: AiModelsEnum }) {
  const { states, setField: raw } = useAiModelStore();
  const set = (k: string, v: unknown) => raw(model, k, v);
  const s = states[model] as
    | (Record<string, unknown> & { mode?: string; resolution?: string })
    | undefined;
  const isVideoTool = !!s && "videoUrl" in s;
  const urlKey = isVideoTool ? "videoUrl" : "imageUrl";
  const copy = EDIT_TOOL_COPY[model];
  const keepsShape = model !== AiModelsEnum.SMPL_IMAGE_REFRAME && model !== AiModelsEnum.SMPL_VIDEO_REFRAME;

  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Size of the picked file, for the hints below (kept with its URL so a stale one never shows).
  const [measured, setMeasured] = useState<{ url: string; info: MediaInfo | null } | null>(null);

  const url = typeof s?.[urlKey] === "string" ? (s[urlKey] as string) : "";
  const info = measured && measured.url === url ? measured.info : null;
  // Measure a file picked before (e.g. after switching tools or reloading).
  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    readMediaInfo(url, isVideoTool ? "video" : "image").then((m) => {
      if (!cancelled) setMeasured({ url, info: m });
    });
    return () => {
      cancelled = true;
    };
  }, [url, isVideoTool]);

  if (!s || !copy) return null;

  const pick = async (picked: string | undefined) => {
    setOpen(false);
    if (!picked) return;
    setError(null);
    const meta = await readMediaInfo(picked, isVideoTool ? "video" : "image");
    if (isVideoTool && meta?.duration && copy.maxSeconds && meta.duration > copy.maxSeconds + 0.5) {
      setError(
        `This tool works on videos up to ${copy.maxSeconds} seconds (this one is ${Math.round(meta.duration)}s). You can cut it when you upload it.`,
      );
      return;
    }
    set(urlKey, picked);
    setMeasured({ url: picked, info: meta });
    // Every second is processed, so the video's length sets the price.
    if (isVideoTool) set("duration", meta?.duration ? Math.ceil(meta.duration) : 0);
    if (keepsShape) set("aspectRatio", meta ? nearestAspectRatio(meta.width, meta.height) : "");
  };

  // Warnings for settings that would fail on this file (the backend refunds, but say it first).
  let warning: string | null = null;
  if (info) {
    const long = Math.max(info.width, info.height);
    const short = Math.min(info.width, info.height);
    if (model === AiModelsEnum.SMPL_VIDEO_FPS_BOOST && s.mode === "smooth" && long > L.fpsBoostSmoothMaxLongSide) {
      warning = "Smooth mode works on videos up to 1080p. Choose Fast, or a smaller video.";
    } else if (
      model === AiModelsEnum.SMPL_VIDEO_UPSCALE &&
      s.resolution &&
      short >= UPSCALE_SHORT_SIDE[s.resolution] * 0.95
    ) {
      warning = `This video is already ${s.resolution === "4k" ? "4K" : s.resolution} or sharper. Pick a higher resolution.`;
    } else if (model === AiModelsEnum.SMPL_IMAGE_UPSCALE && long * 1.05 > L.imageMaxLongSide) {
      warning = `This image is already at the largest size we make (${L.imageMaxLongSide}px).`;
    }
  }

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <SingleMediaSlot
          label={copy.label}
          type={isVideoTool ? "video" : "image"}
          url={url || undefined}
          onOpenPicker={() => setOpen(true)}
          onClear={() => {
            set(urlKey, "");
            if (isVideoTool) set("duration", 0);
            if (keepsShape) set("aspectRatio", "");
            setError(null);
          }}
        />
        {error || warning ? (
          <p className="px-0.5 text-[11px] leading-snug text-red-400">{error ?? warning}</p>
        ) : (
          <p className="px-0.5 text-[11px] leading-snug text-muted-foreground">
            {url && info
              ? `${info.width} × ${info.height}${isVideoTool && info.duration ? ` · ${info.duration.toFixed(1)}s` : ""}. ${copy.hint}`
              : copy.hint}
          </p>
        )}
      </div>

      <MediaManagerDialog
        open={open}
        onOpenChange={(o) => !o && setOpen(false)}
        selectedImage={url || undefined}
        onSelect={(u) => void pick(u[0])}
        maxSelections={1}
        mediaType={isVideoTool ? "video" : "image"}
      />
    </>
  );
}

// ─── model hero card ──────────────────────────────────────────────────────────

// Hero card media: set in App Appearance → Model Thumbnails (catalog), else bundled defaults.

function ModelHeroCard({
  model,
  onChangePicker,
}: {
  model: AiModelsEnum;
  onChangePicker: () => void;
}) {
  useCatalog();
  const isGensu = model === AiModelsEnum.SMPL_GENSU;
  const modelDef = ALL_MODELS.find((m) => m.id === model);
  const title = offeringName(model, modelDef?.name ?? model);
  const subtitle = isGensu ? "Reality Manipulation" : offeringDescription(model, modelDef?.description ?? "");

  const thumbnail = offeringThumbnail(model);

  return (
    <div className="relative rounded-2xl overflow-hidden h-44 flex-shrink-0 bg-muted">
      {thumbnail?.type === "video" ? (
        <video
          key={thumbnail.url}
          autoPlay
          muted
          loop
          playsInline
          src={thumbnail.url}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={thumbnail.url}
          src={thumbnail.url}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : isEditTool(model) && modelDef ? (
        // Edit tools: a tinted tile with the tool's icon until preview files exist.
        <div className="absolute inset-0 flex items-start justify-center pt-8 bg-[radial-gradient(120%_90%_at_50%_0%,rgba(107,65,255,0.35),rgba(234,75,255,0.12)_45%,transparent_75%)]">
          <span className="text-[40px] opacity-90" aria-hidden>
            {modelDef.svg}
          </span>
        </div>
      ) : null}

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
        <h2 className="text-[var(--purple-300)] font-bold text-xl leading-tight tracking-tight">
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
  const { groupByKind } = useCatalog();
  const sections = groupByKind(modelsToShow);
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

      {sections.map((section) => (
        <div key={section.kind} className="flex flex-col gap-1">
          {sections.length > 1 && (
            <p className="px-1 pt-2 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              {section.label}
            </p>
          )}
      {section.items.map((m) => {
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
      ))}
    </div>
  );
}

// ─── style card ───────────────────────────────────────────────────────────────

function StyleThumb({ index, videoUrl, imageUrl }: { index: number; videoUrl?: string; imageUrl?: string }) {
  return videoUrl ? (
    <video src={videoUrl} autoPlay muted loop playsInline className="h-full w-full object-cover" />
  ) : imageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={imageUrl} alt="" className="h-full w-full object-cover" />
  ) : (
    <span
      className={`block h-full w-full bg-gradient-to-br ${STYLE_FALLBACK_GRADIENTS[index % STYLE_FALLBACK_GRADIENTS.length]}`}
    />
  );
}

/** "Style · New · Apply >": opens the Styles tab; shows the picked style once there is one. */
function StyleCard() {
  const { styleId, setStyleId, setExplorerView, setSidebarView } = useAiGenerationControlStore();
  const { data: styles = [] } = useStylesQuery();
  const style = findStyle(styles, styleId);
  const shown = style ? [style, ...styles.filter((x) => x.id !== style.id).slice(0, 2)] : styles.slice(0, 3);
  const TILT = ["-rotate-[8deg]", "rotate-0", "rotate-[8deg]"];

  const open = () => {
    setSidebarView("default");
    setExplorerView("styles");
  };

  return (
    <div className="group flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] pr-2 transition-colors hover:bg-white/[0.07]">
      <button
        type="button"
        onClick={open}
        className="flex min-w-0 flex-1 items-center gap-3 py-2.5 pl-3 text-left"
        aria-label={style ? `Style: ${style.name}. Change style` : "Apply a style"}
      >
        {/* Stacked tiles */}
        <span className="relative h-9 w-12 shrink-0" aria-hidden>
          {shown
            .map((s, i) => (
              <span
                key={s.id}
                className={`absolute top-0 h-9 w-7 overflow-hidden rounded-md border border-white/25 shadow-md shadow-black/50 ${TILT[i]}`}
                style={{ left: i * 8, zIndex: 3 - i }}
              >
                <StyleThumb index={styles.indexOf(s)} videoUrl={s.videoUrl} imageUrl={s.imageUrl} />
              </span>
            ))}
        </span>
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className="truncate text-[14px] font-semibold text-white">{style ? style.name : "Style"}</span>
          {!style && (
            <span className="shrink-0 rounded-md bg-[#d4ff00]/15 px-1.5 py-px text-[10px] font-semibold text-[#d4ff00]">
              New
            </span>
          )}
        </span>
        <span className="flex shrink-0 items-center gap-0.5 text-[12px] font-medium text-white/45 transition-colors group-hover:text-white/70">
          {style ? "Change" : "Apply"}
          <ChevronRight className="size-3.5" />
        </span>
      </button>
      {style && (
        <button
          type="button"
          onClick={() => setStyleId(null)}
          aria-label="Remove style"
          className="flex size-6 shrink-0 items-center justify-center rounded-full text-white/45 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

// ─── generate button ──────────────────────────────────────────────────────────

function GenerateButton() {
  const { model, projectId, mediaType, styleId } = useAiGenerationControlStore();
  const { user } = useAuth();
  // Generations need a project; there is no picker here, so use the first one.
  useDefaultProject(!!user);
  const { states } = useAiModelStore();
  const { data: costData, error: costError } = useGenerationCostQuery();
  // The picked style rides along for models that take one (and makes the prompt optional).
  const styled = withStyle(model, (states[model] ?? {}) as object, styleId);
  const generation = useGenerateMutation();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const isValid = () => {
    const v = ModelsValidatorSchemaMap[model];
    return v ? v.safeParse(styled.forValidation).success : false;
  };

  const handleGenerate = async () => {
    try {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      await generation.mutateAsync({
        model,
        projectId,
        mediaType,
        input: styled.input as NonNullable<(typeof states)[typeof model]>,
      });
      // Already on a create page (image, video, …)? Stay there to watch the result.
      if (!pathname.startsWith("/create")) {
        router.push("/create");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // No price for this model (or the estimate failed): nothing can be charged.
  const valid = isValid() && !costError;

  return (
    <div className="relative">
      <div className="relative">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!valid || generation.isPending}
          className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${
            valid ? "bg-primary text-white hover:bg-primary/90" : "bg-primary/40 text-white/60"
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
              <span className="flex items-center gap-1 opacity-80 text-base font-bold tabular-nums">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                  <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clipRule="evenodd" />
                </svg>
                {costData?.creditsCost ?? 0}
              </span>
            </>
          )}
        </button>
      </div>
      {costError && (
        <p className="mt-2 text-center text-xs text-red-400">{(costError as Error).message}</p>
      )}
    </div>
  );
}

// ─── main sidebar ─────────────────────────────────────────────────────────────

export function CreateSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { model, setModel, sidebarView, setSidebarView } = useAiGenerationControlStore();
  const [mode, setMode] = useState<EditMode>("create");
  const { withCatalog } = useCatalog();
  const [pickerOpen, setPickerOpen] = useState(false);

  // Sync model from ?model= URL param on mount
  useEffect(() => {
    let urlModel = normalizeModelId(searchParams.get("model")) as AiModelsEnum | null;
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
  // Video and image pages have Create / Edit tabs; audio has one list.
  const hasModes = !isAudio;
  const createList = isImage ? CREATE_IMAGE_MODELS : CREATE_VIDEO_MODELS;
  const editList = isImage ? EDIT_IMAGE_MODELS : EDIT_VIDEO_MODELS;

  // The tab follows the model, so links like ?model=smpl-video-upscale open on Edit.
  useEffect(() => {
    if (!hasModes) return;
    if (editList.some((m) => m.id === model)) setMode("edit");
    else if (createList.some((m) => m.id === model)) setMode("create");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model, isImage, hasModes]);

  // Current names; offerings an admin turned off are left out.
  const modelsToShow: Model[] = withCatalog(isAudio ? AUDIO_MODELS : mode === "create" ? createList : editList);

  const handleModeChange = (next: EditMode) => {
    setMode(next);
    setSidebarView("default");
    const list = next === "create" ? createList : editList;
    if (list.length > 0 && !list.some((m) => m.id === model)) {
      handleModelSelect(list[0].id);
    }
  };

  const showSettings =
    !pickerOpen &&
    model !== AiModelsEnum.SMPL_GENSU &&
    model !== AiModelsEnum.SMPL_RIPPER &&
    // Its only setting sits in its own panel.
    model !== AiModelsEnum.SMPL_VOICE_CHANGER;

  return (
    // The panel sits one shade above the page, so its controls move one shade up too.
    <aside className="h-full border-r border-border bg-white/[0.025] flex flex-col overflow-hidden [&_button:not(:disabled)]:cursor-pointer [&_a]:cursor-pointer [&_label]:cursor-pointer [&_[role=button]]:cursor-pointer [&_[role=option]]:cursor-pointer [--card:var(--background-light)] [--bg-card:var(--background-light)] [--bg-elevated:var(--background-lighter)]">
      {/* Create / Edit sub-tabs (video and image pages) */}
      {hasModes && (
        <div className="flex flex-col border-b border-border flex-shrink-0">
          <div className="flex w-full">
            {(["create", "edit"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => handleModeChange(tab)}
                className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-colors ${
                  mode === tab && sidebarView === "default"
                    ? "border-white text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "create" ? "Create" : "Edit"} {isImage ? "Image" : "Video"}
              </button>
            ))}
          </div>

          {/* How it works tab — video models that have data (only the video page shows it) */}
          {isVideo && HOW_IT_WORKS_MAP[model] && (
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
      {/* Scrolls vertically; cards keep their size instead of being squeezed to fit. */}
      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 flex flex-col gap-3 [&>*]:shrink-0">
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
            {/* Style (image and video prompt models) */}
            {hasModes && STYLE_MODEL_IDS.has(model) && <StyleCard />}

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
                <div className="@container">
                  <div className="grid grid-cols-2 gap-2 @[520px]:grid-cols-4">
                    <ModelSettingsPanel model={model} />
                  </div>
                </div>
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
