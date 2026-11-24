"use client";
import { cn } from "@/lib/utils";
import { CLIP_FONT_OPTIONS } from "../../data/lyric-fonts";
import { LYRICS_SIZE_OPTIONS, lyricsLayout } from "../../data/lyrics-layout";
import { useClipScenes } from "../../api/clip-scenes";
import { useVideoClipBuilder } from "../../hooks/useVideoClipBuilder";
import { Slider } from "@/components/ui/slider";
import { ArtistVideoClipInputConst } from "@/features/generation/types/models/artist-video-clip.type";
import { Segmented, studioLabel } from "./ChipGroup";
import { CLIP_LYRICS_OPTIONS, CLIP_LYRICS_POSITION_OPTIONS, ClipFontPicker } from "./ClipInputs";

type Clip = ReturnType<typeof useVideoClipBuilder>;

/** The preview's looping background; empty: the chosen ready-made video, else a moving gradient. */
export const LYRICS_PREVIEW_VIDEO_URL = "";

/** Sample lines as long as real ones (8 words at most; 5 in the middle of a lyrics video). */
const SAMPLE = "Dancing all night under the city lights";
const SAMPLE_SHORT = "Dancing under the city lights";

/** Mutes the element itself (React sets `muted` too late for autoplay) and starts it. */
const startLoop = (el: HTMLVideoElement | null) => {
  if (!el) return;
  el.muted = true;
  el.defaultMuted = true;
  void el.play().catch(() => {});
};

/**
 * The lyrics settings with a live preview (both clip types): font, Center / Bottom, and a
 * 16:9 looping video with a sample line in that font and place. Lip sync has an on/off.
 */
export function LyricsStylePanel({ clip }: { clip: Clip }) {
  const { set, pending } = clip;
  const lipsync = clip.type === "lipsync";
  const on = !lipsync || clip.lyrics;
  const { videos } = useClipScenes();
  const font = CLIP_FONT_OPTIONS.find((f) => f.id === clip.lyricsFont) ?? CLIP_FONT_OPTIONS[0];
  const bottom = clip.lyricsPosition === "bottom";
  const layout = lyricsLayout(clip.lyricsPosition, clip.lyricsSize, !lipsync);
  // The chosen ready-made video (or the first): its thumbnail photo when it has one.
  const backdrop = videos.find((v) => v.id === clip.backgroundVideoId) ?? videos[0];
  const imageUrl = LYRICS_PREVIEW_VIDEO_URL ? "" : backdrop?.thumbnail || "";
  const videoUrl = LYRICS_PREVIEW_VIDEO_URL || (imageUrl ? "" : backdrop?.videoUrl || "");

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-white">Lyrics</h2>
      {lipsync && (
        <div className="w-52">
          <Segmented
            small
            label=""
            options={CLIP_LYRICS_OPTIONS}
            value={clip.lyrics ? "on" : "off"}
            onChange={(v) => set("lyrics", v === "on")}
            disabled={pending}
          />
        </div>
      )}

      {on && (
        <div className="grid gap-5 rounded-3xl border border-white/[0.07] bg-black/25 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:p-5">
          <div className="flex flex-col gap-5">
            <ClipFontPicker value={clip.lyricsFont} onChange={(f) => set("lyricsFont", f)} disabled={pending} />
            <div className="w-56">
              <Segmented
                small
                label="Text size"
                options={LYRICS_SIZE_OPTIONS}
                value={clip.lyricsSize}
                onChange={(s) => set("lyricsSize", s)}
                disabled={pending}
              />
            </div>
            <PercentSlider
              label="Text opacity"
              value={clip.lyricsOpacity}
              min={ArtistVideoClipInputConst.lyricsOpacity.min}
              max={ArtistVideoClipInputConst.lyricsOpacity.max}
              onChange={(v) => set("lyricsOpacity", v)}
              disabled={pending}
            />
            <PercentSlider
              label="Background dim"
              value={clip.backgroundDim}
              min={ArtistVideoClipInputConst.backgroundDim.min}
              max={ArtistVideoClipInputConst.backgroundDim.max}
              onChange={(v) => set("backgroundDim", v)}
              disabled={pending}
            />
            <div className="w-56">
              <Segmented
                small
                label="Position"
                options={CLIP_LYRICS_POSITION_OPTIONS}
                value={clip.lyricsPosition}
                onChange={(p) => set("lyricsPosition", p)}
                disabled={pending}
              />
            </div>
          </div>

          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black">
            {/* Shows when there's no video (or while it loads). */}
            <div
              className="absolute inset-0 animate-pulse"
              style={{
                background:
                  "radial-gradient(circle at 25% 30%, color-mix(in oklab, var(--color-primary) 55%, transparent), transparent 60%), radial-gradient(circle at 75% 70%, color-mix(in oklab, var(--color-secondary) 50%, transparent), transparent 60%), #0b0a10",
              }}
            />
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img loading="lazy" decoding="async" src={imageUrl} alt="" className="absolute inset-0 size-full object-cover" />
            )}
            {videoUrl && (
              <video
                key={videoUrl}
                ref={startLoop}
                src={videoUrl}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 size-full object-cover"
              />
            )}
            {/* The background dim, as the video gets it (black at that opacity = the same darkening). */}
            <div className="absolute inset-0 bg-black" style={{ opacity: clip.backgroundDim / 100 }} />
            {/* Sized in container units: the same share of the frame as the rendered video. */}
            <div className="absolute inset-0 [container-type:size]">
              <div
                className="absolute flex justify-center text-center"
                style={{
                  left: `${layout.marginH * 100}cqw`,
                  right: `${layout.marginH * 100}cqw`,
                  ...(bottom
                    ? { bottom: `${layout.marginV * 100}cqh` }
                    : { top: "50%", transform: "translateY(-50%)" }),
                }}
              >
                <span
                  className={cn("text-white [text-wrap:balance]", font.className)}
                  style={{
                    opacity: clip.lyricsOpacity / 100,
                    fontSize: `${layout.assSize * font.emPerAssSize * 100}cqh`,
                    // libass's line box is the ASS size (the font's full height).
                    lineHeight: 1 / font.emPerAssSize,
                    ...(layout.outline
                      ? {
                          WebkitTextStroke: `${layout.outline * 200}cqh #000`,
                          paintOrder: "stroke fill",
                          textShadow: `${layout.shadow * 100}cqh ${layout.shadow * 100}cqh 0 rgba(0,0,0,0.5)`,
                        }
                      : {}),
                  }}
                >
                  {lipsync || !bottom ? SAMPLE_SHORT : SAMPLE}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** A labelled 0-100 % slider with its value. */
function PercentSlider({
  label,
  value,
  min,
  max,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex w-full max-w-xs flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className={studioLabel}>{label}</span>
        <span className="text-xs font-semibold text-white/70 tabular-nums">{value}%</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={5}
        onValueChange={([v]) => onChange(v)}
        disabled={disabled}
        aria-label={label}
      />
    </div>
  );
}
