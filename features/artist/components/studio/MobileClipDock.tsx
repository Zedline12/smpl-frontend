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
import { ClipCharacterPicker, ClipStylePicker } from "./ClipInputs";
import { GenerateButton } from "./StudioCard";

/**
 * Phones: the video clip inputs docked at the bottom, like the song DJ (MobileDjDock).
 * Collapsed: styles, character, song chip, prompt and Generate; open: the song picker too.
 */
export function MobileClipDock() {
  const clip = useVideoClipBuilder();
  const { state, set, audio } = clip;
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
    ? `${formatDuration(audio.startSec)}–${formatDuration(audio.startSec + audio.lengthSec)} · ${clipSeconds(audio.lengthSec)}s`
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

      <ClipStylePicker compact value={state.style} onChange={(style) => set("style", style)} disabled={clip.pending} />

      <div className="flex items-center gap-2">
        <ClipCharacterPicker
          compact
          images={state.images}
          onChange={(images) => set("images", images)}
          disabled={clip.pending}
        />
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
          <AudioWindowPicker value={audio} onChange={clip.changeAudio} disabled={clip.pending} />
        </div>
      )}

      <div className="flex items-end gap-2">
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
