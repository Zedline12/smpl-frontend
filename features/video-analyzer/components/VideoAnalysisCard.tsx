"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, FileText, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { JobProgress } from "@/features/live/JobProgress";
import { useLiveItem } from "@/features/live/store";
import {
  VideoAnalysisProject,
  analysisTypeLabel,
  isActiveStatus,
} from "../types";
import { formatDuration } from "../utils";

function relativeTime(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return formatDistanceToNow(date, { addSuffix: true });
}

/** What the analysis made, e.g. "12 scenes" or "5 sections". */
export function resultCount(analysis: VideoAnalysisProject): string {
  const n = analysis.totalScenes ?? 0;
  return analysis.type === "script"
    ? `${n} ${n === 1 ? "section" : "sections"}`
    : `${n} ${n === 1 ? "scene" : "scenes"}`;
}

/** An analysis in a grid: the source video, what it made and its status. */
export function VideoAnalysisCard({
  analysis,
}: {
  analysis: VideoAnalysisProject;
}) {
  const title = analysis.name?.trim() || "Untitled analysis";
  const timestamp = relativeTime(analysis.createdAt);
  const active = isActiveStatus(analysis.status);
  const failed = analysis.status === "failure";
  const live = useLiveItem("video-analysis", analysis.id);
  const TypeIcon = analysis.type === "script" ? FileText : Wand2;

  return (
    <Link
      href={`/video-analyzer/analyses/${analysis.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] transition-colors hover:border-white/20 focus-visible:outline-2 focus-visible:outline-white/40"
    >
      <div className="relative aspect-video overflow-hidden bg-black">
        {analysis.originalVideoUrl && (
          <video
            src={`${analysis.originalVideoUrl}#t=0.5`}
            muted
            playsInline
            preload="metadata"
            className={cn(
              "absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]",
              (active || failed) && "opacity-50",
              failed && "grayscale",
            )}
          />
        )}

        <span className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur-sm">
          <TypeIcon className="size-3" />
          {analysisTypeLabel(analysis.type)}
        </span>
        <span className="absolute top-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] text-white/80 tabular-nums backdrop-blur-sm">
          {formatDuration(analysis.durationSeconds)}
        </span>

        {active && (
          <div className="absolute inset-x-2 bottom-2 rounded-lg bg-black/60 px-2.5 py-1.5 backdrop-blur-sm">
            <JobProgress
              size="sm"
              job={{
                status: live?.status ?? analysis.status,
                // Without the live stream, a running analysis started when it last changed.
                startedAt:
                  live?.startedAt ??
                  (analysis.status === "processing"
                    ? analysis.updatedAt
                    : null),
                estimatedSeconds: live?.estimatedSeconds,
              }}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 p-3">
        <p className="truncate text-sm font-semibold text-white">{title}</p>
        <p className="flex items-center gap-1.5 text-xs text-white/45">
          {failed ? (
            <span className="flex items-center gap-1 text-red-300">
              <AlertTriangle className="size-3" />
              Failed
            </span>
          ) : active ? (
            <span>
              {analysis.status === "pending" ? "Queued" : "Analyzing…"}
            </span>
          ) : (
            <span>{resultCount(analysis)}</span>
          )}
          {timestamp && (
            <>
              <span aria-hidden>·</span>
              <span className="truncate">{timestamp}</span>
            </>
          )}
        </p>
      </div>
    </Link>
  );
}

export function VideoAnalysisCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
      <div className="aspect-video animate-pulse bg-white/[0.05]" />
      <div className="flex flex-col gap-2 p-3">
        <div className="h-3 w-2/3 animate-pulse rounded bg-white/[0.07]" />
        <div className="h-2.5 w-1/3 animate-pulse rounded bg-white/[0.05]" />
      </div>
    </div>
  );
}
