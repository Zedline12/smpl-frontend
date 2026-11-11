import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

/** Mirrors smpl-backend/src/modules/video-clipping/platforms.ts. */
export type ClippingPlatformId =
  | "tiktok"
  | "instagram_reels"
  | "youtube_shorts"
  | "facebook_reels"
  | "linkedin"
  | "x"
  | "youtube";

export interface ClippingPlatform {
  id: ClippingPlatformId;
  label: string;
  short: string;
  /** Vizard ratioOfClip: 1 = 9:16, 2 = 1:1, 3 = 4:5, 4 = 16:9. */
  ratio: 1 | 2 | 3 | 4;
  preferLength: number[];
  titleMax: number;
  captionMax: number;
  hashtags: number;
  hashtagsInCaption?: boolean;
  /** Brand tile background behind the logo. */
  brand: string;
}

export const CLIPPING_PLATFORMS: ClippingPlatform[] = [
  { id: "tiktok", label: "TikTok", short: "TikTok", ratio: 1, preferLength: [1, 2], titleMax: 0, captionMax: 2200, hashtags: 5, brand: "linear-gradient(135deg,#25F4EE 0%,#000 45%,#000 55%,#FE2C55 100%)" },
  { id: "instagram_reels", label: "Instagram Reels", short: "Reels", ratio: 1, preferLength: [1, 2], titleMax: 0, captionMax: 2200, hashtags: 5, brand: "linear-gradient(45deg,#FEDA75,#FA7E1E,#D62976,#962FBF,#4F5BD5)" },
  { id: "youtube_shorts", label: "YouTube Shorts", short: "Shorts", ratio: 1, preferLength: [1, 2], titleMax: 100, captionMax: 5000, hashtags: 3, brand: "#FF0033" },
  { id: "facebook_reels", label: "Facebook Reels", short: "FB Reels", ratio: 1, preferLength: [1, 2], titleMax: 0, captionMax: 2200, hashtags: 3, brand: "#1877F2" },
  { id: "linkedin", label: "LinkedIn", short: "LinkedIn", ratio: 2, preferLength: [2, 3], titleMax: 0, captionMax: 3000, hashtags: 3, brand: "#0A66C2" },
  { id: "x", label: "X", short: "X", ratio: 2, preferLength: [1, 2], titleMax: 0, captionMax: 280, hashtags: 2, hashtagsInCaption: true, brand: "#000000" },
  { id: "youtube", label: "YouTube", short: "YouTube", ratio: 4, preferLength: [3, 4], titleMax: 100, captionMax: 5000, hashtags: 3, brand: "#FF0000" },
];

export const DEFAULT_PLATFORMS: ClippingPlatformId[] = ["tiktok", "instagram_reels", "youtube_shorts"];

export const PLATFORM_BY_ID = Object.fromEntries(CLIPPING_PLATFORMS.map((p) => [p.id, p])) as Record<
  ClippingPlatformId,
  ClippingPlatform
>;

export const SHAPES: Record<number, { label: string; name: string }> = {
  1: { label: "9:16", name: "Vertical" },
  2: { label: "1:1", name: "Square" },
  3: { label: "4:5", name: "Portrait" },
  4: { label: "16:9", name: "Wide" },
};

const LENGTH_LABELS: Record<number, string> = { 1: "<30s", 2: "30–60s", 3: "60–90s", 4: "90s–3m" };

export interface ShapeGroup {
  ratio: number;
  platforms: ClippingPlatform[];
  preferLength: number[];
}

/** Same grouping as the backend: one clip set (and one charge) per shape. */
export function groupByShape(ids: ClippingPlatformId[]): ShapeGroup[] {
  const groups = new Map<number, ShapeGroup>();
  for (const id of ids) {
    const p = PLATFORM_BY_ID[id];
    if (!p) continue;
    const g = groups.get(p.ratio) ?? { ratio: p.ratio, platforms: [], preferLength: [] };
    g.platforms.push(p);
    g.preferLength = [...new Set([...g.preferLength, ...p.preferLength])].sort();
    groups.set(p.ratio, g);
  }
  return [...groups.values()].sort((a, b) => a.ratio - b.ratio);
}

/** "<30s – 60s" style label for a set of length buckets. */
export function lengthRangeLabel(buckets: number[]): string {
  if (!buckets.length) return "Auto";
  const first = LENGTH_LABELS[buckets[0]]?.split("–")[0] ?? "";
  const last = LENGTH_LABELS[buckets[buckets.length - 1]] ?? "";
  return buckets.length === 1 ? LENGTH_LABELS[buckets[0]] : `${first.replace(/s$/, "")}–${last.split("–").pop()}`;
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.6 2.6 0 0 1-2.6-2.6 2.6 2.6 0 0 1 3.36-2.49V9.66a5.7 5.7 0 0 0-.76-.05A5.68 5.68 0 0 0 4.18 15.3 5.68 5.68 0 0 0 9.86 21a5.68 5.68 0 0 0 5.68-5.68V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.3 4.3 0 0 1-3.24-1.48Z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.17h1.7L7.4 4.74H5.58l11.09 14.43Z" />
    </svg>
  );
}

function ShortsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.77 10.32 16.6 9.7l1.03-.56a3.6 3.6 0 0 0 1.37-4.94 3.67 3.67 0 0 0-4.98-1.36L7.06 6.6a3.6 3.6 0 0 0-1.86 3.33 3.63 3.63 0 0 0 1.99 3.05l1.17.62-1.03.56a3.6 3.6 0 0 0-1.37 4.94 3.67 3.67 0 0 0 4.98 1.36l6.96-3.76a3.6 3.6 0 0 0 1.86-3.33 3.63 3.63 0 0 0-1.99-3.05ZM10 14.65v-5.3L14.5 12 10 14.65Z" />
    </svg>
  );
}

export function PlatformIcon({ id, className = "size-4" }: { id: ClippingPlatformId; className?: string }) {
  switch (id) {
    case "tiktok":
      return <TikTokIcon className={className} />;
    case "instagram_reels":
      return <Instagram className={className} />;
    case "youtube_shorts":
      return <ShortsIcon className={className} />;
    case "facebook_reels":
      return <Facebook className={className} />;
    case "linkedin":
      return <Linkedin className={className} />;
    case "x":
      return <XIcon className={className} />;
    case "youtube":
      return <Youtube className={className} />;
  }
}
