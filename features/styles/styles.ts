import { AiModelsEnum } from "@/features/generation/enums/models.enum";

/**
 * A visual style (backend StylesModule; admins edit them in App Appearance → Styles).
 * The detailed prompt stays on the backend; generations send only `id` (an ObjectId)
 * as input.styleId. Load them with useStylesQuery (features/styles/api.ts).
 */
export interface Style {
  id: string;
  slug: string;
  name: string;
  videoUrl: string;
}

/** A style by id; also matches the slug that older inputs stored. */
export function findStyle(styles: Style[] | undefined, id: string | null | undefined): Style | null {
  if (!id || !styles) return null;
  return styles.find((s) => s.id === id || s.slug === id) ?? null;
}

/** The Styles tab hero video (16:9). */
export const STYLES_HERO_VIDEO = "";

/** Models whose prompt can take a style (same set as the backend's STYLE_MODELS). */
export const STYLE_MODEL_IDS: ReadonlySet<string> = new Set<string>([
  AiModelsEnum.VEO_3,
  AiModelsEnum.KLING_V3_TEXT_TO_VIDEO,
  AiModelsEnum.KLING_V3_IMAGE_TO_VIDEO,
  AiModelsEnum.KLING_V3_PRO_MOTION_CONTROL,
  AiModelsEnum.SEEDANCE_2_0,
  AiModelsEnum.SEEDANCE_2_5,
  AiModelsEnum.GROK_IMAGINE_VIDEO_1_5,
  AiModelsEnum.SMPL_GENSU,
  AiModelsEnum.KLING_4_0,
  AiModelsEnum.KLING_4_0_FLASH,
  AiModelsEnum.GEMINI_FLASH_IMAGE,
  AiModelsEnum.KLING_O3_IMAGE,
  AiModelsEnum.SEEDREAM_V4_5,
  AiModelsEnum.GPT_IMAGE_2,
]);

/** Each style's tile color when it has no preview video yet. */
export const STYLE_FALLBACK_GRADIENTS = [
  "from-[#6b41ff]/50 to-[#ea4bff]/30",
  "from-[#ff7a45]/45 to-[#ffd166]/25",
  "from-[#00c2ff]/45 to-[#6b41ff]/30",
  "from-[#22c55e]/40 to-[#0ea5e9]/25",
];

/**
 * The input sent for a model: the picked style is added for models that take one.
 * A style makes the prompt optional only when there are reference images/videos
 * (the style sets the look, the references set what's in it). Without references
 * the prompt is still required. Validation then gets a stand-in prompt.
 * Keep in sync with the backend's findStyleInputError.
 */
export function withStyle<T extends object>(
  model: string,
  input: T,
  styleId: string | null,
): { input: T; forValidation: T } {
  if (!styleId || !STYLE_MODEL_IDS.has(model)) return { input, forValidation: input };
  const styled = { ...input, styleId } as T;
  const prompt = (input as { prompt?: unknown }).prompt;
  const hasPrompt = typeof prompt === "string" && prompt.trim().length > 0;
  const promptOptional = hasPrompt || hasReferences(input);
  return { input: styled, forValidation: promptOptional && !hasPrompt ? ({ ...styled, prompt: "styled" } as T) : styled };
}

const REFERENCE_KEYS = ["imageUrl", "startImageUrl", "endImageUrl", "videoUrl", "image", "images", "videos"];

/** True when the input has at least one reference image or video. */
export function hasReferences(input: object): boolean {
  const i = input as Record<string, unknown>;
  return REFERENCE_KEYS.some((k) => {
    const v = i[k];
    return Array.isArray(v) ? v.some((x) => typeof x === "string" && x) : typeof v === "string" && v.length > 0;
  });
}
