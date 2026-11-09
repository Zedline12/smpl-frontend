import { z } from "zod";
import { GensuInputConst } from "./gensu.type";
import {
  Seedance25RefDuration,
  Seedance25RefInputConst,
} from "./seedance-2.5-ref-to-video.type";

/** Artist (Smpl): the character performs to the audio, following the reference video. */
export const ArtistInputConst = {
  resolution: GensuInputConst.resolution,
  aspectRatio: Seedance25RefInputConst.aspectRatio,
  maxImages: 8,
};

export interface IArtistInput {
  prompt: string;
  /** Character images, @Image1 first. */
  images: string[];
  /** Moves and camera to follow. */
  videoUrl: string;
  /** Uploaded on Generate; sets the clip length and is put on the final video. */
  audioUrl: string;
  /** The chosen audio's length; only used for the price preview. */
  duration: Seedance25RefDuration;
  resolution: (typeof ArtistInputConst.resolution)[number];
  aspectRatio: (typeof ArtistInputConst.aspectRatio)[number];
}

export const artistValidationSchema = z.object({
  prompt: z.string().max(5000).optional(),
  images: z.array(z.string().url()).min(1).max(ArtistInputConst.maxImages),
  videoUrl: z.string().url().nonempty(),
  audioUrl: z.string().url().nonempty(),
  duration: z.number().optional(),
  resolution: z.enum(ArtistInputConst.resolution).optional(),
  aspectRatio: z.enum(ArtistInputConst.aspectRatio).optional(),
}) as unknown as z.ZodType<IArtistInput>;
