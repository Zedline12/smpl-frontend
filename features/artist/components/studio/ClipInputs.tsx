"use client";
import { useState } from "react";
import { ChevronDown, ImagePlus, Smile, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MENU_CONTENT_CLASS } from "@/features/media/components/actions/MediaCardActions";
import { MediaManagerDialog } from "@/features/generation/components/prompt/MediaManagerDialog";
import {
  ArtistVideoClipInputConst,
  ArtistVideoClipLyricsFont,
  ArtistVideoClipLyricsPosition,
  ArtistVideoClipMood,
  ArtistVideoClipScene,
  ArtistVideoClipType,
} from "@/features/generation/types/models/artist-video-clip.type";
import type { ClipSceneOption } from "../../data/clip-scene";
import { CLIP_FONT_OPTIONS } from "../../data/lyric-fonts";
import { MOODS } from "../../data/presets";
import { DiscMenuButton } from "../DiscMenuButton";
import { studioLabel } from "./ChipGroup";

/** Lip sync: the character sings; Lyrics: a picture with the song's lyrics. */
export const CLIP_TYPE_OPTIONS: { id: ArtistVideoClipType; label: string }[] = [
  { id: "lipsync", label: "Lip sync" },
  { id: "lyrics", label: "Lyrics" },
];

/** Scene: a Nano Banana scene from the picks, or the photo as is. */
export const CLIP_SCENE_OPTIONS: { id: ArtistVideoClipScene; label: string }[] = [
  { id: "song", label: "Song scene" },
  { id: "original", label: "Original photo" },
];

/** Lip sync: lyrics burned in at the bottom, or none ("on"/"off": the rail takes string ids). */
export const CLIP_LYRICS_OPTIONS: { id: "off" | "on"; label: string }[] = [
  { id: "off", label: "Off" },
  { id: "on", label: "On bottom" },
];

/** Lyrics type: where the lines sit. */
export const CLIP_LYRICS_POSITION_OPTIONS: { id: ArtistVideoClipLyricsPosition; label: string }[] = [
  { id: "center", label: "Center" },
  { id: "bottom", label: "Bottom" },
];

export const ORIGINAL_PHOTO_HINT = "Your photo is animated as is: its background and shape stay.";
export const BACKGROUND_SET_HINT = "Your background image sets the place: Location, Weather and Time are off.";

/** A scene option's 16:9 face: its thumbnail, or its gradient and emoji until it has one. */
function ThumbFace<Id extends string>({
  option,
  active,
  small,
}: {
  option: ClipSceneOption<Id>;
  active?: boolean;
  small?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative block aspect-video w-full overflow-hidden rounded-xl border transition-all",
        active
          ? "border-primary shadow-[0_0_16px_-6px_var(--color-primary)] ring-1 ring-primary"
          : "border-white/10",
      )}
      style={
        option.thumbnail
          ? undefined
          : { background: `linear-gradient(135deg, ${option.accent[0]}, ${option.accent[1]})` }
      }
    >
      {option.thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={option.thumbnail} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center pb-3 leading-none",
            small ? "text-base" : "text-4xl",
          )}
        >
          {option.emoji}
        </span>
      )}
      {!small && (
        <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/80 to-transparent px-3 pt-6 pb-2 text-left text-sm font-semibold text-white">
          {option.label}
        </span>
      )}
    </span>
  );
}

/**
 * Location / Weather / Time as 16:9 cards. "strip": a big card that opens large photos (desktop); "menu": a
 * small card that opens the cards in a grid above it (phone dock).
 */
