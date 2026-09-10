import { Veo3AspectRatio, Veo3Duration } from "@/features/generation/types/models/veo-3.type";
import { GeminiFlashImageAspectRatio } from "@/features/generation/types/models/gemini-flash-image.type";
import { Media } from "@/features/media/types/media";

export type MarketingStudioMediaType = "photo" | "video";

export interface CreateMarketingAdRequest {
  brandThemeId: string;
  projectId: string;
  description: string;
  aspectRatio?: Veo3AspectRatio;
  durationSeconds?: Veo3Duration;
  generateAudio?: boolean;
  includeLogo?: boolean;
  includePrimaryColor?: boolean;
  includeFonts?: boolean;
  referenceImages?: string[];
}

export interface CreateMarketingPhotoRequest {
  brandThemeId: string;
  projectId: string;
  description: string;
  aspectRatio?: GeminiFlashImageAspectRatio;
  includeLogo?: boolean;
  includePrimaryColor?: boolean;
  includeFonts?: boolean;
  referenceImages?: string[];
}

/** Mirrors the cap MediaManagerDialog enforces for the generation composers. */
export const MAX_REFERENCE_IMAGES = 4;

export interface MarketingStudioCreation {
  id: string;
  brandThemeId: string;
  projectId: string;
  /** Null until generation finishes — its presence is the only status signal. */
  media: Media | null;
  mediaType: MarketingStudioMediaType;
  description: string;
  includeLogo: boolean;
  includePrimaryColor: boolean;
  includeFonts: boolean;
  createdAt: string;
  updatedAt: string;
}

export function isMarketingStudioActive(
  creation: Pick<MarketingStudioCreation, "media">,
): boolean {
  return creation.media === null;
}

export const MAX_DESCRIPTION_LENGTH = 2000;
