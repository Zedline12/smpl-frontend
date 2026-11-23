"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronUp, Music2 } from "lucide-react";
import { ArtistVideoClipInputConst } from "@/features/generation/types/models/artist-video-clip.type";
import { cn } from "@/lib/utils";
import { clipSeconds, useVideoClipBuilder } from "../../hooks/useVideoClipBuilder";
import { useCurrentTrack } from "../../stores/useArtistPlayerStore";
import { formatDuration } from "../../utils/composition-plan";
import { AudioWindowPicker } from "../AudioWindowPicker";
import { ArtistModeSwitch } from "./ArtistModeSwitch";
import { useClipScenes } from "../../api/clip-scenes";
import {
  BACKGROUND_SET_HINT,
  CLIP_LYRICS_OPTIONS,
  CLIP_LYRICS_POSITION_OPTIONS,
  CLIP_SCENE_OPTIONS,
  CLIP_TYPE_OPTIONS,
  ClipBackgroundPicker,
  ClipCharacterPicker,
  ClipFontPicker,
  ClipMoodPicker,
  ORIGINAL_PHOTO_HINT,
  ThumbPicker,
} from "./ClipInputs";
import { GenerateButton } from "./StudioCard";

/** A small labelled one-of rail for the dock (Scene, Lyrics). */
function MiniRail<Id extends string>({
  label,
  options,
  value,
  onChange,
  disabled,
}: {
  label: string;
  options: { id: Id; label: string }[];
  value: Id;
  onChange: (id: Id) => void;
  disabled?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">{label}</span>
      <div className="flex gap-0.5 rounded-xl border border-white/10 bg-black/40 p-0.5">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={value === o.id}
            disabled={disabled}
            onClick={() => onChange(o.id)}
            className={cn(
              "h-8 min-w-0 flex-1 truncate rounded-lg px-1.5 text-[11px] font-semibold transition-colors disabled:opacity-40",
              value === o.id ? "bg-primary/30 text-white" : "text-white/60",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Phones: the video clip inputs docked at the bottom, like the song DJ (MobileDjDock).
 * Collapsed: type and lyrics, scene, the place picks and mood, character / background,
 * song chip, prompt and Generate; open: the song picker too. The original photo needs no
 * picks or prompt; a background image replaces Location, Weather and Time.
 */
export function MobileClipDock() {
  const clip = useVideoClipBuilder();
  const { state, set, audio, picks } = clip;
  const lipsync = clip.type === "lipsync";
  const bgSet = !!clip.backgroundImage;
  // Mood and prompt direct a generated scene (Lyrics, or lip sync's Song scene).
  const generated = clip.usesScene;
  const scenes = useClipScenes();
  const hasTrack = !!useCurrentTrack();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close when tapping outside; dialogs and menus render in portals, so they count as inside.
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (ref.current?.contains(target as Node)) return;
      if (target?.closest("[data-radix-popper-content-wrapper], [role='dialog']")) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  const songLabel = audio
    ? `${formatDuration(audio.startSec)}–${formatDuration(audio.startSec + audio.lengthSec)} · ${clipSeconds(audio.lengthSec, clip.maxClipSeconds)}s`
    : "Choose a song part";

  return (
    <div
      ref={ref}
      className={cn(
        "fixed inset-x-3 z-40 flex max-h-[78dvh] flex-col gap-2.5 overflow-y-auto rounded-2xl border border-white/10 bg-black/60 p-2.5 shadow-xl backdrop-blur-lg [scrollbar-width:none] transition-[bottom] md:hidden",
        hasTrack ? "bottom-[6.5rem]" : "bottom-[calc(1.5rem+env(safe-area-inset-bottom))]",
      )}
    >
      <ArtistModeSwitch compact />

      <div className="flex gap-2">
        <MiniRail
          label="Type"
          options={CLIP_TYPE_OPTIONS}
          value={clip.type}
          onChange={(type) => set("type", type)}
          disabled={clip.pending}
        />
        {lipsync ? (
          <MiniRail
            label="Lyrics"
            options={CLIP_LYRICS_OPTIONS}
            value={clip.lyrics ? "on" : "off"}
            onChange={(v) => set("lyrics", v === "on")}
            disabled={clip.pending}
          />
        ) : (
          <MiniRail
            label="Lyrics"
            options={CLIP_LYRICS_POSITION_OPTIONS}
            value={clip.lyricsPosition}
            onChange={(position) => set("lyricsPosition", position)}
            disabled={clip.pending}
          />
        )}
      </div>

      {(lipsync || clip.type === "lyrics") && (
        <div className="flex items-end gap-2">
          {lipsync && (
            <MiniRail
              label="Scene"
              options={CLIP_SCENE_OPTIONS}
              value={clip.scene}
              onChange={(scene) => set("scene", scene)}
              disabled={clip.pending}
            />
          )}
          {(!lipsync || clip.lyrics) && (
            <ClipFontPicker
              compact
              value={clip.lyricsFont}
              onChange={(f) => set("lyricsFont", f)}
              disabled={clip.pending}
            />
          )}
        </div>
      )}

      {clip.usesScene ? (
        <>
          <div className="flex items-start gap-2">
            <ThumbPicker
              variant="menu"
              label="Location"
              options={scenes.locations}
              value={picks.location}
              onChange={(v) => set("location", v)}
              disabled={clip.pending || bgSet}
            />
            <ThumbPicker
              variant="menu"
              label="Weather"
              options={scenes.weathers}
              value={picks.weather}
              onChange={(v) => set("weather", v)}
              disabled={clip.pending || bgSet}
            />
            <ThumbPicker
              variant="menu"
              label="Time"
              options={scenes.times}
              value={picks.time}
              onChange={(v) => set("time", v)}
              disabled={clip.pending || bgSet}
            />
            {generated && (
              <ClipMoodPicker
                compact
                value={picks.mood}
                onChange={(mood) => set("mood", mood)}
                disabled={clip.pending}
              />
            )}
          </div>
          {bgSet && <p className="px-1 text-xs text-white/45">{BACKGROUND_SET_HINT}</p>}
        </>
      ) : (
        <p className="px-1 text-xs text-white/45">{ORIGINAL_PHOTO_HINT}</p>
      )}

      <div className="flex items-center gap-2">
        {lipsync && (
          <ClipCharacterPicker
            compact
            images={state.images}
            onChange={(images) => set("images", images)}
            disabled={clip.pending}
          />
        )}
        {clip.usesBackground && (
          <ClipBackgroundPicker
            compact
            value={clip.backgroundImage}
            onChange={(url) => set("backgroundImage", url)}
            disabled={clip.pending}
          />
        )}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl border px-3 text-left text-sm transition-colors",
            audio ? "border-primary/40 bg-primary/10 text-white" : "border-white/10 bg-black/40 text-white/60",
          )}
          aria-expanded={open}
        >
          <Music2 className="size-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate">{songLabel}</span>
          <ChevronUp className={cn("size-4 shrink-0 transition-transform", !open && "rotate-180")} />
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-3 rounded-xl border border-white/[0.07] bg-black/30 p-2.5">
          <AudioWindowPicker
            value={audio}
            onChange={clip.changeAudio}
            disabled={clip.pending}
            maxSeconds={clip.maxClipSeconds}
            compact
          />
        </div>
      )}

      <div className={cn("flex items-end gap-2", !generated && "justify-end")}>
        {generated && (
          <textarea
            value={state.prompt}
            onChange={(e) => set("prompt", e.target.value)}
            onFocus={() => setOpen(true)}
            maxLength={ArtistVideoClipInputConst.maxPromptLength}
            rows={open ? 2 : 1}
            placeholder="Add a prompt (optional)…"
            aria-label="Your prompt, optional"
            className="focus:border-primary/50 min-h-10 flex-1 resize-none rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:outline-none"
          />
        )}
        <GenerateButton
          compact
          needsProject={!!clip.user && !clip.templateMode}
          disabled={!clip.canGenerate}
          onClick={() => {
            void clip.generate();
            setOpen(false);
          }}
          label={clip.label}
          credits={clip.creditsCost}
        />
      </div>
      {clip.missing && <p className="px-1 text-xs text-white/45">{clip.missing}</p>}
    </div>
  );
}