export function ThumbPicker<Id extends string>({
  label,
  options,
  value,
  onChange,
  disabled,
  variant = "strip",
}: {
  label: string;
  options: ClipSceneOption<Id>[];
  value: Id;
  onChange: (id: Id) => void;
  disabled?: boolean;
  variant?: "strip" | "menu";
}) {
  const current = options.find((o) => o.id === value) ?? options[0];

  if (variant === "menu")
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={disabled}>
          <button
            type="button"
            aria-label={`${label}: ${current.label}`}
            className="group flex min-w-0 flex-1 flex-col items-center gap-1 outline-none disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="w-full transition-transform group-data-[state=open]:scale-[1.04]">
              <ThumbFace option={current} small />
            </span>
            <span className="w-full truncate text-center text-[9px] font-semibold uppercase tracking-[0.12em] text-white/55">
              {current.label}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          align="center"
          sideOffset={10}
          collisionPadding={8}
          className={`${MENU_CONTENT_CLASS} w-[min(20rem,calc(100vw-1.5rem))] p-2`}
        >
          <p className="px-1 pb-2 text-[10px] font-semibold uppercase tracking-widest text-white/45">{label}</p>
          <div className="grid grid-cols-3 gap-1.5">
            {options.map((o) => (
              <DropdownMenuItem
                key={o.id}
                onSelect={() => onChange(o.id)}
                className="block rounded-xl p-0 focus:bg-transparent"
              >
                <ThumbFace option={o} active={o.id === value} />
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );

  // Desktop: a big 16:9 card of the current pick that opens all the picks as large photos.
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", disabled && "opacity-40")}>
      <span className={studioLabel}>{label}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={disabled}>
          <button
            type="button"
            aria-label={`${label}: ${current.label}`}
            className="group relative w-full rounded-xl outline-none transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <ThumbFace option={current} />
            <span className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-black/55 text-white/85 backdrop-blur transition-transform group-data-[state=open]:rotate-180">
              <ChevronDown className="size-4" />
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={8}
          collisionPadding={12}
          className={`${MENU_CONTENT_CLASS} max-h-[70vh] w-[min(40rem,calc(100vw-2rem))] overflow-y-auto p-3`}
        >
          <p className="px-1 pb-2.5 text-[11px] font-semibold uppercase tracking-widest text-white/45">{label}</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {options.map((o) => (
              <DropdownMenuItem
                key={o.id}
                onSelect={() => onChange(o.id)}
                className="block rounded-xl p-0 transition-transform hover:scale-[1.02] focus:bg-transparent"
              >
                <ThumbFace option={o} active={o.id === value} />
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/** Mood, the song-creation moods on a disc; one pick. */
export function ClipMoodPicker({
  value,
  onChange,
  disabled,
  compact,
  hideLabel,
}: {
  value: ArtistVideoClipMood;
  onChange: (mood: ArtistVideoClipMood) => void;
  disabled?: boolean;
  compact?: boolean;
  hideLabel?: boolean;
}) {
  return (
    <DiscMenuButton
      single
      hideLabel={hideLabel}
      variant={compact ? "mini" : "knob"}
      icon={Smile}
      label="Mood"
      options={MOODS as { id: ArtistVideoClipMood; label: string; emoji?: string }[]}
      selected={[value]}
      max={1}
      disabled={disabled}
      onChange={(next) => next[0] && onChange(next[0])}
    />
  );
}

/** The optional background image: a 16:9 tile, or a small thumbnail in the phone dock. */
export function ClipBackgroundPicker({
  value,
  onChange,
  compact,
  disabled,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  compact?: boolean;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const size = compact ? "h-10 w-[4.5rem] shrink-0 rounded-xl" : "aspect-video w-full rounded-2xl";

  return (
    <>
      {value ? (
        <div className={cn("group relative overflow-hidden border border-primary/40 bg-black/40", size)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Background" className="h-full w-full object-cover" />
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(null)}
            aria-label="Remove background image"
            className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/70 text-white/80 hover:text-white"
          >
            <X className="size-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(true)}
          aria-label="Add background image"
          className={cn(
            "flex flex-col items-center justify-center gap-1.5 border border-dashed border-white/15 bg-white/[0.03] text-white/60 transition-colors hover:border-white/30 hover:text-white disabled:opacity-40",
            size,
          )}
        >
          <ImagePlus className={compact ? "size-4" : "size-5"} />
          {compact ? (
            <span className="text-[9px] font-semibold">Background</span>
          ) : (
            <span className="text-[11px] font-semibold">Add background image</span>
          )}
        </button>
      )}
      <MediaManagerDialog
        open={open}
        onOpenChange={(o) => !o && setOpen(false)}
        selectedImages={value ? [value] : []}
        onSelect={(urls: string[]) => {
          onChange(urls[0] ?? null);
          setOpen(false);
        }}
        maxSelections={1}
        mediaType="image"
      />
    </>
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
  const size = compact ? "size-10 rounded-xl" : "aspect-square w-44 rounded-2xl";

  return (
    <>
      <div className={compact ? "flex shrink-0 gap-1.5" : "flex flex-wrap justify-center gap-3"}>
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
            <ImagePlus className={compact ? "size-4" : "size-8"} />
            {!compact && <span className="text-sm font-semibold">{images.length ? "Add more" : "Add character"}</span>}
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

/** The lyrics font: each chip is written in its own font. `compact`: a dropdown (phone dock). */
export function ClipFontPicker({
  value,
  onChange,
  disabled,
  compact,
}: {
  value: ArtistVideoClipLyricsFont;
  onChange: (font: ArtistVideoClipLyricsFont) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  const current = CLIP_FONT_OPTIONS.find((f) => f.id === value) ?? CLIP_FONT_OPTIONS[0];

  if (compact)
    return (
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">Font</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={disabled}>
            <button
              type="button"
              aria-label={`Font: ${current.label}`}
              className={cn(
                "h-9 truncate rounded-xl border border-white/10 bg-black/40 px-2 text-sm text-white disabled:opacity-40",
                current.className,
              )}
            >
              {current.label}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="center" sideOffset={8} className={`${MENU_CONTENT_CLASS} w-48 p-1.5`}>
            {CLIP_FONT_OPTIONS.map((f) => (
              <DropdownMenuItem
                key={f.id}
                onSelect={() => onChange(f.id)}
                className={cn("text-base", f.className, f.id === value && "bg-primary/25 text-white")}
              >
                {f.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );

  return (
    <div className="flex flex-col gap-2.5">
      <span className={studioLabel}>Font</span>
      <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Font">
        {CLIP_FONT_OPTIONS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="radio"
            aria-checked={f.id === value}
            disabled={disabled}
            onClick={() => onChange(f.id)}
            className={cn(
              "h-11 truncate rounded-xl border px-2 text-base text-white transition-all disabled:opacity-40",
              f.className,
              f.id === value
                ? "border-primary bg-primary/25 shadow-[0_0_18px_-8px_var(--color-primary)]"
                : "border-white/[0.07] bg-black/30 text-white/75 hover:text-white",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
