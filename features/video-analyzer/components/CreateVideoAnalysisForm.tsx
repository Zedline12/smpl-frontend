"use client";

import { FormEvent, useState } from "react";
import { ChevronDown, Loader2, Plus, Video, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaManagerDialog } from "@/features/generation/components/prompt/MediaManagerDialog";
import { CreateVideoAnalysisRequest } from "../types";

const FIELD_CLASS =
  "border-border bg-background-light text-foreground placeholder:text-muted-foreground focus:border-primary/50 w-full rounded-xl! border! px-3! text-sm! outline-none!";

/** Same 4/6/8s increments Veo 3 uses (features/generation/types/models/veo-3.type.ts). */
const SCENE_DURATIONS: Array<4 | 6 | 8> = [4, 6, 8];
const DEFAULT_SCENE_DURATION: 4 | 6 | 8 = 8;

interface CreateVideoAnalysisFormProps {
  onSubmit: (values: CreateVideoAnalysisRequest) => void;
  isSubmitting: boolean;
}

export function CreateVideoAnalysisForm({
  onSubmit,
  isSubmitting,
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
      className="border-border bg-card rounded-2xl border p-4 sm:p-5"
    >
      <h2 className="text-foreground text-sm font-semibold">Analyze a video</h2>
      <p className="text-muted-foreground mt-1 text-xs">
        Upload a video and we&apos;ll break it into scenes with a ready-to-use
        prompt for recreating each one.
      </p>

      <div className="mt-4 flex flex-row items-start gap-4">
        {videoUrl ? (
          <div className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">
            <video src={videoUrl} className="h-full w-full object-cover" muted />
            <button
              type="button"
              onClick={() => setVideoUrl(undefined)}
              className="absolute top-1 right-1 cursor-pointer rounded-full bg-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
            >
              <X className="size-3 text-white" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsVideoManagerOpen(true)}
            className="group flex h-20 w-20 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border transition-all hover:border-primary/50 hover:bg-background-light"
          >
            <Video className="text-muted-foreground group-hover:text-primary size-5 transition-colors" />
            <Plus className="text-muted-foreground group-hover:text-primary size-3 transition-colors" />
          </button>
        )}

        <div className="flex-1">
          <p className="text-muted-foreground text-xs font-medium">
            {videoUrl ? "Video selected" : "Choose a video to analyze"}
          </p>

          <div className="mt-3 flex flex-col gap-1.5">
            <span className="text-muted-foreground text-xs font-medium">
              Scene length
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SCENE_DURATIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSceneDurationSeconds(option)}
                  className={cn(
                    "cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    sceneDurationSeconds === option
                      ? "border-primary bg-primary/15 text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {option}s
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <MediaManagerDialog
        open={isVideoManagerOpen}
        onOpenChange={setIsVideoManagerOpen}
        selectedImage={videoUrl}
        onSelect={(urls) => setVideoUrl(urls[0])}
        mediaType="video"
        maxSelections={1}
      />

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !videoUrl}
          className="bg-gradient-primary flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Starting…
            </>
          ) : (
            <>
              <Video className="size-4" />
              Analyze
            </>
          )}
        </button>
      </div>

      <button
        type="button"
        onClick={() => setShowAdvanced((previous) => !previous)}
        className="text-muted-foreground hover:text-foreground mt-4 flex cursor-pointer items-center gap-1 text-xs font-medium transition-colors"
      >
        <ChevronDown
          className={cn("size-3.5 transition-transform", showAdvanced && "rotate-180")}
        />
        Advanced options
      </button>

      {showAdvanced && (
        <div className="border-border mt-3 flex flex-col gap-4 border-t pt-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-muted-foreground text-xs font-medium">Name</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Optional"
              className={cn(FIELD_CLASS, "h-10")}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-muted-foreground text-xs font-medium">
              Focus instructions
            </span>
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
    </form>
  );
}
