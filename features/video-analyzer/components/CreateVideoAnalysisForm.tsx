"use client";

import { CSSProperties, FormEvent, useState } from "react";
import { ChevronDown, Loader2, ScanLine, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaManagerDialog } from "@/features/generation/components/prompt/MediaManagerDialog";
import { CreateVideoAnalysisRequest } from "../types";

const SECTION_LABEL = "font-mono text-[10px] font-semibold uppercase tracking-widest text-white/50";
const FIELD_CLASS =
  "w-full rounded-xl! border! border-white/10! bg-transparent! px-3! text-sm! text-white! outline-none! placeholder:text-white/35 focus:border-fuchsia-300/50!";

/** Same 4/6/8s increments Veo 3 uses (features/generation/types/models/veo-3.type.ts). */
const SCENE_DURATIONS: Array<4 | 6 | 8> = [4, 6, 8];
const DEFAULT_SCENE_DURATION: 4 | 6 | 8 = 8;

interface CreateVideoAnalysisFormProps {
  onSubmit: (values: CreateVideoAnalysisRequest) => void;
  isSubmitting: boolean;
  /** Extra classes for the form card (e.g. a glass look on the studio hero). */
  className?: string;
}

export function CreateVideoAnalysisForm({
  onSubmit,
  isSubmitting,
  className,
}: CreateVideoAnalysisFormProps) {
  const [isVideoManagerOpen, setIsVideoManagerOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | undefined>();
  const [sceneDurationSeconds, setSceneDurationSeconds] = useState<4 | 6 | 8>(
    DEFAULT_SCENE_DURATION,
  );
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting || !videoUrl) return;

    onSubmit({
      videoUrl,
      sceneDurationSeconds,
      ...(name.trim() ? { name: name.trim() } : {}),
      ...(prompt.trim() ? { prompt: prompt.trim() } : {}),
    });

    setVideoUrl(undefined);
    setName("");
    setPrompt("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("rounded-2xl border p-4 sm:p-5", className)}
    >
      {/* Video picker: a wide drop zone, or the chosen video with its preview */}
      {videoUrl ? (
        <div className="group relative flex items-center gap-4 rounded-xl border border-fuchsia-300/30 bg-fuchsia-500/[0.06] p-2.5">
          <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-black">
            <video src={`${videoUrl}#t=0.5`} className="size-full object-cover" muted preload="metadata" />
            <span aria-hidden className="animate-analyzer-sweep absolute inset-y-0 w-0" style={{ "--sweep-speed": "2.6s" } as CSSProperties}>
              <span className="absolute inset-y-0 -left-px w-0.5 bg-fuchsia-300 shadow-[0_0_10px_2px_rgba(232,121,249,0.8)]" />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">Video ready to scan</p>
            <button
              type="button"
              onClick={() => setIsVideoManagerOpen(true)}
              className="mt-1 cursor-pointer text-xs text-fuchsia-200/80 underline-offset-2 hover:text-white hover:underline"
            >
              Choose a different video
            </button>
          </div>
          <button
            type="button"
            onClick={() => setVideoUrl(undefined)}
            aria-label="Remove video"
            className="cursor-pointer rounded-full border border-white/10 bg-black/40 p-1.5 text-white/70 transition-colors hover:text-white"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsVideoManagerOpen(true)}
          className="group flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-violet-300/25 px-4 py-7 transition-all hover:border-fuchsia-300/60 hover:bg-fuchsia-500/[0.05]"
        >
          <span className="flex size-11 items-center justify-center rounded-xl border border-violet-300/30 bg-violet-500/15 text-violet-200 shadow-[0_0_24px_-6px_rgba(168,85,247,0.9)] transition-colors group-hover:text-fuchsia-200">
            <Upload className="size-5" />
          </span>
          <span className="text-sm font-semibold text-white">Choose a video to analyze</span>
          <span className="text-xs text-white/45">From your library or a new upload</span>
        </button>
      )}

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <span className={SECTION_LABEL}>Scene length</span>
          <div className="flex gap-1.5">
            {SCENE_DURATIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSceneDurationSeconds(option)}
                className={cn(
                  "cursor-pointer rounded-lg border px-3.5 py-1.5 font-mono text-xs font-semibold transition-colors",
                  sceneDurationSeconds === option
                    ? "border-fuchsia-300/60 bg-fuchsia-500/20 text-white shadow-[0_0_16px_-4px_rgba(217,70,239,0.8)]"
                    : "border-white/10 text-white/55 hover:border-white/25 hover:text-white",
                )}
              >
                {option}s
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !videoUrl}
          className="flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 text-sm font-semibold text-white shadow-[0_0_30px_-8px_rgba(217,70,239,0.9)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Starting…
            </>
          ) : (
            <>
              <ScanLine className="size-4" />
              Analyze video
            </>
          )}
        </button>
      </div>

      <button
        type="button"
        onClick={() => setShowAdvanced((previous) => !previous)}
        className="mt-4 flex cursor-pointer items-center gap-1 text-xs font-medium text-white/50 transition-colors hover:text-white"
      >
        <ChevronDown
          className={cn("size-3.5 transition-transform", showAdvanced && "rotate-180")}
        />
        Advanced options
      </button>

      {showAdvanced && (
        <div className="mt-3 flex flex-col gap-4 border-t border-white/10 pt-4">
          <label className="flex flex-col gap-1.5">
            <span className={SECTION_LABEL}>Name</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Optional"
              className={cn(FIELD_CLASS, "h-10")}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={SECTION_LABEL}>Focus instructions</span>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Optional, e.g. 'focus on the product shots'"
              rows={3}
              className={cn(FIELD_CLASS, "resize-none py-2!")}
            />
          </label>
        </div>
      )}

      <MediaManagerDialog
        open={isVideoManagerOpen}
        onOpenChange={setIsVideoManagerOpen}
        selectedImage={videoUrl}
        onSelect={(urls) => setVideoUrl(urls[0])}
        mediaType="video"
        maxSelections={1}
      />
    </form>
  );
}
