"use client";
import { type ReactNode, useState } from "react";
import { Check, Film, ImagePlus, MapPin, PenLine, type LucideIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ArtistVideoClipInputConst } from "@/features/generation/types/models/artist-video-clip.type";
import { cn } from "@/lib/utils";
import type { ClipBackgroundVideo, ClipScenes } from "../../api/clip-scenes";
import { useVideoClipBuilder } from "../../hooks/useVideoClipBuilder";
import { ClipBackgroundPicker, ThumbPicker } from "./ClipInputs";

type Clip = ReturnType<typeof useVideoClipBuilder>;
type Source = "picks" | "photo" | "describe" | "video";

const SOURCES: Record<Source, { title: string; text: string; icon: LucideIcon }> = {
  picks: { title: "Pick a place", text: "Choose a location, the weather and the time of day.", icon: MapPin },
  photo: { title: "Your own photo", text: "Upload a photo of the place; your character is put into it.", icon: ImagePlus },
  describe: { title: "Describe it", text: "Write the place in your own words.", icon: PenLine },
  video: { title: "Ready-made video", text: "Put your lyrics on one of our videos. Cheaper and faster.", icon: Film },
};

/** Mutes the element itself (React sets `muted` too late for autoplay) and starts it. */
const startLoop = (el: HTMLVideoElement | null) => {
  if (!el) return;
  el.muted = true;
  el.defaultMuted = true;
  void el.play().catch(() => {});
};

/**
 * The place, as cards: each way of setting it opens its own window. Lip sync: pick /
 * photo / describe; Lyrics: pick / describe / ready-made video. The card in use is marked.
 */
export function PlaceChooser({ clip, scenes }: { clip: Clip; scenes: ClipScenes }) {
  const lipsync = clip.type === "lipsync";
  const sources: Source[] = lipsync ? ["picks", "photo", "describe"] : ["picks", "describe", "video"];
  const active: Source = clip.backgroundVideoId
    ? "video"
    : clip.backgroundImage
      ? "photo"
      : clip.placePrompt
        ? "describe"
        : "picks";
  const [open, setOpen] = useState<Source | null>(null);

  // Each window's "Use this" sets its own way and clears the others.
  const apply = (source: Source, patch: () => void) => {
    if (source !== "photo") clip.set("backgroundImage", null);
    if (source !== "describe") clip.set("placePrompt", "");
    if (source !== "video") clip.set("backgroundVideoId", null);
    patch();
    setOpen(null);
  };

  const find = <T extends { id: string }>(list: T[], id: string) => list.find((o) => o.id === id);
  const location = find(scenes.locations, clip.picks.location);
  const weather = find(scenes.weathers, clip.picks.weather);
  const time = find(scenes.times, clip.picks.time);
  const video = scenes.videos.find((v) => v.id === clip.backgroundVideoId);

  const preview: Record<Source, ReactNode> = {
    picks: (
      <Preview image={location?.thumbnail}>
        {[location?.label, weather?.label, time?.label].filter(Boolean).join(" · ")}
      </Preview>
    ),
    photo: clip.backgroundImage ? <Preview image={clip.backgroundImage}>Your photo</Preview> : null,
    describe: clip.placePrompt ? <Preview quote>{clip.placePrompt}</Preview> : null,
    video: video ? <Preview image={video.thumbnail}>{video.title}</Preview> : null,
  };

  return (
    <>
      <div className={cn("grid gap-4", sources.length === 3 && "lg:grid-cols-3")} role="radiogroup" aria-label="The place">
        {sources.map((source) => {
          const { title, text, icon: Icon } = SOURCES[source];
          const on = active === source;
          return (
            <button
              key={source}
              type="button"
              role="radio"
              aria-checked={on}
              disabled={clip.pending}
              onClick={() => setOpen(source)}
              className={cn(
                "group relative flex flex-col gap-3 overflow-hidden rounded-3xl border p-4 text-left transition-all hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-40",
                on
                  ? "border-primary/60 bg-primary/[0.08] shadow-[0_0_30px_-14px_var(--color-primary)]"
                  : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.05]",
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full border",
                    on ? "border-primary/50 bg-primary/20 text-white" : "border-white/10 bg-black/30 text-white/70",
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-sm font-semibold text-white">{title}</span>
                  <span className="text-xs text-white/45">{text}</span>
                </span>
                {on && (
                  <span className="bg-primary flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                    <Check className="size-3" /> In use
                  </span>
                )}
              </div>
              {preview[source] ?? (
                <span className="flex aspect-video w-full items-center justify-center rounded-2xl border border-dashed border-white/10 text-xs text-white/35">
                  Tap to set it up
                </span>
              )}
            </button>
          );
        })}
      </div>

      <PicksWindow
        open={open === "picks"}
        onClose={() => setOpen(null)}
        clip={clip}
        scenes={scenes}
        onUse={(p) =>
          apply("picks", () => {
            clip.set("location", p.location);
            clip.set("weather", p.weather);
            clip.set("time", p.time);
          })
        }
      />
      <PhotoWindow
        open={open === "photo"}
        onClose={() => setOpen(null)}
        initial={clip.backgroundImage}
        onUse={(url) => apply("photo", () => clip.set("backgroundImage", url))}
      />
      <DescribeWindow
        open={open === "describe"}
        onClose={() => setOpen(null)}
        initial={clip.state.placePrompt ?? ""}
        lyrics={!lipsync}
        onUse={(text) => apply("describe", () => clip.set("placePrompt", text))}
      />
      <VideoWindow
        open={open === "video"}
        onClose={() => setOpen(null)}
        videos={scenes.videos}
        initial={clip.backgroundVideoId}
        onUse={(id) => apply("video", () => clip.set("backgroundVideoId", id))}
      />
    </>
  );
}

/** A card's look at what's set: an image with a caption, or a quoted description. */
function Preview({ image, quote, children }: { image?: string; quote?: boolean; children: ReactNode }) {
  if (quote)
    return (
      <span className="line-clamp-4 flex aspect-video w-full items-center rounded-2xl border border-white/10 bg-black/30 px-4 text-sm leading-relaxed text-white/80 italic">
        “{children}”
      </span>
    );
  return (
    <span className="relative block aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40">
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img loading="lazy" decoding="async" src={image} alt="" className="absolute inset-0 size-full object-cover" />
      )}
      <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/85 to-transparent px-3 pt-6 pb-2 text-sm font-semibold text-white">
        {children}
      </span>
    </span>
  );
}

