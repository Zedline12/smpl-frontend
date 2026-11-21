import { z } from "zod";

/** Artist Video Clip (Smpl, Kling 4.0): the character sings the song part. Kept in sync with the backend. */
export const ArtistVideoClipInputConst = {
  styles: ["cozy", "rap", "aggressive", "sad"] as const,
  resolution: ["720p", "1080p"] as const,
  aspectRatio: ["9:16", "16:9", "1:1"] as const,
  maxImages: 3,
  minSeconds: 4,
  maxSeconds: 30,
  maxPromptLength: 2000,
};

export type ArtistVideoClipStyle = (typeof ArtistVideoClipInputConst.styles)[number];

export interface IArtistVideoClipInput {
  prompt: string;
  /** Character images, @Image1 first. */
  images: string[];
  /** Uploaded on Generate: the chosen song part (also the clip length). */
  audioUrl: string;
  /** Picked by the user (no default). */
  style: ArtistVideoClipStyle | null;
  /** The chosen song part's length; only used for the price preview. */
  duration: number;
  resolution: (typeof ArtistVideoClipInputConst.resolution)[number];
  aspectRatio: (typeof ArtistVideoClipInputConst.aspectRatio)[number];
}

export const artistVideoClipValidationSchema = z.object({
  prompt: z.string().max(ArtistVideoClipInputConst.maxPromptLength).optional(),
  images: z.array(z.string().url()).min(1).max(ArtistVideoClipInputConst.maxImages),
  audioUrl: z.string().url().nonempty(),
  style: z.enum(ArtistVideoClipInputConst.styles),
  duration: z.number().optional(),
  // Saved inputs from the Seedance version may say 480p; Kling's lowest is 720p.
  resolution: z
    .preprocess((v) => (v === "480p" ? "720p" : v), z.enum(ArtistVideoClipInputConst.resolution))
    .optional(),
  aspectRatio: z.enum(ArtistVideoClipInputConst.aspectRatio).optional(),
}) as unknown as z.ZodType<IArtistVideoClipInput>;
