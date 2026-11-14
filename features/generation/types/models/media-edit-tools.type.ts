import { z } from "zod";

/**
 * The ffmpeg edit tools in Edit Image / Edit Video (backend: MediaEditsModule).
 * Keep the option lists in sync with smpl-backend media-edits.constants.ts.
 */
export const MediaEditToolOptions = {
  aspectRatio: ["9:16", "16:9", "1:1", "4:5", "5:4", "3:4", "4:3", "2:3", "3:2", "21:9"] as const,
  fit: ["crop", "blur", "pad"] as const,
  position: ["center", "top", "bottom", "left", "right"] as const,
  imageScale: [2, 4] as const,
  videoResolution: ["1080p", "1440p", "4k"] as const,
  fps: [30, 60] as const,
  fpsMode: ["smooth", "fast"] as const,
};

export const MediaEditToolLimits = {
  videoReframeMaxSeconds: 60,
  videoUpscaleMaxSeconds: 60,
  fpsBoostMaxSeconds: 30,
  fpsBoostSmoothMaxLongSide: 1920,
  imageMaxLongSide: 8192,
};

export const FIT_LABELS: Record<string, string> = {
  crop: "Crop to fill",
  blur: "Blur background",
  pad: "Black bars",
};
export const POSITION_LABELS: Record<string, string> = {
  center: "Center",
  top: "Top",
  bottom: "Bottom",
  left: "Left",
  right: "Right",
};
export const SCALE_LABELS: Record<string, string> = { "2": "2x", "4": "4x" };
export const RESOLUTION_LABELS: Record<string, string> = { "1080p": "1080p", "1440p": "1440p (2K)", "4k": "4K" };
export const FPS_LABELS: Record<string, string> = { "30": "30 fps", "60": "60 fps" };
export const FPS_MODE_LABELS: Record<string, string> = {
  smooth: "Smooth (best, slower)",
  fast: "Fast (blended frames)",
};

type AspectRatio = (typeof MediaEditToolOptions.aspectRatio)[number];
type Fit = (typeof MediaEditToolOptions.fit)[number];
type Position = (typeof MediaEditToolOptions.position)[number];

export interface IImageReframeInput {
  /** Unused; the tools have no prompt. */
  prompt: string;
  imageUrl: string;
  aspectRatio: AspectRatio;
  fit: Fit;
  position: Position;
}

export interface IImageUpscaleInput {
  prompt: string;
  imageUrl: string;
  scale: (typeof MediaEditToolOptions.imageScale)[number];
  /** The source's shape (the saved result uses the real output's). */
  aspectRatio: string;
}

export interface IVideoReframeInput {
  prompt: string;
  videoUrl: string;
  aspectRatio: AspectRatio;
  fit: Fit;
  position: Position;
  /** The picked video's length, for the price preview. */
  duration: number;
}

export interface IVideoFpsBoostInput {
  prompt: string;
  videoUrl: string;
  fps: (typeof MediaEditToolOptions.fps)[number];
  mode: (typeof MediaEditToolOptions.fpsMode)[number];
  aspectRatio: string;
  duration: number;
}

export interface IVideoUpscaleInput {
  prompt: string;
  videoUrl: string;
  resolution: (typeof MediaEditToolOptions.videoResolution)[number];
  aspectRatio: string;
  duration: number;
}

const url = z.string().url().nonempty();
const o = MediaEditToolOptions;

export const imageReframeValidationSchema = z.object({
  prompt: z.string().optional(),
  imageUrl: url,
  aspectRatio: z.enum(o.aspectRatio),
  fit: z.enum(o.fit),
  position: z.enum(o.position).optional(),
}) as unknown as z.ZodType<IImageReframeInput>;

export const imageUpscaleValidationSchema = z.object({
  prompt: z.string().optional(),
  imageUrl: url,
  scale: z.union([z.literal(2), z.literal(4)]),
  aspectRatio: z.string().optional(),
}) as unknown as z.ZodType<IImageUpscaleInput>;

export const videoReframeValidationSchema = z.object({
  prompt: z.string().optional(),
  videoUrl: url,
  aspectRatio: z.enum(o.aspectRatio),
  fit: z.enum(o.fit),
  position: z.enum(o.position).optional(),
  duration: z.number().optional(),
}) as unknown as z.ZodType<IVideoReframeInput>;

export const videoFpsBoostValidationSchema = z.object({
  prompt: z.string().optional(),
  videoUrl: url,
  fps: z.union([z.literal(30), z.literal(60)]),
  mode: z.enum(o.fpsMode),
  aspectRatio: z.string().optional(),
  duration: z.number().optional(),
}) as unknown as z.ZodType<IVideoFpsBoostInput>;

export const videoUpscaleValidationSchema = z.object({
  prompt: z.string().optional(),
  videoUrl: url,
  resolution: z.enum(o.videoResolution),
  aspectRatio: z.string().optional(),
  duration: z.number().optional(),
}) as unknown as z.ZodType<IVideoUpscaleInput>;

/** Ratios a saved media can have (backend AspectRatioEnum). */
const MEDIA_ASPECT_RATIOS = ["9:16", "16:9", "1:1", "4:3", "3:4", "4:5", "5:4", "21:9", "3:2", "2:3", "2:1", "1:2"];

/** The listed aspect ratio closest to width x height. */
export function nearestAspectRatio(width: number, height: number): string {
  if (!(width > 0) || !(height > 0)) return "1:1";
  const target = Math.log(width / height);
  let best = "1:1";
  let bestDistance = Infinity;
  for (const r of MEDIA_ASPECT_RATIOS) {
    const [w, h] = r.split(":").map(Number);
    const d = Math.abs(Math.log(w / h) - target);
    if (d < bestDistance) {
      best = r;
      bestDistance = d;
    }
  }
  return best;
}
