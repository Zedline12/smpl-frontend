"use client";
import { useEffect, useRef, useState } from "react";
import { Guitar, Music2, Smile } from "lucide-react";
import { MusicLimits } from "@/features/generation/types/models/elevenlabs-music-v2-5.type";
import { cn } from "@/lib/utils";
import {
  GENRES,
  INSTRUMENTS,
  LENGTH_PRESETS,
  MAX_GENRES,
  MAX_MOODS,
  MOODS,
} from "../../data/presets";
import { useSongBuilder } from "../../hooks/useSongBuilder";
import { useCurrentTrack } from "../../stores/useArtistPlayerStore";
import { formatDuration } from "../../utils/composition-plan";
import { DiscMenuButton } from "../DiscMenuButton";
import { Segmented } from "./ChipGroup";
import { Knob } from "./Knob";
import {
  bpmOf,
  nearestLength,
  TEMPO_STEPS,
  VOCAL_OPTIONS,
} from "./SongSettings";
import { GenerateButton } from "./StudioCard";

/**
 * Phones: a small DJ docked at the bottom (like the prompt composer) instead of the
 * settings panel. Same song state as the panel; opens up for vocals and a bigger prompt.
 */
export function MobileDjDock() {
  const song = useSongBuilder();
  const { state, advanced, update, setVibe } = song;
  const { vibe } = state;
  const hasTrack = !!useCurrentTrack();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const tempoIndex = Math.max(0, TEMPO_STEPS.indexOf(vibe.tempo));
  const lengthSec = advanced
    ? song.totalSec
    : LENGTH_PRESETS[nearestLength(state.musicLengthMs / 1000)];

  // Close when tapping outside; the disc menus render in a portal, so they count as inside.
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (ref.current?.contains(target as Node)) return;
      if (target?.closest("[data-radix-popper-content-wrapper]")) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  return (
    <div
      ref={ref}
      onFocus={() => setOpen(true)}
      onClick={() => setOpen(true)}
      className={cn(
        "fixed inset-x-3 z-40 flex flex-col gap-2.5 rounded-2xl border border-white/10 bg-black/60 p-2.5 shadow-xl backdrop-blur-lg transition-[bottom] md:hidden",
        // A clear gap above the screen edge (plus the phone's home-bar area), or above the player.
        hasTrack
          ? "bottom-[6.5rem]"
          : "bottom-[calc(1.5rem+env(safe-area-inset-bottom))]",
      )}
    >
      {/* The DJ: three disc knobs and two dials */}
      <div className="flex items-start justify-between gap-2 overflow-x-auto px-1 [scrollbar-width:none]">
        <DiscMenuButton
          variant="mini"
          icon={Music2}
          label="Genre"
          options={GENRES}
          selected={vibe.genres}
          max={MAX_GENRES}
          onChange={(genres) => setVibe({ genres })}
        />
        <DiscMenuButton
          variant="mini"
          icon={Smile}
          label="Mood"
          options={MOODS}
          selected={vibe.moods}
          max={MAX_MOODS}
          onChange={(moods) => setVibe({ moods })}
        />
        <DiscMenuButton
          variant="mini"
          icon={Guitar}
          label="Background"
          options={INSTRUMENTS}
          selected={vibe.instruments}
          max={INSTRUMENTS.length}
          onChange={(instruments) => setVibe({ instruments })}
        />
        <Knob
          size="sm"
          label="Tempo"
          steps={TEMPO_STEPS.length}
          index={tempoIndex}
          onChange={(i) => setVibe({ tempo: TEMPO_STEPS[i] })}
          display={vibe.tempo ? bpmOf(vibe.tempo).replace(" BPM", "") : "Any"}
          valueText={
            vibe.tempo ? `${vibe.tempo}, ${bpmOf(vibe.tempo)}` : "Any tempo"
          }
        />
        <Knob
          size="sm"
          label="Length"
          steps={LENGTH_PRESETS.length}
          index={nearestLength(lengthSec)}
          onChange={(i) => update({ musicLengthMs: LENGTH_PRESETS[i] * 1000 })}
          display={formatDuration(lengthSec)}
          valueText={formatDuration(lengthSec)}
          disabled={advanced}
        />
      </div>

      {open && (
        <Segmented
          label="Vocals"
          options={VOCAL_OPTIONS}
          value={vibe.vocals ?? "any"}
          onChange={(v) => setVibe({ vocals: v === "any" ? null : v })}
        />
      )}

      <div className="flex items-end gap-2">
        <textarea
          value={state.prompt}
          onChange={(e) => update({ prompt: e.target.value })}
          disabled={advanced}
          maxLength={MusicLimits.maxPromptLength}
          rows={open ? 3 : 1}
          placeholder="Describe your song…"
          aria-label="Describe your song"
          className="focus:border-primary/50 min-h-10 flex-1 resize-none rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:outline-none disabled:cursor-not-allowed"
        />
        <GenerateButton
          compact
          needsProject={!!song.user && !song.templateMode}
          disabled={!song.canGenerate}
          onClick={() => {
            song.generate();
            setOpen(false);
          }}
          label={
            song.pending
              ? "Starting…"
              : song.templateMode
                ? "Create template"
                : "Generate song"
          }
          credits={song.creditsCost}
        />
      </div>
      {open && song.inputError && (
        <p className="px-1 text-xs text-white/45">{song.inputError}</p>
      )}
    </div>
  );
}
