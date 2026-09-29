"use client";

import { FormEvent, useMemo, useState } from "react";
import { ChevronDown, Loader2, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateVideoAnalysisRequest } from "../types";
import { normalizeYoutubeUrl } from "../utils";

const FIELD_CLASS =
  "border-border bg-background-light text-foreground placeholder:text-muted-foreground focus:border-primary/50 w-full rounded-xl! border! px-3! text-sm! outline-none!";

interface CreateVideoAnalysisFormProps {
  onSubmit: (values: CreateVideoAnalysisRequest) => void;
  isSubmitting: boolean;
}

export function CreateVideoAnalysisForm({
  onSubmit,
  isSubmitting,
}: CreateVideoAnalysisFormProps) {
  const [videoUrl, setVideoUrl] = useState("");
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const normalizedUrl = useMemo(() => normalizeYoutubeUrl(videoUrl), [videoUrl]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!normalizedUrl) {
      setError("Enter a valid YouTube link, for example youtube.com/watch?v=…");
      return;
    }

    setError(null);
    onSubmit({
      videoUrl: normalizedUrl,
      ...(name.trim() ? { name: name.trim() } : {}),
      ...(prompt.trim() ? { prompt: prompt.trim() } : {}),
    });

    setVideoUrl("");
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
        Paste a YouTube link and we&apos;ll break it down scene by scene.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Youtube className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            type="text"
            inputMode="url"
            value={videoUrl}
            onChange={(event) => {
              setVideoUrl(event.target.value);
              if (error) setError(null);
            }}
            placeholder="youtube.com/watch?v=…"
            aria-label="YouTube URL"
            aria-invalid={!!error}
            className={cn(FIELD_CLASS, "h-10 pl-9!", error && "border-red-500/60!")}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !videoUrl.trim()}
          className="bg-gradient-primary flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Starting…
            </>
          ) : (
            <>
              <Youtube className="size-4" />
              Analyze
            </>
          )}
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

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
