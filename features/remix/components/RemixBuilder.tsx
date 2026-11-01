"use client";
import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { SingleMediaSlot } from "@/components/CreateSidebar";
import { MediaManagerDialog } from "@/features/generation/components/prompt/MediaManagerDialog";
import ProjectSelector from "@/features/generation/components/prompt/selectors/ProjectSelector";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import { GenerationTypeEnum } from "@/features/generation/types/generation";
import {
  ISeedance25RefToVideoInput,
  Seedance25RefDuration,
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
import { readVideoDuration } from "@/features/artist/utils/audio-clip";
import { RemixTitle } from "./RemixTitle";

// Remix runs on fal Seedance 2.5 reference-to-video: a character photo plus a reference video.
const MODEL = AiModelsEnum.SEEDANCE_2_5_REF_TO_VIDEO;

const RESOLUTION = "720p";
const BASE_PROMPT =
  "Replace the main character in @Video1 with the character from @Image1. Keep the motion, choreography, camera movement, framing and scene of @Video1.";
const PROMPT_MAX = Seedance25RefLimits.maxPromptLength - BASE_PROMPT.length - 1;
const { minReferenceSec, maxReferenceSec, minDurationSec, maxDurationSec } = Seedance25RefLimits;

const sectionLabel =
  "text-[11px] font-semibold uppercase tracking-widest text-white/50";

export default function RemixBuilder() {
  const { user } = useAuth();
  const { projectId, templateMode } = useAiGenerationControlStore();
  const { states, setField } = useAiModelStore();
  const state = states[MODEL] as ISeedance25RefToVideoInput;

  const [character, setCharacter] = useState<string | undefined>();
  const [videoUrl, setVideoUrl] = useState<string | undefined>();
  const [videoError, setVideoError] = useState<string | null>(null);
  const [direction, setDirection] = useState("");
  const [dialog, setDialog] = useState<"video" | "image" | null>(null);

  const { data: cost } = useGenerationCostQuery();
  const generation = useGenerateMutation();
  const templateGeneration = useGenerateTemplateMutation();

  const missing = !videoUrl ? "Add your reference video" : !character ? "Add your character" : null;
  const pending = generation.isPending || templateGeneration.isPending;

  // The clip is as long as the reference video; the shared state drives the cost.
  const pickVideo = async (url: string | undefined) => {
    setDialog(null);
    if (!url) return;
    setVideoError(null);
    const seconds = await readVideoDuration(url);
    if (seconds !== null && (seconds < minReferenceSec || seconds > maxReferenceSec + 0.2)) {
      setVideoError(
        `Reference video must be ${minReferenceSec}–${maxReferenceSec} seconds (this one is ${Math.round(seconds)}s).`,
      );
      return;
    }
    setVideoUrl(url);
    setField(MODEL, "resolution", RESOLUTION);
    const duration = Math.min(Math.max(Math.round(seconds ?? 10), minDurationSec), maxDurationSec);
    setField(MODEL, "duration", duration as Seedance25RefDuration);
  };

  const handleGenerate = () => {
    if (!videoUrl || !character) return;
    const input: ISeedance25RefToVideoInput = {
      prompt: direction.trim() ? `${BASE_PROMPT} ${direction.trim()}` : BASE_PROMPT,
      images: [character],
      videos: [videoUrl],
      audios: [],
      resolution: RESOLUTION,
      duration: state.duration,
      aspectRatio: "auto",
      generateAudio: true,
    };
    const request = { model: MODEL, mediaType: GenerationTypeEnum.VIDEO, input };
    if (templateMode) templateGeneration.mutate(request);
    else generation.mutate({ ...request, projectId });
  };

  return (
    // Slot borders pick up the primary color on this page.
    <aside className="flex h-full flex-col overflow-hidden border-r border-border bg-white/[0.025] [--border:color-mix(in_oklab,var(--color-primary)_35%,transparent)]">
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <RemixTitle />
        <p className="-mt-1 text-center text-[11px] text-white/45">
          Drop your character into any video.
        </p>

        <SingleMediaSlot
          label="Reference video"
          type="video"
          url={videoUrl}
          onOpenPicker={() => setDialog("video")}
          onClear={() => setVideoUrl(undefined)}
        />
        {videoError && <p className="-mt-2 text-[11px] text-red-400/90">{videoError}</p>}
        <SingleMediaSlot
          label="Your character"
          type="image"
          url={character}
          onOpenPicker={() => setDialog("image")}
          onClear={() => setCharacter(undefined)}
        />

        <div className="flex flex-col gap-2">
          <span className={sectionLabel}>Direction · optional</span>
          <textarea
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            maxLength={PROMPT_MAX}
            rows={3}
            placeholder="Keep the outfit from the photo, match the lighting of the video"
            className="focus:border-primary/50 resize-none rounded-[10px] border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm leading-relaxed text-white placeholder:text-white/30 focus:outline-none"
          />
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
            className="bg-primary hover:brightness-110 flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_-4px_var(--color-primary)] transition disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            {pending
              ? "Starting…"
              : `${templateMode ? "Create template" : "Remix"} · ${cost?.creditsCost ?? 0} credits`}
          </button>
        </div>
      </div>

      <MediaManagerDialog
        open={dialog === "video"}
        onOpenChange={(open) => !open && setDialog(null)}
        selectedImage={videoUrl}
        onSelect={(urls) => pickVideo(urls[0])}
        maxSelections={1}
        mediaType="video"
      />
      <MediaManagerDialog
        open={dialog === "image"}
        onOpenChange={(open) => !open && setDialog(null)}
        selectedImage={character}
        onSelect={(urls) => {
          setCharacter(urls[0]);
          setDialog(null);
        }}
        maxSelections={1}
        mediaType="image"
      />
    </aside>
  );
}
