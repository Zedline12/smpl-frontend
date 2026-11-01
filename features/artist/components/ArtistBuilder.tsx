"use client";
import { Clock, Gauge, Guitar, Mic, Music2, Plus, Smile } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/providers/AuthProvider";
import ProjectSelector from "@/features/generation/components/prompt/selectors/ProjectSelector";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import { GenerationTypeEnum } from "@/features/generation/types/generation";
import {
  findMusicInputError,
  IMusicV25Input,
  MusicCompositionPlan,
  MusicLimits,
  MusicSection,
  MusicVibe,
} from "@/features/generation/types/models/elevenlabs-music-v2-5.type";
import {
  useGenerateMutation,
  useGenerationCostQuery,
} from "@/features/generation/hooks/generation";
import { useGenerateTemplateMutation } from "@/features/media/hooks/useTemplates";
import { MENU_CONTENT_CLASS } from "@/features/media/components/actions/MediaCardActions";
import {
  useAiGenerationControlStore,
  useAiModelStore,
} from "@/stores/useAiGenerationControlStore";
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
} from "../data/presets";
import {
  createSection,
  DEFAULT_SECTIONS,
  deriveMusicInput,
  formatDuration,
  newSectionId,
  planToSong,
  totalSeconds,
} from "../utils/composition-plan";
import { SectionCard } from "./SectionCard";
import { SongTimeline } from "./SongTimeline";
import { StyleMenuButton } from "./StyleMenuButton";
import { DiscMenuButton } from "./DiscMenuButton";
import { TagInput } from "./TagInput";
import { WriteForMePanel } from "./WriteForMePanel";
import { ArtistTitle } from "./ArtistTitle";

const MODEL = AiModelsEnum.ELEVENLABS_MUSIC_V2_5;

const LENGTH_OPTIONS = LENGTH_PRESETS.map((sec) => ({
  id: String(sec),
  label: sec < 60 ? `${sec} seconds` : formatDuration(sec),
}));

const sectionLabel =
  "text-[11px] font-semibold uppercase tracking-widest text-white/50";

