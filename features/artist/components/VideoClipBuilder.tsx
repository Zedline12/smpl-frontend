"use client";
import { useState } from "react";
import { Monitor, RectangleHorizontal } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";
import { SingleMediaSlot } from "@/components/CreateSidebar";
import { MediaManagerDialog } from "@/features/generation/components/prompt/MediaManagerDialog";
import ProjectSelector from "@/features/generation/components/prompt/selectors/ProjectSelector";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import { GenerationTypeEnum } from "@/features/generation/types/generation";
import {
  ISeedance25RefToVideoInput,
  Seedance25RefDuration,
  Seedance25RefInputConst,
  Seedance25RefLimits,
} from "@/features/generation/types/models/seedance-2.5-ref-to-video.type";
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
import { cutToWav, decodeAudio, readVideoDuration } from "../utils/audio-clip";
import { ArtistTitle } from "./ArtistTitle";
import { AudioWindow, AudioWindowPicker } from "./AudioWindowPicker";
import { StyleMenuButton } from "./StyleMenuButton";

const MODEL = AiModelsEnum.SEEDANCE_2_5_REF_TO_VIDEO;

const sectionLabel =
  "text-[11px] font-semibold uppercase tracking-widest text-white/50";

const RESOLUTION_OPTIONS = Seedance25RefInputConst.resolution.map((id) => ({ id, label: id }));
const ASPECT_OPTIONS = Seedance25RefInputConst.aspectRatio.map((id) => ({
  id,
  label: id === "auto" ? "Auto" : id,
}));

const toDuration = (sec: number) =>
  Math.min(
    Seedance25RefLimits.maxDurationSec,
    Math.max(Seedance25RefLimits.minDurationSec, Math.round(sec)),
  ) as Seedance25RefDuration;

