"use client";
import { useState } from "react";
import {
  CloudRain,
  Coffee,
  Flame,
  ImagePlus,
  type LucideIcon,
  Mic2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaManagerDialog } from "@/features/generation/components/prompt/MediaManagerDialog";
import {
  ArtistVideoClipInputConst,
  ArtistVideoClipStyle,
} from "@/features/generation/types/models/artist-video-clip.type";

export const CLIP_STYLES: {
  id: ArtistVideoClipStyle;
  label: string;
  hint: string;
  icon: LucideIcon;
  /** The tile's accent (from → to). */
  accent: [string, string];
}[] = [
  { id: "cozy", label: "Cozy", hint: "Warm lamps, soft and close", icon: Coffee, accent: ["#f59e0b", "#f97316"] },
  { id: "rap", label: "Rap", hint: "Neon streets at night", icon: Mic2, accent: ["#8b5cf6", "#06b6d4"] },
  { id: "aggressive", label: "Aggressive edit", hint: "Strobes, fast cuts, shake", icon: Flame, accent: ["#ef4444", "#ec4899"] },
  { id: "sad", label: "Sad", hint: "Rain, blue light, slow", icon: CloudRain, accent: ["#3b82f6", "#64748b"] },
];

/** The four clip styles as tiles; `compact` is the phone dock's round discs. */
export function ClipStylePicker({
  value,
  onChange,
  compact,
  disabled,
}: {
  value: ArtistVideoClipStyle | null;
  onChange: (style: ArtistVideoClipStyle) => void;
  compact?: boolean;
  disabled?: boolean;
}) {
  if (compact)
    return (
      <div className="flex items-start justify-between gap-2" role="radiogroup" aria-label="Style">
        {CLIP_STYLES.map(({ id, label, icon: Icon, accent }) => {
          const on = value === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={on}
              disabled={disabled}
              onClick={() => onChange(id)}
              className="flex min-w-0 flex-1 flex-col items-center gap-1 disabled:opacity-40"
            >
              <span
                className={cn(
                  "flex size-12 items-center justify-center rounded-full border transition-all",
                  on ? "border-transparent text-white shadow-[0_0_18px_-6px_var(--color-primary)]" : "border-white/10 bg-white/[0.05] text-white/70",
                )}
                style={on ? { background: `linear-gradient(135deg, ${accent[0]}, ${accent[1]})` } : undefined}
              >
                <Icon className="size-5" />
              </span>
              <span className={cn("w-full truncate text-center text-[10px] font-semibold", on ? "text-white" : "text-white/55")}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    );

  return (
    <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Style">
      {CLIP_STYLES.map(({ id, label, hint, icon: Icon, accent }) => {
        const on = value === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={disabled}
            onClick={() => onChange(id)}
            className={cn(
              "relative flex flex-col items-start gap-2 overflow-hidden rounded-2xl border p-3.5 text-left transition-all disabled:opacity-40",
              on
                ? "border-primary bg-primary/15 shadow-[0_0_22px_-10px_var(--color-primary)]"
                : "border-white/[0.07] bg-white/[0.04] hover:border-white/15 hover:bg-white/[0.07]",
            )}
          >
            <span
              className="flex size-9 items-center justify-center rounded-xl text-white"
              style={{ background: `linear-gradient(135deg, ${accent[0]}, ${accent[1]})` }}
            >
              <Icon className="size-[18px]" />
            </span>
            <span className="text-sm font-semibold text-white">{label}</span>
            <span className="text-[11px] leading-snug text-white/50">{hint}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Up to three character images (the first is the main one). */
export function ClipCharacterPicker({
  images,
  onChange,
  compact,
  disabled,
}: {
  images: string[];
  onChange: (images: string[]) => void;
  compact?: boolean;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { maxImages } = ArtistVideoClipInputConst;
  const size = compact ? "size-10 rounded-xl" : "aspect-square w-full rounded-2xl";

  return (
    <>
      <div className={compact ? "flex shrink-0 gap-1.5" : "grid grid-cols-3 gap-2.5"}>
        {images.map((url, i) => (
          <div key={url} className={cn("group relative overflow-hidden border border-white/10 bg-black/40", size)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Character ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange(images.filter((u) => u !== url))}
              aria-label="Remove image"
              className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/70 text-white/80 hover:text-white"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
        {images.length < maxImages && (!compact || images.length === 0) && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOpen(true)}
            aria-label="Add character"
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 border border-dashed border-white/15 bg-white/[0.03] text-white/60 transition-colors hover:border-white/30 hover:text-white disabled:opacity-40",
              size,
            )}
          >
            <ImagePlus className={compact ? "size-4" : "size-5"} />
            {!compact && <span className="text-[11px] font-semibold">{images.length ? "Add more" : "Add character"}</span>}
          </button>
        )}
      </div>
      <MediaManagerDialog
        open={open}
        onOpenChange={(o) => !o && setOpen(false)}
        selectedImages={images}
        onSelect={(urls: string[]) => {
          onChange(urls.slice(0, maxImages));
          setOpen(false);
        }}
        maxSelections={maxImages}
        mediaType="image"
      />
    </>
  );
}
