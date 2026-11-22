import { z } from "zod";

/**
 * Artist Video Clip (Smpl): OmniHuman v2 makes the character from one image sing the song part,
 * either the photo as is ("original") or a Nano Banana 16:9 scene made from it ("song").
 * Lyrics can be burned in at the bottom. Kept in sync with the backend.
 */
export const ArtistVideoClipInputConst = {
  styles: ["cozy", "rap", "aggressive", "sad"] as const,
  scenes: ["song", "original"] as const,
  maxImages: 1,
  minSeconds: 4,
  maxSeconds: 30,
  maxPromptLength: 2000,
};

export type ArtistVideoClipStyle = (typeof ArtistVideoClipInputConst.styles)[number];
export type ArtistVideoClipScene = (typeof ArtistVideoClipInputConst.scenes)[number];

export interface IArtistVideoClipInput {
  /** Song scene only. */
  prompt: string;
  /** The character image (one). */
  images: string[];
  /** Uploaded on Generate: the chosen song part (also the clip length). */
  audioUrl: string;
  /** "song" (default): a scene from the style; "original": the photo as is. */
  scene: ArtistVideoClipScene;
  /** Picked by the user (no default); needed for the Song scene only. */
  style: ArtistVideoClipStyle | null;
  /** Burn the lyrics in at the bottom. */
  lyrics: boolean;
  /** The chosen song part's length; only used for the price preview. */
  duration: number;
}

export const artistVideoClipValidationSchema = z
  .object({
    prompt: z.string().max(ArtistVideoClipInputConst.maxPromptLength).optional(),
    // Older saved inputs may have up to 3 images: keep the first.
    images: z.preprocess(
      (v) => (Array.isArray(v) ? v.slice(0, ArtistVideoClipInputConst.maxImages) : v),
      z.array(z.string().url()).min(1).max(ArtistVideoClipInputConst.maxImages),
    ),
    audioUrl: z.string().url().nonempty(),
    scene: z.enum(ArtistVideoClipInputConst.scenes).default("song"),
    style: z.enum(ArtistVideoClipInputConst.styles).nullable().optional(),
    lyrics: z.boolean().default(false),
    duration: z.number().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.scene === "song" && !v.style)
      ctx.addIssue({ code: "custom", path: ["style"], message: "Pick a style for the clip" });
  }) as unknown as z.ZodType<IArtistVideoClipInput>;
