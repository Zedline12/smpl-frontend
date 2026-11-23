import type {
  ArtistVideoClipLyricsPosition,
  ArtistVideoClipLyricsSize,
} from "@/features/generation/types/models/artist-video-clip.type";

/**
 * The burned-in lyrics' layout, as shares of the video, mirroring the backend's `toAss`
 * (lyrics-subtitles.ts) so the preview shows the real size. Keep the numbers in sync.
 */
export const LYRICS_SIZE_SCALE: Record<ArtistVideoClipLyricsSize, number> = {
  small: 0.75,
  medium: 1,
  large: 1.3,
  xl: 1.6,
};

export const LYRICS_SIZE_OPTIONS: { id: ArtistVideoClipLyricsSize; label: string }[] = [
  { id: "small", label: "S" },
  { id: "medium", label: "M" },
  { id: "large", label: "L" },
  { id: "xl", label: "XL" },
];

export interface LyricsLayout {
  /** The ASS font size, as a share of the video height. */
  assSize: number;
  /** Bottom: the gap under the line; share of the height. */
  marginV: number;
  /** Left / right margins; share of the width. */
  marginH: number;
  /** Lip sync only: the black outline and shadow offset, shares of the height. */
  outline: number;
  shadow: number;
}

/** For a `width`×`height` video (the preview is 16:9). `large`: the Lyrics type's style. */
export function lyricsLayout(
  position: ArtistVideoClipLyricsPosition,
  size: ArtistVideoClipLyricsSize,
  large: boolean,
  width = 1920,
  height = 1080,
): LyricsLayout {
  const center = position === "center";
  const [byHeight, byWidth] = large
    ? center
      ? [0.12, 0.09]
      : [0.085, 0.07]
    : center
      ? [0.08, 0.07]
      : [0.055, 0.06];
  const px = Math.max(
    16,
    Math.round(Math.min(height * byHeight, width * byWidth) * (LYRICS_SIZE_SCALE[size] ?? 1)),
  );
  return {
    assSize: px / height,
    marginV: center ? 0 : Math.round(height * 0.07) / height,
    marginH: Math.round(width * (center ? 0.08 : 0.06)) / width,
    outline: large ? 0 : Math.max(2, Math.round(px * 0.09)) / height,
    shadow: large ? 0 : Math.max(1, Math.round(px * 0.05)) / height,
  };
}
