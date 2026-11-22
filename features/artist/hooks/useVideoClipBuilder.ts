"use client";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import { GenerationTypeEnum } from "@/features/generation/types/generation";
import {
  ArtistVideoClipInputConst,
  IArtistVideoClipInput,
} from "@/features/generation/types/models/artist-video-clip.type";
import {
  useGenerateMutation,
  useGenerationCostQuery,
} from "@/features/generation/hooks/generation";
import { useGenerateTemplateMutation } from "@/features/media/hooks/useTemplates";
import {
  useAiGenerationControlStore,
  useAiModelStore,
} from "@/stores/useAiGenerationControlStore";
import { uploadReferenceAudio } from "../api/reference-audio";
import type { AudioWindow } from "../components/AudioWindowPicker";
import { useClipAudioStore } from "../stores/useClipAudioStore";
import { cutToWav, decodeAudio } from "../utils/audio-clip";

export const CLIP_MODEL = AiModelsEnum.SMPL_ARTIST_VIDEO_CLIP;

const { minSeconds, maxSeconds } = ArtistVideoClipInputConst;
/** The clip length for a song part: whole seconds within 4-30 (also what's priced). */
export const clipSeconds = (sec: number) =>
  Math.min(maxSeconds, Math.max(minSeconds, Math.round(sec)));

/** Everything the video clip inputs need (desktop panel and phone dock share it). */
export function useVideoClipBuilder() {
  const { user } = useAuth();
  const { projectId, templateMode } = useAiGenerationControlStore();
  const { states, setField } = useAiModelStore();
  const state = states[CLIP_MODEL] as IArtistVideoClipInput;
  const set = <K extends keyof IArtistVideoClipInput>(
    key: K,
    value: IArtistVideoClipInput[K],
  ) => setField(CLIP_MODEL, key, value);

  const { audio, setAudio, preparing, setPreparing } = useClipAudioStore();
  const { data: cost } = useGenerationCostQuery();
  const generation = useGenerateMutation();
  const templateGeneration = useGenerateTemplateMutation();

  // The clip is as long as the chosen song part (that's also what's priced).
  const changeAudio = (next: AudioWindow | null) => {
    setAudio(next);
    if (next) {
      const duration = clipSeconds(next.lengthSec);
      if (duration !== state.duration) set("duration", duration);
    }
  };

  // Saved states from before the scene option have none: the Song scene, no lyrics.
  const scene = state.scene ?? "song";
  const lyrics = !!state.lyrics;
  const missing = !state.images.length
    ? "Add your character"
    : !audio
      ? "Choose part of a song"
      : scene === "song" && !state.style
        ? "Pick a style for the clip"
        : null;
  const pending =
    preparing || generation.isPending || templateGeneration.isPending;
  const canGenerate = !missing && (templateMode || !!projectId) && !pending;

  const generate = async () => {
    if (!audio || missing) return;
    setPreparing(true);
    let audioUrl: string;
    try {
      const buffer = await decodeAudio(audio.source.url);
      const wav = cutToWav(
        buffer,
        audio.startSec,
        audio.startSec + audio.lengthSec,
      );
      audioUrl = await uploadReferenceAudio(wav);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Couldn't prepare the song part",
      );
      return;
    } finally {
      setPreparing(false);
    }
    // The original photo is animated as is: no style or prompt goes with it.
    const input: IArtistVideoClipInput = {
      ...state,
      scene,
      lyrics,
      prompt: scene === "song" ? state.prompt.trim() : "",
      style: scene === "song" ? state.style : null,
      duration: clipSeconds(audio.lengthSec),
      audioUrl,
    };
    const request = {
      model: CLIP_MODEL,
      mediaType: GenerationTypeEnum.VIDEO,
      input,
    };
    if (templateMode) templateGeneration.mutate(request);
    else generation.mutate({ ...request, projectId });
  };

  return {
    user,
    templateMode,
    state,
    set,
    scene,
    lyrics,
    audio,
    changeAudio,
    missing,
    preparing,
    pending,
    canGenerate,
    creditsCost: cost?.creditsCost ?? 0,
    generate,
    label: preparing
      ? "Preparing song…"
      : pending
        ? "Starting…"
        : templateMode
          ? "Create template"
          : "Make video clip",
  };
}
