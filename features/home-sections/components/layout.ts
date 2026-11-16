import type { ContentAlign, MediaAspectRatio } from "../types";

/** Full class strings so Tailwind sees them. Phones get fewer columns. */
export const GRID_COLUMNS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
};

export const ASPECT_CLASS: Record<MediaAspectRatio, string> = {
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  "1:1": "aspect-square",
  "3:4": "aspect-[3/4]",
  "9:16": "aspect-[9/16]",
};

export const TEXT_ALIGN: Record<ContentAlign, string> = {
  left: "items-start text-left",
  center: "items-center text-center",
  right: "items-end text-right",
};
