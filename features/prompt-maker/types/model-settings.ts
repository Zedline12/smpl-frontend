import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import {
  GEMINI_FLASH_IMAGE_ASPECT_RATIOS,
  GEMINI_FLASH_IMAGE_RESOLUTIONS,
} from "@/features/generation/types/models/gemini-flash-image.type";
import { KlingO3ImageOptionsConst } from "@/features/generation/types/models/kling-o3-image.type";
import { SeedreamV45OptionsConst } from "@/features/generation/types/models/seedream-v4-5.type";
import { GptImage2OptionsConst } from "@/features/generation/types/models/gpt-image-2.type";
import {
  VEO3_ASPECT_RATIOS,
  VEO3_DURATION_SECONDS,
  VEO3_RESOLUTIONS,
} from "@/features/generation/types/models/veo-3.type";
import { KlingV3TextToVideoInputConst } from "@/features/generation/types/models/kling-v3-text-to-video.type";
import { KlingV3ImageToVideoInputConst } from "@/features/generation/types/models/kling-v3-image-to-video.type";
import { Seedance20InputConst } from "@/features/generation/types/models/seedance-2.0.type";
import { Seedance25InputConst } from "@/features/generation/types/models/seedance-2.5.type";
import { GrokImagineVideo15InputConst } from "@/features/generation/types/models/grok-imagine-video-1.5.type";
import { ModelDefaults } from "@/stores/aiGenerationStore.type";
import { PromptMakerSettings } from "./prompt-maker";

/**
 * Which of the common settings each model exposes in the Prompt Maker.
 * Deliberately excludes generation-time concerns (reference media, multi-prompt
 * and element editors, voice tuning) — those don't shape a written prompt.
 */
export type ModelSettingsSpec = {
  aspectRatio?: readonly string[];
  resolution?: readonly string[];
  quality?: readonly string[];
  /** Veo 3 is the only model that names this `durationSeconds`. */
  duration?: { key: "duration" | "durationSeconds"; options: readonly number[] };
  generateAudio?: boolean;
};

export const MODEL_SETTINGS: Partial<Record<AiModelsEnum, ModelSettingsSpec>> = {
  [AiModelsEnum.GEMINI_FLASH_IMAGE]: {
    aspectRatio: GEMINI_FLASH_IMAGE_ASPECT_RATIOS,
    resolution: GEMINI_FLASH_IMAGE_RESOLUTIONS,
  },
  [AiModelsEnum.KLING_O3_IMAGE]: {
    aspectRatio: KlingO3ImageOptionsConst.aspectRatio,
    resolution: KlingO3ImageOptionsConst.resolution,
  },
  [AiModelsEnum.SEEDREAM_V4_5]: {
    aspectRatio: SeedreamV45OptionsConst.aspectRatio,
  },
  [AiModelsEnum.GPT_IMAGE_2]: {
    aspectRatio: GptImage2OptionsConst.aspectRatio,
    quality: GptImage2OptionsConst.quality,
  },
  [AiModelsEnum.VEO_3]: {
    aspectRatio: VEO3_ASPECT_RATIOS,
    resolution: VEO3_RESOLUTIONS,
    duration: { key: "durationSeconds", options: VEO3_DURATION_SECONDS },
    generateAudio: true,
  },
  [AiModelsEnum.KLING_V3_TEXT_TO_VIDEO]: {
    aspectRatio: KlingV3TextToVideoInputConst.aspectRatio,
    duration: { key: "duration", options: KlingV3TextToVideoInputConst.duration },
    generateAudio: true,
  },
  [AiModelsEnum.KLING_V3_IMAGE_TO_VIDEO]: {
    duration: { key: "duration", options: KlingV3ImageToVideoInputConst.duration },
    generateAudio: true,
  },
  [AiModelsEnum.SEEDANCE_2_0]: {
    aspectRatio: Seedance20InputConst.aspectRatio,
    resolution: Seedance20InputConst.resolution,
    duration: { key: "duration", options: Seedance20InputConst.duration },
    generateAudio: true,
  },
  [AiModelsEnum.SEEDANCE_2_5]: {
    aspectRatio: Seedance25InputConst.aspectRatio,
    resolution: Seedance25InputConst.resolution,
    duration: { key: "duration", options: Seedance25InputConst.duration },
    generateAudio: true,
  },
  [AiModelsEnum.GROK_IMAGINE_VIDEO_1_5]: {
    aspectRatio: GrokImagineVideo15InputConst.aspectRatio,
    resolution: GrokImagineVideo15InputConst.resolution,
    duration: { key: "duration", options: GrokImagineVideo15InputConst.duration },
  },
  // KLING_V3_PRO_MOTION_CONTROL and ELEVEN_LABS_V3_TTS expose no common settings.
};

export function settingsSpecFor(model: AiModelsEnum): ModelSettingsSpec {
  return MODEL_SETTINGS[model] ?? {};
}

export function hasSettings(model: AiModelsEnum): boolean {
  return Object.keys(settingsSpecFor(model)).length > 0;
}

/**
 * Seeds the settings row from the same `ModelDefaults` the composer uses, but
 * keeps only the keys this model actually exposes — so `input` never carries
 * `prompt`, reference media, or other generation-only fields.
 */
export function defaultSettingsFor(model: AiModelsEnum): PromptMakerSettings {
  const spec = settingsSpecFor(model);
  const defaults = (ModelDefaults[model] ?? {}) as unknown as Record<
    string,
    unknown
  >;
  const settings: PromptMakerSettings = {};

  if (spec.aspectRatio) {
    settings.aspectRatio = defaults.aspectRatio ?? spec.aspectRatio[0];
  }
  if (spec.resolution) {
    settings.resolution = defaults.resolution ?? spec.resolution[0];
  }
  if (spec.quality) {
    settings.quality = defaults.quality ?? spec.quality[0];
  }
  if (spec.duration) {
    settings[spec.duration.key] =
      defaults[spec.duration.key] ?? spec.duration.options[0];
  }
  if (spec.generateAudio) {
    settings.generateAudio = defaults.generateAudio ?? false;
  }

  return settings;
}
