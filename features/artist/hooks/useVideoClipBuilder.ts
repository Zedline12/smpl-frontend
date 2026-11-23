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
import { sceneFromSong, UPLOAD_SCENE_DEFAULTS } from "../data/clip-scene";
import { useClipAudioStore } from "../stores/useClipAudioStore";
import { cutToWav, decodeAudio } from "../utils/audio-clip";

export const CLIP_MODEL = AiModelsEnum.SMPL_ARTIST_VIDEO_CLIP;

const { minSeconds, maxSeconds, lyricsMaxSeconds } = ArtistVideoClipInputConst;
/** The longest song part per clip type: a lyrics video is one Kling clip (15 s at most). */
export const clipMaxSeconds = (type: IArtistVideoClipInput["type"] | undefined) =>
  type === "lyrics" ? lyricsMaxSeconds : maxSeconds;
/** The clip length for a song part: whole seconds within 4 and the type's limit (also what's priced). */
export const clipSeconds = (sec: number, max: number = maxSeconds) =>
  Math.min(max, Math.max(minSeconds, Math.round(sec)));

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

  // The clip is as long as the chosen song part (that's also what's priced). A new song
  // sets the scene picks: from its mood and sounds, or the upload defaults.
  const changeAudio = (next: AudioWindow | null) => {
    const newSong = !!next && next.source.url !== audio?.source.url;
    setAudio(next);
    if (next) {
      const duration = clipSeconds(next.lengthSec, clipMaxSeconds(state.type));
      if (duration !== state.duration) set("duration", duration);
    }
    if (newSong) {
      const fromSong = sceneFromSong(next.source.song);
      (Object.keys(fromSong) as (keyof typeof fromSong)[]).forEach((key) => {
        if (state[key] !== fromSong[key]) set(key, fromSong[key]);
      });
    }
  };

  // Saved states from before these options have none: lip sync, the Song scene, no lyrics.
  const type = state.type ?? "lipsync";
  const scene = state.scene ?? "song";
  const lyrics = state.lyrics ?? true;
  const lyricsPosition = state.lyricsPosition ?? "center";
  const lyricsFont = state.lyricsFont ?? "anton";
  const lyricsSize = state.lyricsSize ?? "medium";
  const lyricsOpacity = state.lyricsOpacity ?? ArtistVideoClipInputConst.lyricsOpacity.default;
  const backgroundDim =
    state.backgroundDim ??
    (type === "lyrics"
      ? ArtistVideoClipInputConst.backgroundDim.lyricsDefault
      : ArtistVideoClipInputConst.backgroundDim.lipsyncDefault);
  const maxClipSeconds = clipMaxSeconds(type);
  const backgroundImage = state.backgroundImage || null;
  /** Lyrics type: a ready-made background video instead of the picks. */
  const backgroundVideoId = type === "lyrics" ? state.backgroundVideoId || null : null;
  /** The place in the user's own words (replaces the picks); not with a photo or a ready-made video. */
  const placePrompt =
    (type === "lyrics" || scene === "song") && !backgroundVideoId && !(type === "lipsync" && backgroundImage)
      ? (state.placePrompt ?? "").trim()
      : "";
  const picks = {
    location: state.location ?? UPLOAD_SCENE_DEFAULTS.location,
    weather: state.weather ?? UPLOAD_SCENE_DEFAULTS.weather,
    time: state.time ?? UPLOAD_SCENE_DEFAULTS.time,
    mood: state.mood ?? UPLOAD_SCENE_DEFAULTS.mood,
  };
  /** The scene picks matter: Lyrics, or lip sync's Song scene. */
  const usesScene = type === "lyrics" || scene === "song";
  /** Only lip sync's Song scene takes a background image (a lyrics video is text-to-video). */
  const usesBackground = type === "lipsync" && scene === "song";
  const missing =
    type === "lipsync" && !state.images.length
      ? "Add your character"
      : !audio
        ? "Choose part of a song"
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
    // The original photo is animated as is: no prompt or background goes with it. A
    // lyric video has no character or background image and always has lyrics.
    const lyricsType = type === "lyrics";
    const input: IArtistVideoClipInput = {
      ...state,
      ...picks,
      type,
      scene,
      lyrics: lyricsType || lyrics,
      lyricsPosition,
      lyricsFont,
      lyricsSize,
      lyricsOpacity,
      backgroundDim,
      images: lyricsType ? [] : state.images,
      prompt: usesScene && !backgroundVideoId ? state.prompt.trim() : "",
      backgroundVideoId,
      placePrompt,
      backgroundImage: usesBackground ? backgroundImage : null,
      duration: clipSeconds(audio.lengthSec, maxClipSeconds),
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
    type,
    scene,
    lyrics,
    lyricsPosition,
    lyricsFont,
    lyricsSize,
    lyricsOpacity,
    backgroundDim,
    maxClipSeconds,
    /** The background image, where it's used (lip sync's Song scene). */
    backgroundImage: usesBackground ? backgroundImage : null,
    picks,
    backgroundVideoId,
    placePrompt,
    usesScene,
    usesBackground,
    /** The picks came from the chosen song's mood (not the upload defaults). */
    pickedFromSong: !!audio?.source.song?.moods.length,
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
          : type === "lyrics"
            ? "Make lyrics video"
            : "Make video clip",
  };
}
