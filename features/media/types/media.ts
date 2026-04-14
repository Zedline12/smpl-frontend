export const ASPECT_RATIOS = [
  "16:9",
  "4:3",
  "1:1",
  "3:4",
  "9:16",
  "5:4",
] as const;
export const IMAGE_ASPECT_RATIOS = [
  "16:9",
  "4:3",
  "1:1",
  "3:4",
  "9:16",
  "5:4",
] as const;
export const VIDEO_ASPECT_RATIOS = [
  "16:9",
  "9:16",
] as const;
export const VIDEO_RESOLUTIONS = [
  "720p","1080p","4k"
] as const;
export const IMAGE_RESOLUTIONS = [
  "1K","2K","4K"
] as const;
export const VIDEO_DURATION_SECONDS = [
  4,6,8
]
export interface Media {
  id: string;
  url: string;
  type: MediaType;
  aspectRatio: AspectRatio;
  width: number;
  height: number;
  format: string;
  createdAt: string;
  updatedAt: string;
}
export type MediaType = "image" | "video" | "audio";
export enum MediaTypeEnum{
  IMAGE="image",
  VIDEO="video",
  AUDIO="audio"
}
export type ImageResolution = (typeof IMAGE_RESOLUTIONS)[number];
export type VideoResolution=(typeof VIDEO_RESOLUTIONS)[number];
export type ImageAspectRatio = (typeof IMAGE_ASPECT_RATIOS)[number];
export type VideoAspectRatio = (typeof IMAGE_ASPECT_RATIOS)[number];
export type VideoDuration=(typeof VIDEO_DURATION_SECONDS)[number];
export type AspectRatio=(typeof ASPECT_RATIOS)[number];