export default function VideoClipBuilder() {
  const { user } = useAuth();
  const { projectId, templateMode } = useAiGenerationControlStore();
  const { states, setField } = useAiModelStore();
  const state = states[MODEL] as ISeedance25RefToVideoInput;
  const set = <K extends keyof ISeedance25RefToVideoInput>(key: K, value: ISeedance25RefToVideoInput[K]) =>
    setField(MODEL, key, value);

  const [dialog, setDialog] = useState<"image" | "video" | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [audio, setAudio] = useState<AudioWindow | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: cost } = useGenerationCostQuery();
  const generation = useGenerateMutation();
  const templateGeneration = useGenerateTemplateMutation();

  const image = state.images[0];
  const video = state.videos[0];

  // The clip is as long as the chosen part of the song (that's also what's priced).
  const handleAudioChange = (next: AudioWindow | null) => {
    setAudio(next);
    if (next) {
      const duration = toDuration(next.lengthSec);
      if (duration !== state.duration) set("duration", duration);
    }
  };

  const handleVideo = async (url: string | undefined) => {
    setDialog(null);
    if (!url) return;
    const seconds = await readVideoDuration(url);
    const { minReferenceSec, maxReferenceSec } = Seedance25RefLimits;
    if (seconds !== null && (seconds < minReferenceSec || seconds > maxReferenceSec + 0.2)) {
      setVideoError(`Reference video must be ${minReferenceSec}–${maxReferenceSec} seconds (this one is ${Math.round(seconds)}s).`);
      return;
    }
    setVideoError(null);
    set("videos", [url]);
  };

  const missing = !image
    ? "Add a character image"
    : !video
      ? "Add a reference video"
      : !audio
        ? "Choose the audio for your clip"
        : null;
  const pending = uploading || generation.isPending || templateGeneration.isPending;

  const handleGenerate = async () => {
    if (!audio || missing) return;
    setUploading(true);
    let audioUrl: string;
    try {
      const buffer = await decodeAudio(audio.source.url);
      const wav = cutToWav(buffer, audio.startSec, audio.startSec + audio.lengthSec);
      audioUrl = await uploadReferenceAudio(wav);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't prepare the audio");
      return;
    } finally {
      setUploading(false);
    }
    const input: ISeedance25RefToVideoInput = {
      ...state,
      duration: toDuration(audio.lengthSec),
      audios: [audioUrl],
    };
    const request = { model: MODEL, mediaType: GenerationTypeEnum.VIDEO, input };
    if (templateMode) templateGeneration.mutate(request);
    else generation.mutate({ ...request, projectId });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ArtistTitle>Video clip</ArtistTitle>

        <SingleMediaSlot
          label="Character"
          type="image"
          url={image}
          onOpenPicker={() => setDialog("image")}
          onClear={() => set("images", [])}
        />

        <div className="flex flex-col gap-1">
          <SingleMediaSlot
            label="Reference video"
            type="video"
            url={video}
            onOpenPicker={() => setDialog("video")}
            onClear={() => {
              setVideoError(null);
              set("videos", []);
            }}
          />
          {videoError ? (
            <p className="text-[11px] text-red-400/90">{videoError}</p>
          ) : (
            <p className="text-[11px] text-white/40">The moves and camera to follow, 2–30 seconds.</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <span className={sectionLabel}>Audio</span>
          <AudioWindowPicker value={audio} onChange={handleAudioChange} disabled={pending} />
        </div>

        <div className="flex flex-col gap-2">
          <span className={sectionLabel}>Describe the scene · optional</span>
          <textarea
            value={state.prompt}
            onChange={(e) => set("prompt", e.target.value)}
            maxLength={Seedance25RefLimits.maxPromptLength}
            rows={4}
            placeholder="A neon-lit rooftop at night. Use @Image1, @Video1 and @Audio1 to point at your references."
            className="resize-none rounded-[10px] border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm leading-relaxed text-white placeholder:text-white/30 focus:border-white/25 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className={sectionLabel}>Settings</span>
          <StyleMenuButton
            icon={Monitor}
            label="Resolution"
            options={RESOLUTION_OPTIONS}
            selected={[state.resolution]}
            max={1}
            onChange={([resolution]) => resolution && set("resolution", resolution)}
          />
          <StyleMenuButton
            icon={RectangleHorizontal}
            label="Aspect ratio"
            options={ASPECT_OPTIONS}
            selected={[state.aspectRatio]}
            max={1}
            onChange={([aspectRatio]) => aspectRatio && set("aspectRatio", aspectRatio)}
          />
          <p className="px-0.5 text-[11px] text-white/40">
            Length: {audio ? `${toDuration(audio.lengthSec)}s, matches your audio` : "set by the audio you choose"}
          </p>
        </div>
      </div>

      <div className="flex flex-shrink-0 flex-col gap-2 border-t border-border p-3">
        {missing && <p className="text-[11px] text-white/45">{missing}</p>}
        <div className="flex items-center gap-2">
          {user && !templateMode && <ProjectSelector />}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!!missing || (!templateMode && !projectId) || pending}
            className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: "var(--gradient-create)" }}
          >
            {uploading
              ? "Preparing audio…"
              : pending
                ? "Starting…"
                : `${templateMode ? "Create template" : "Create clip"} · ${cost?.creditsCost ?? 0} credits`}
          </button>
        </div>
      </div>

      <MediaManagerDialog
        open={dialog === "image"}
        onOpenChange={(open) => !open && setDialog(null)}
        selectedImage={image}
        onSelect={(urls) => {
          if (urls[0]) set("images", [urls[0]]);
          setDialog(null);
        }}
        maxSelections={1}
        mediaType="image"
      />
      <MediaManagerDialog
        open={dialog === "video"}
        onOpenChange={(open) => !open && setDialog(null)}
        selectedImage={video}
        onSelect={(urls) => handleVideo(urls[0])}
        maxSelections={1}
        mediaType="video"
      />
    </div>
  );
}
