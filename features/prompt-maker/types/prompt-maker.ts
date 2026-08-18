import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import { GenerationTypeEnum } from "@/features/generation/types/generation";

/** Values are the display labels themselves — render them directly. */
export enum VisualStyleEnum {
  CINEMATIC = "Cinematic",
  PHOTOREALISTIC = "Photorealistic",
  HYPERREALISTIC = "Hyperrealistic",
  AUTHENTIC = "Authentic",
  EDITORIAL = "Editorial",
  COMMERCIAL = "Commercial",
  DOCUMENTARY = "Documentary",
  VINTAGE = "Vintage",
  MINIMALIST = "Minimalist",
  LUXURY = "Luxury",
  FUTURISTIC = "Futuristic",
  RETRO = "Retro",
  DREAMY = "Dreamy",
  SURREAL = "Surreal",
  MOODY = "Moody",
  DARK = "Dark",
  VIBRANT = "Vibrant",
  ETHEREAL = "Ethereal",
  DRAMATIC = "Dramatic",
  NATURAL = "Natural",
  RAW = "Raw",
  STYLIZED = "Stylized",
  ARTISTIC = "Artistic",
}

export const VISUAL_STYLES = Object.values(VisualStyleEnum);

export const VISUAL_STYLE_DESCRIPTIONS: Record<VisualStyleEnum, string> = {
  [VisualStyleEnum.CINEMATIC]:
    "Film-like framing, shallow depth of field and dramatic lighting.",
  [VisualStyleEnum.PHOTOREALISTIC]:
    "True-to-life detail, natural light and accurate materials.",
  [VisualStyleEnum.HYPERREALISTIC]:
    "Sharper than reality — extreme detail, texture and clarity.",
  [VisualStyleEnum.AUTHENTIC]:
    "Unposed and candid, like a real moment caught on camera.",
  [VisualStyleEnum.EDITORIAL]:
    "Magazine-quality styling with deliberate, considered composition.",
  [VisualStyleEnum.COMMERCIAL]:
    "Clean, polished advert look with bright, even lighting.",
  [VisualStyleEnum.DOCUMENTARY]:
    "Observational and journalistic, available light, nothing staged.",
  [VisualStyleEnum.VINTAGE]:
    "Aged film stock, faded colour and period-accurate detail.",
  [VisualStyleEnum.MINIMALIST]:
    "Sparse composition, generous negative space, very few elements.",
  [VisualStyleEnum.LUXURY]:
    "Rich materials, refined lighting and an expensive finish.",
  [VisualStyleEnum.FUTURISTIC]:
    "Sleek technology, neon accents and forward-looking design.",
  [VisualStyleEnum.RETRO]:
    "Bold nostalgic palettes and design cues from past decades.",
  [VisualStyleEnum.DREAMY]:
    "Soft focus, glowing highlights and a weightless atmosphere.",
  [VisualStyleEnum.SURREAL]:
    "Impossible juxtapositions and dream-logic imagery.",
  [VisualStyleEnum.MOODY]:
    "Low light, deep shadows and a heavy emotional tone.",
  [VisualStyleEnum.DARK]:
    "Near-black palette with restrained, low-key lighting.",
  [VisualStyleEnum.VIBRANT]:
    "Saturated colour and high energy throughout the frame.",
  [VisualStyleEnum.ETHEREAL]:
    "Delicate, luminous and otherworldly, almost translucent.",
  [VisualStyleEnum.DRAMATIC]:
    "Strong contrast and bold light that heightens tension.",
  [VisualStyleEnum.NATURAL]:
    "Understated and true to life, with soft daylight.",
  [VisualStyleEnum.RAW]:
    "Unpolished and gritty, with visible texture and imperfection.",
  [VisualStyleEnum.STYLIZED]:
    "Deliberately non-realistic with a strong artistic signature.",
  [VisualStyleEnum.ARTISTIC]:
    "Painterly and expressive, prioritising mood over accuracy.",
};

/** CreatePromptMakerDto bounds. */
export const MIN_DESCRIPTION_LENGTH = 3;
export const MAX_DESCRIPTION_LENGTH = 2000;

export const MAX_REFERENCE_IMAGES = 5;

export type PromptMakerSettings = Record<string, unknown>;

export interface PromptMaker {
  id: string;
  description: string;
  model: AiModelsEnum;
  mediaType: GenerationTypeEnum;
  input?: PromptMakerSettings;
  referenceImages?: string[];
  generatedPrompt: string;
  visualStyle: VisualStyleEnum | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromptMakerRequest {
  description: string;
  model: AiModelsEnum;
  mediaType: GenerationTypeEnum;
  /** Model settings only — the prompt is the output, not an input. */
  input?: PromptMakerSettings;
  referenceImages?: string[];
  visualStyle?: VisualStyleEnum;
}