export default function ArtistBuilder() {
  const { user } = useAuth();
  const { projectId, templateMode } = useAiGenerationControlStore();
  const { states, setField } = useAiModelStore();
  const state = states[MODEL] as IMusicV25Input;
  const { mode, prompt, musicLengthMs, vibe, sections } = state;
  const advanced = mode === "plan";

  const { data: cost } = useGenerationCostQuery();
  const generation = useGenerateMutation();
  const templateGeneration = useGenerateTemplateMutation();

  // Every edit goes through here so the fields the API reads stay derived from the editor.
  const update = (patch: Partial<IMusicV25Input>) => {
    const next = deriveMusicInput({ ...state, ...patch });
    (Object.keys(next) as (keyof IMusicV25Input)[]).forEach((key) => {
      if (next[key] !== state[key]) setField(MODEL, key, next[key]);
    });
  };
  const setVibe = (patch: Partial<MusicVibe>) => update({ vibe: { ...vibe, ...patch } });
  const setSections = (next: MusicSection[]) => update({ sections: next });

  const updateSection = (id: string, patch: Partial<MusicSection>) =>
    setSections(sections.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const moveSection = (index: number, direction: -1 | 1) => {
    const next = [...sections];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    setSections(next);
  };
  const duplicateSection = (index: number) =>
    setSections([
      ...sections.slice(0, index + 1),
      { ...sections[index], id: newSectionId() },
      ...sections.slice(index + 1),
    ]);
  const addSection = (typeId: string) => {
    const section = createSection(typeId);
    const remaining = MusicLimits.maxTotalSec - totalSeconds(sections);
    section.durationSec = Math.max(MusicLimits.minChunkSec, Math.min(section.durationSec, remaining));
    setSections([...sections, section]);
  };
  const loadPlan = (plan: MusicCompositionPlan) => {
    const song = planToSong(plan, vibe.vocals);
    // Keep the user's picks; take the draft's shared styles, avoid list and sections.
    update({
      vibe: { ...vibe, extraStyles: song.vibe.extraStyles, avoid: song.vibe.avoid },
      sections: song.sections,
    });
  };

  const totalSec = totalSeconds(sections);
  const canAdd =
    sections.length < MusicLimits.maxChunks &&
    totalSec + MusicLimits.minChunkSec <= MusicLimits.maxTotalSec;
  const inputError = findMusicInputError(state);
  const hasPlanWork = sections.some((s) => s.lyrics.trim());
  const pending = generation.isPending || templateGeneration.isPending;

  const handleGenerate = () => {
    const request = { model: MODEL, mediaType: GenerationTypeEnum.AUDIO, input: state };
    if (templateMode) templateGeneration.mutate(request);
    else generation.mutate({ ...request, projectId });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ArtistTitle>Artist</ArtistTitle>

        <div className={`flex flex-col gap-2 transition-opacity ${advanced ? "opacity-40" : ""}`}>
          <span className={sectionLabel}>Describe your song</span>
          <textarea
            value={prompt}
            onChange={(e) => update({ prompt: e.target.value })}
            disabled={advanced}
            maxLength={MusicLimits.maxPromptLength}
            rows={4}
            placeholder={
              advanced
                ? "Turn off Advanced to describe your song in words"
                : "A cozy late-night rap about driving through the rain"
            }
            className="resize-none rounded-[10px] border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm leading-relaxed text-white placeholder:text-white/30 focus:border-white/25 focus:outline-none disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className={sectionLabel}>Style · optional</span>
          <DiscMenuButton
            icon={Music2}
            label="Genre"
            options={GENRES}
            selected={vibe.genres}
            max={MAX_GENRES}
            onChange={(genres) => setVibe({ genres })}
          />
          <DiscMenuButton
            icon={Smile}
            label="Mood"
            options={MOODS}
            selected={vibe.moods}
            max={MAX_MOODS}
            onChange={(moods) => setVibe({ moods })}
          />
          <StyleMenuButton
            icon={Gauge}
            label="Tempo"
            options={TEMPOS}
            selected={vibe.tempo ? [vibe.tempo] : []}
            max={1}
            onChange={([tempo]) => setVibe({ tempo: tempo ?? null })}
          />
          <StyleMenuButton
            icon={Mic}
            label="Vocals"
            options={VOCALS}
            selected={vibe.vocals ? [vibe.vocals] : []}
            max={1}
            onChange={([vocals]) => setVibe({ vocals: vocals ?? null })}
          />
          <StyleMenuButton
            icon={Guitar}
            label="Background"
            options={INSTRUMENTS}
            selected={vibe.instruments}
            emptyLabel="Any instruments"
            onChange={(instruments) => setVibe({ instruments })}
          />
          {!advanced && (
            <StyleMenuButton
              icon={Clock}
              label="Length"
              options={LENGTH_OPTIONS}
              selected={[String(musicLengthMs / 1000)]}
              max={1}
              onChange={([sec]) => sec && update({ musicLengthMs: Number(sec) * 1000 })}
            />
          )}
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={advanced}
          onClick={() => update({ mode: advanced ? "prompt" : "plan" })}
          className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
            advanced ? "border-primary/40 bg-primary/[0.08]" : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07]"
          }`}
        >
          <span className="flex flex-1 flex-col">
            <span className="text-sm font-medium text-white">Advanced</span>
            <span className="text-[11px] text-white/45">Build the song section by section with lyrics</span>
          </span>
          <span
            className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${advanced ? "bg-primary" : "bg-white/15"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform ${
                advanced ? "translate-x-4" : ""
              }`}
            />
          </span>
        </button>

        {advanced && (
          <>
            <WriteForMePanel hasWork={hasPlanWork} onPlan={loadPlan} />

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

            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className={sectionLabel}>Song structure</span>
                <button
                  type="button"
                  onClick={() => setSections(DEFAULT_SECTIONS())}
                  className="text-[11px] text-white/40 hover:text-white"
                >
                  Reset
                </button>
              </div>
              <SongTimeline sections={sections} />
              {sections.map((section, i) => (
                <SectionCard
                  key={section.id}
                  index={i}
                  section={section}
                  songInstrumental={vibe.vocals === "instrumental"}
                  isFirst={i === 0}
                  isLast={i === sections.length - 1}
                  canDuplicate={canAdd}
                  onChange={(patch) => updateSection(section.id, patch)}
                  onMove={(direction) => moveSection(i, direction)}
                  onDuplicate={() => duplicateSection(i)}
                  onRemove={() => setSections(sections.filter((s) => s.id !== section.id))}
                />
              ))}
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={!canAdd}>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/15 py-2.5 text-sm text-white/60 transition-colors hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Plus className="size-4" /> Add section
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="end" sideOffset={10} className={`${MENU_CONTENT_CLASS} w-48`}>
                  {SECTION_TYPES.map((t) => (
                    <DropdownMenuItem key={t.id} onSelect={() => addSection(t.id)}>
                      {t.label}
                      <span className="ml-auto text-[11px] text-white/40">{t.defaultSec}s</span>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onSelect={() => addSection("custom")}>Custom…</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </section>
          </>
        )}
      </div>

      <div className="flex flex-shrink-0 flex-col gap-2 border-t border-border p-3">
        {inputError && <p className="text-[11px] text-white/45">{inputError}</p>}
        <div className="flex items-center gap-2">
          {user && !templateMode && <ProjectSelector />}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!!inputError || (!templateMode && !projectId) || pending}
            className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: "var(--gradient-create)" }}
          >
            {pending
              ? "Starting…"
              : `${templateMode ? "Create template" : "Create song"} · ${cost?.creditsCost ?? 0} credits`}
          </button>
        </div>
      </div>
    </div>
  );
}
