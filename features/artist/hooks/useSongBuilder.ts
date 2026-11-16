"use client";
import { useAuth } from "@/providers/AuthProvider";
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
import {
  useAiGenerationControlStore,
  useAiModelStore,
} from "@/stores/useAiGenerationControlStore";
import {
  createSection,
  deriveMusicInput,
  newSectionId,
  planToSong,
  totalSeconds,
} from "../utils/composition-plan";

export const SONG_MODEL = AiModelsEnum.ELEVENLABS_MUSIC_V2_5;

/** Everything the song settings need: the model's state, edits and Generate. */
export function useSongBuilder() {
  const { user } = useAuth();
  const { projectId, templateMode } = useAiGenerationControlStore();
  const { states, setField } = useAiModelStore();
  const state = states[SONG_MODEL] as IMusicV25Input;
  const { vibe, sections } = state;
  const advanced = state.mode === "plan";

  const { data: cost } = useGenerationCostQuery();
  const generation = useGenerateMutation();
  const templateGeneration = useGenerateTemplateMutation();

  // Every edit goes through here so the fields the API reads stay derived from the editor.
  const update = (patch: Partial<IMusicV25Input>) => {
    const next = deriveMusicInput({ ...state, ...patch });
    (Object.keys(next) as (keyof IMusicV25Input)[]).forEach((key) => {
      if (next[key] !== state[key]) setField(SONG_MODEL, key, next[key]);
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
  const removeSection = (id: string) => setSections(sections.filter((s) => s.id !== id));
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
  const pending = generation.isPending || templateGeneration.isPending;
  const canGenerate = !inputError && (templateMode || !!projectId) && !pending;

  const generate = () => {
    const request = { model: SONG_MODEL, mediaType: GenerationTypeEnum.AUDIO, input: state };
    if (templateMode) templateGeneration.mutate(request);
    else generation.mutate({ ...request, projectId });
  };

  return {
    user,
    templateMode,
    state,
    advanced,
    update,
    setVibe,
    setSections,
    updateSection,
    moveSection,
    duplicateSection,
    removeSection,
    addSection,
    loadPlan,
    totalSec,
    canAdd,
    inputError,
    hasPlanWork: sections.some((s) => s.lyrics.trim()),
    pending,
    canGenerate,
    creditsCost: cost?.creditsCost ?? 0,
    generate,
  };
}
