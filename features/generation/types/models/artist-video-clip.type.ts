import { z } from "zod";

/**
 * Artist Video Clip (Smpl): Nano Banana puts the character from one image into a 16:9 scene,
 * then OmniHuman v2 makes it sing the song part (no resolution or format options). Kept in sync with the backend.
 */
export const ArtistVideoClipInputConst = {
  styles: ["cozy", "rap", "aggressive", "sad"] as const,
  maxImages: 1,
  minSeconds: 4,
  maxSeconds: 30,
  maxPromptLength: 2000,
};

export type ArtistVideoClipStyle = (typeof ArtistVideoClipInputConst.styles)[number];

export interface IArtistVideoClipInput {
  prompt: string;
  /** The character image (one). */
  images: string[];
  /** Uploaded on Generate: the chosen song part (also the clip length). */
  audioUrl: string;
  /** Picked by the user (no default). */
  style: ArtistVideoClipStyle | null;
  /** The chosen song part's length; only used for the price preview. */
  duration: number;
}

export const artistVideoClipValidationSchema = z.object({
  prompt: z.string().max(ArtistVideoClipInputConst.maxPromptLength).optional(),
  // Older saved inputs may have up to 3 images: keep the first.
  images: z.preprocess(
    (v) => (Array.isArray(v) ? v.slice(0, ArtistVideoClipInputConst.maxImages) : v),
    z.array(z.string().url()).min(1).max(ArtistVideoClipInputConst.maxImages),
  ),
  audioUrl: z.string().url().nonempty(),
  style: z.enum(ArtistVideoClipInputConst.styles),
  duration: z.number().optional(),
}) as unknown as z.ZodType<IArtistVideoClipInput>;
