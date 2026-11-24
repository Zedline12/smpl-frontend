"use client";
import { useSyncExternalStore } from "react";
import { ChevronDown, Guitar, Mic, Music2, Plus, Smile } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MusicLimits,
  Tempo,
  Vocals,
} from "@/features/generation/types/models/elevenlabs-music-v2-5.type";
import { MENU_CONTENT_CLASS } from "@/features/media/components/actions/MediaCardActions";
import {
  GENRES,
  INSTRUMENTS,
  LENGTH_PRESETS,
  MAX_GENRES,
  MAX_MOODS,
  MOODS,
  SECTION_TYPES,
  TEMPOS,
  VOCALS,
} from "../../data/presets";
import { DEFAULT_SECTIONS, formatDuration } from "../../utils/composition-plan";
import { useSongBuilder } from "../../hooks/useSongBuilder";
import { SectionCard } from "../SectionCard";
import { SongTimeline } from "../SongTimeline";
import { TagInput } from "../TagInput";
import { WriteForMePanel } from "../WriteForMePanel";
import { Segmented, studioLabel } from "./ChipGroup";
import { DiscMenuButton } from "../DiscMenuButton";
import { Knob } from "./Knob";
import { GenerateButton, StudioCard } from "./StudioCard";

/** The Advanced (section-by-section) switch is hidden for now; flip to bring it back. */
const SHOW_ADVANCED_SWITCH = false;

export const TEMPO_STEPS: (Tempo | null)[] = [null, ...TEMPOS.map((t) => t.id)];
export const VOCAL_OPTIONS: { id: Vocals | "any"; label: string }[] = [
  { id: "any", label: "Any" },
  ...VOCALS,
];