/** The window around each way: title, its content, Cancel / Use this. */
function Window({
  open,
  onClose,
  title,
  description,
  wide,
  canUse,
  onUse,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  wide?: boolean;
  canUse: boolean;
  onUse: () => void;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className={cn(
          "flex max-h-[90vh] flex-col gap-5 overflow-hidden rounded-3xl border border-white/10 bg-neutral-950 p-6",
          wide ? "sm:max-w-4xl" : "sm:max-w-xl",
        )}
      >
        <div className="flex flex-col gap-1 pr-10">
          <DialogTitle className="text-xl font-bold text-white">{title}</DialogTitle>
          <DialogDescription className="text-sm text-white/50">{description}</DialogDescription>
        </div>
        <div className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1 [scrollbar-width:thin]">{children}</div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl border border-white/10 px-5 text-sm font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onUse}
            disabled={!canUse}
            className="bg-primary hover:bg-primary/90 h-11 rounded-xl px-6 text-sm font-semibold text-white disabled:opacity-40"
          >
            Use this
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PicksWindow({
  open,
  onClose,
  clip,
  scenes,
  onUse,
}: {
  open: boolean;
  onClose: () => void;
  clip: Clip;
  scenes: ClipScenes;
  onUse: (p: { location: string; weather: string; time: string }) => void;
}) {
  const [draft, setDraft] = useState(clip.picks);
  // Start from the current picks each time it opens.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(clip.picks);
  }
  return (
    <Window
      open={open}
      onClose={onClose}
      wide
      title="Pick a place"
      description={
        clip.pickedFromSong ? "Picked from your song's mood. Change any of them." : "Choose a location, the weather and the time of day."
      }
      canUse
      onUse={() => onUse(draft)}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <ThumbPicker label="Location" options={scenes.locations} value={draft.location} onChange={(location) => setDraft((d) => ({ ...d, location }))} />
        <ThumbPicker label="Weather" options={scenes.weathers} value={draft.weather} onChange={(weather) => setDraft((d) => ({ ...d, weather }))} />
        <ThumbPicker label="Time" options={scenes.times} value={draft.time} onChange={(time) => setDraft((d) => ({ ...d, time }))} />
      </div>
    </Window>
  );
}

function PhotoWindow({
  open,
  onClose,
  initial,
  onUse,
}: {
  open: boolean;
  onClose: () => void;
  initial: string | null;
  onUse: (url: string) => void;
}) {
  const [url, setUrl] = useState(initial);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setUrl(initial);
  }
  return (
    <Window
      open={open}
      onClose={onClose}
      title="Your own photo"
      description="A photo of the place. Your character is put into it, with its look, light and weather."
      canUse={!!url}
      onUse={() => url && onUse(url)}
    >
      <ClipBackgroundPicker value={url} onChange={setUrl} />
    </Window>
  );
}

