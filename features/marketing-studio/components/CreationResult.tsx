"use client";

import { Download, Loader2 } from "lucide-react";
import { downloadFile } from "@/lib/handle-downloads";
import { GenerationQueue } from "@/features/generation/types/generation";
import { MarketingStudioMediaType } from "../types";

interface CreationResultProps {
  mediaType: MarketingStudioMediaType;
  job: GenerationQueue | undefined;
}

export function CreationResult({ mediaType, job }: CreationResultProps) {
  if (!job) return null;

  const isActive = job.status === "pending" || job.status === "processing";
  const isFailure = job.status === "failure";

  return (
    <div className="border-border bg-card overflow-hidden rounded-2xl border">
      <div className="relative flex min-h-[240px] items-center justify-center bg-black">
        {isActive && (
          <div className="text-muted-foreground flex flex-col items-center gap-2 p-10">
            <Loader2 className="size-6 animate-spin" />
            <span className="text-sm">
              {job.status === "pending" ? "Queued…" : "Generating…"}
            </span>
          </div>
        )}

        {isFailure && (
          <p className="p-10 text-sm text-red-400">
            Generation failed. Try again.
          </p>
        )}

        {job.status === "success" && job.resultUrl && (
          <>
            {mediaType === "video" ? (
              <video
                src={job.resultUrl}
                controls
                autoPlay
                loop
                className="max-h-[55vh] w-full object-contain"
              />
            ) : (
              <img
                src={job.resultUrl}
                alt=""
                className="max-h-[55vh] w-full object-contain"
              />
            )}

            <button
              type="button"
              onClick={() =>
                downloadFile(
                  job.resultUrl,
                  `marketing-${mediaType}-${job.id}`,
                )
              }
              className="absolute top-3 right-3 cursor-pointer rounded-lg bg-black/40 p-2 text-white backdrop-blur-md transition-colors hover:bg-black/60"
              title="Download"
            >
              <Download className="size-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