const PHONE = "(max-width: 767px)";
function subscribePhone(cb: () => void) {
  const mq = window.matchMedia(PHONE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
/** True below the md breakpoint (phones). */
const useIsPhone = () => useSyncExternalStore(subscribePhone, () => window.matchMedia(PHONE).matches, () => false);

type VocalId = (typeof VOCAL_OPTIONS)[number]["id"];

/** Vocals as one select-style button with a menu (phones). */
function VocalsSelect({ value, onChange }: { value: VocalId; onChange: (v: VocalId) => void }) {
  const current = VOCAL_OPTIONS.find((o) => o.id === value) ?? VOCAL_OPTIONS[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Vocals: ${current.label}`}
          className="flex h-11 w-full items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white"
        >
          <Mic className="size-4 shrink-0 text-white/55" />
          <span className={studioLabel}>Vocals</span>
          <span className="ml-auto truncate font-semibold">{current.label}</span>
          <ChevronDown className="size-4 shrink-0 text-white/50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className={MENU_CONTENT_CLASS}>
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as VocalId)}>
          {VOCAL_OPTIONS.map((o) => (
            <DropdownMenuRadioItem key={o.id} value={o.id}>
              {o.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** "70-85 bpm" → "70–85 BPM" (the tempo preset's range). */
export const bpmOf = (tempo: Tempo) => {
  const range = TEMPOS.find((t) => t.id === tempo)?.styles.find((s) =>
    s.includes("bpm"),
  );
  return range ? range.replace("-", "–").replace("bpm", "BPM") : "";
};

export const nearestLength = (sec: number) =>
  LENGTH_PRESETS.reduce(
    (best, s, i) =>
      Math.abs(s - sec) < Math.abs(LENGTH_PRESETS[best] - sec) ? i : best,
    0,
  );

/** Create song: describe · style chips · knobs and Generate, plus the section editor in Advanced. */
export function SongSettings() {
  const song = useSongBuilder();
  const { state, advanced, update, setVibe } = song;
  const { vibe, sections } = state;
  const tempoIndex = TEMPO_STEPS.indexOf(vibe.tempo);
  const lengthIndex = nearestLength(state.musicLengthMs / 1000);
  const phone = useIsPhone();
  const knobSize = phone ? "sm" : "md";

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1.35fr_1fr]">
        {/* Describe */}
        <StudioCard className="gap-4 md:col-span-2 xl:col-span-1">
          <div
            className={`flex flex-1 flex-col gap-2.5 transition-opacity ${advanced ? "opacity-40" : ""}`}
          >
            <span className={studioLabel}>Describe your song</span>
            <textarea
              value={state.prompt}
              onChange={(e) => update({ prompt: e.target.value })}
              disabled={advanced}
              maxLength={MusicLimits.maxPromptLength}
              rows={phone ? 2 : 5}
              placeholder={
                advanced
                  ? "Turn off Advanced to describe your song in words"
                  : "A cozy late-night rap about driving through the rain"
              }
              className="min-h-20 flex-1 md:min-h-36 resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3.5 text-[15px] leading-relaxed text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none disabled:cursor-not-allowed"
            />
          </div>
          {SHOW_ADVANCED_SWITCH && (
            <button
              type="button"
              role="switch"
              aria-checked={advanced}
              onClick={() => update({ mode: advanced ? "prompt" : "plan" })}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors ${
                advanced
                  ? "border-primary/40 bg-primary/[0.1]"
                  : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07]"
              }`}
            >
              <span className="flex flex-1 flex-col">
                <span className="text-[15px] font-semibold text-white">
                  Advanced
                </span>
                <span className="text-xs text-white/50">
                  Build the song section by section with lyrics
                </span>
              </span>
              <span
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${advanced ? "bg-primary" : "bg-white/15"}`}
              >
                <span
                  className={`absolute top-1 left-1 size-4 rounded-full bg-white shadow transition-transform ${advanced ? "translate-x-5" : ""}`}
                />
              </span>
            </button>
          )}
        </StudioCard>

        {/* Style */}
        <StudioCard className="gap-5">
          <div className="grid grid-cols-3 justify-items-center gap-3 py-2 sm:gap-5">
            <DiscMenuButton
              variant="knob"
              icon={Music2}
              label="Genre"
              options={GENRES}
              selected={vibe.genres}
              max={MAX_GENRES}
              onChange={(genres) => setVibe({ genres })}
            />
            <DiscMenuButton
              variant="knob"
              icon={Smile}
              label="Mood"
              options={MOODS}
              selected={vibe.moods}
              max={MAX_MOODS}
              onChange={(moods) => setVibe({ moods })}
            />
            <DiscMenuButton
              variant="knob"
              icon={Guitar}
              label="Background"
              options={INSTRUMENTS}
              selected={vibe.instruments}
              max={INSTRUMENTS.length}
              onChange={(instruments) => setVibe({ instruments })}
            />
          </div>
          {phone ? (
            <VocalsSelect value={vibe.vocals ?? "any"} onChange={(v) => setVibe({ vocals: v === "any" ? null : v })} />
          ) : (
            <Segmented
              label="Vocals"
              options={VOCAL_OPTIONS}
              value={vibe.vocals ?? "any"}
              onChange={(v) => setVibe({ vocals: v === "any" ? null : v })}
            />
          )}
        </StudioCard>

        {/* Knobs + Generate */}
        <StudioCard className="gap-5">
          <div className="grid grid-cols-2 justify-items-center gap-3 md:gap-5">
            <Knob
              size={knobSize}
              label="Tempo"
              steps={TEMPO_STEPS.length}
              index={tempoIndex < 0 ? 0 : tempoIndex}
              onChange={(i) => setVibe({ tempo: TEMPO_STEPS[i] })}
              display={vibe.tempo ? bpmOf(vibe.tempo) : "Any"}
              valueText={
                vibe.tempo ? `${vibe.tempo}, ${bpmOf(vibe.tempo)}` : "Any tempo"
              }
              hint={
                vibe.tempo
                  ? TEMPOS.find((t) => t.id === vibe.tempo)?.label
                  : "Any tempo"
              }
            />
            {advanced ? (
              <Knob
                size={knobSize}
                label="Length"
                steps={LENGTH_PRESETS.length}
                index={nearestLength(song.totalSec)}
                onChange={() => undefined}
                display={formatDuration(song.totalSec)}
                valueText={formatDuration(song.totalSec)}
                hint="Set by your sections"
                disabled
              />
            ) : (
              <Knob
                size={knobSize}
                label="Length"
                steps={LENGTH_PRESETS.length}
                index={lengthIndex}
                onChange={(i) =>
                  update({ musicLengthMs: LENGTH_PRESETS[i] * 1000 })
                }
                display={formatDuration(LENGTH_PRESETS[lengthIndex])}
                valueText={formatDuration(LENGTH_PRESETS[lengthIndex])}
              />
            )}
          </div>

          <GenerateButton
            className="mt-auto"
            needsProject={!!song.user && !song.templateMode}
            hint={song.inputError}
            disabled={!song.canGenerate}
            onClick={song.generate}
            label={
              song.pending
                ? "Starting…"
                : song.templateMode
                  ? "Create template"
                  : "Generate song"
            }
            credits={song.creditsCost}
          />
        </StudioCard>
      </div>

      {advanced && (
        <StudioCard className="gap-5 lg:grid lg:grid-cols-[1fr_2fr]">
          <div className="flex flex-col gap-4">
            <WriteForMePanel
              hasWork={song.hasPlanWork}
              onPlan={song.loadPlan}
            />
            <TagInput
              label="More styles"
              value={vibe.extraStyles}
              onChange={(extraStyles) => setVibe({ extraStyles })}
              placeholder="e.g. 90s, vinyl warmth, stadium"
            />
            <TagInput
              label="Avoid"
              value={vibe.avoid}
              onChange={(avoid) => setVibe({ avoid })}
              placeholder="e.g. autotune, heavy reverb"
            />
          </div>

          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className={studioLabel}>Song structure</span>
              <button
                type="button"
                onClick={() => song.setSections(DEFAULT_SECTIONS())}
                className="text-xs text-white/40 hover:text-white"
              >
                Reset
              </button>
            </div>
            <SongTimeline sections={sections} />
            <div className="grid gap-3 md:grid-cols-2">
              {sections.map((section, i) => (
                <SectionCard
                  key={section.id}
                  index={i}
                  section={section}
                  songInstrumental={vibe.vocals === "instrumental"}
                  isFirst={i === 0}
                  isLast={i === sections.length - 1}
                  canDuplicate={song.canAdd}
                  onChange={(patch) => song.updateSection(section.id, patch)}
                  onMove={(direction) => song.moveSection(i, direction)}
                  onDuplicate={() => song.duplicateSection(i)}
                  onRemove={() => song.removeSection(section.id)}
                />
              ))}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={!song.canAdd}>
                <button
                  type="button"
                  className="flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-white/15 py-3 text-sm text-white/60 transition-colors hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="size-4" /> Add section
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="center"
                sideOffset={8}
                className={`${MENU_CONTENT_CLASS} w-48`}
              >
                {SECTION_TYPES.map((t) => (
                  <DropdownMenuItem
                    key={t.id}
                    onSelect={() => song.addSection(t.id)}
                  >
                    {t.label}
                    <span className="ml-auto text-[11px] text-white/40">
                      {t.defaultSec}s
                    </span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onSelect={() => song.addSection("custom")}>
                  Custom…
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </section>
        </StudioCard>
      )}
    </div>
  );
}