const DESCRIBE_EXAMPLES = [
  "A neon-lit night market in Tokyo after the rain",
  "A quiet library with tall wooden shelves and warm lamps",
  "A rooftop pool in Dubai at golden hour",
];

function DescribeWindow({
  open,
  onClose,
  initial,
  lyrics,
  onUse,
}: {
  open: boolean;
  onClose: () => void;
  initial: string;
  lyrics: boolean;
  onUse: (text: string) => void;
}) {
  const [text, setText] = useState(initial);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setText(initial);
  }
  const max = ArtistVideoClipInputConst.maxPlacePromptLength;
  return (
    <Window
      open={open}
      onClose={onClose}
      title="Describe the place"
      description={
        lyrics
          ? "Say where the video is: the place, the light, what's around. We make a video of it for your lyrics."
          : "Say where your character is: the place, the light, what's around. We make the scene from it."
      }
      canUse={!!text.trim()}
      onUse={() => onUse(text.trim())}
    >
      <div className="flex flex-col gap-3">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={max}
            rows={5}
            autoFocus
            placeholder="e.g. A neon-lit night market in Tokyo after the rain"
            className="focus:border-primary/50 w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3.5 text-[15px] leading-relaxed text-white placeholder:text-white/30 focus:outline-none"
          />
          <span className="pointer-events-none absolute right-3 bottom-3 text-[11px] text-white/35 tabular-nums">
            {text.length}/{max}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {DESCRIBE_EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setText(example)}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/65 transition-colors hover:border-white/25 hover:text-white"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </Window>
  );
}

function VideoWindow({
  open,
  onClose,
  videos,
  initial,
  onUse,
}: {
  open: boolean;
  onClose: () => void;
  videos: ClipBackgroundVideo[];
  initial: string | null;
  onUse: (id: string) => void;
}) {
  const [picked, setPicked] = useState(initial);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setPicked(initial ?? videos[0]?.id ?? null);
  }
  return (
    <Window
      open={open}
      onClose={onClose}
      wide
      title="Ready-made video"
      description="Your lyrics go on this video. Cheaper and faster than making a new one."
      canUse={!!picked}
      onUse={() => picked && onUse(picked)}
    >
      {!videos.length ? (
        <p className="py-10 text-center text-sm text-white/45">No ready-made videos yet. Pick or describe a place instead.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3" role="radiogroup" aria-label="Ready-made videos">
          {videos.map((v) => {
            const on = picked === v.id;
            const tags = [v.location, v.weather, v.time].filter(Boolean).join(" · ");
            return (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setPicked(v.id)}
                className={cn(
                  "group relative aspect-video overflow-hidden rounded-xl border text-left transition-all",
                  on ? "border-primary ring-primary ring-1 shadow-[0_0_16px_-6px_var(--color-primary)]" : "border-white/10 hover:border-white/25",
                )}
              >
                {v.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.thumbnail} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
                ) : (
                  <video
                    src={v.videoUrl}
                    ref={startLoop}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    className="absolute inset-0 size-full object-cover"
                  />
                )}
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-3 pt-6 pb-2">
                  <span className="block truncate text-sm font-semibold text-white">{v.title}</span>
                  {tags && <span className="block truncate text-[11px] text-white/60 capitalize">{tags}</span>}
                </span>
                {on && (
                  <span className="bg-primary absolute top-2 right-2 flex size-6 items-center justify-center rounded-full text-white">
                    <Check className="size-3.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </Window>
  );
}
