"use client";

import { formatDistanceToNow } from "date-fns";
import { Download, Film, Image as ImageIcon, Loader2 } from "lucide-react";
import { downloadFile } from "@/lib/handle-downloads";
import { useMarketingJobStatus } from "../hooks/use-marketing-studio";
import { MarketingStudioCreation } from "../types";

function relativeTime(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return formatDistanceToNow(date, { addSuffix: true });
}

export function MyCreationCard({
  creation,
}: {
  creation: MarketingStudioCreation;
  }) {
  console.log(creation)
  const { job } = useMarketingJobStatus(creation.jobId);
  const isVideo = creation.mediaType === "video";
  const isActive = !job || job.status === "pending" || job.status === "processing";
  const isFailure = job?.status === "failure";
  const timestamp = relativeTime(creation.createdAt);

  return (
    <div className="border-border bg-card group flex flex-col overflow-hidden rounded-2xl border">
      <div
        className={`relative flex items-center justify-center bg-black ${
          isVideo ? "aspect-video" : "aspect-square"
        }`}
      >
        {isActive && (
          <div className="text-muted-foreground flex flex-col items-center gap-2">
            <Loader2 className="size-5 animate-spin" />
            <span className="text-xs">
              {job?.status === "pending" ? "Queued…" : "Generating…"}
            </span>
          </div>
        )}

        {isFailure && (
          <p className="px-4 text-center text-xs text-red-400">
            Generation failed
          </p>
        )}

        {job?.status === "success" && job.resultUrl && (
          <>
            {isVideo ? (
              <video
                src={job.resultUrl}
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
                onMouseOver={(event) => {
                  void event.currentTarget.play().catch(() => {});
                }}
                onMouseOut={(event) => event.currentTarget.pause()}
              />
            ) : (
              <img
                src={job.resultUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}

            <button
              type="button"
              onClick={() =>
                downloadFile(
                  job.resultUrl,
                  `marketing-${creation.mediaType}-${creation.id}`,
                )
              }
              className="absolute top-2 right-2 cursor-pointer rounded-lg bg-black/50 p-1.5 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/70"
              title="Download"
            >
              <Download className="size-3.5" />
            </button>
          </>
        )}

        <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
          {isVideo ? (
            <Film className="size-3" />
          ) : (
            <ImageIcon className="size-3" />
          )}
          {isVideo ? "Video" : "Photo"}
        </span>
      </div>

      <div className="flex flex-col gap-1 p-3">
        <p className="text-foreground line-clamp-2 text-xs font-medium">
          {creation.description}
        </p>
        {timestamp && (
          <p className="text-muted-foreground text-[11px]">{timestamp}</p>
        )}
      </div>
    </div>
  );
}
