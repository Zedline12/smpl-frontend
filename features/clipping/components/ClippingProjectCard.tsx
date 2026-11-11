"use client";

import { createElement } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, Clock, Film, Loader2, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";
import { videoTypeIcon } from "../icons";
import { VideoClippingProject, isActiveStatus } from "../types";
import { hostnameOf, ratioLabel, videoTypeLabel } from "../utils";
import { ClippingProgressVisual } from "./ClippingProgressVisual";
import { JobProgress } from "@/features/live/JobProgress";
import { useLiveItem } from "@/features/live/store";

function relativeTime(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return formatDistanceToNow(date, { addSuffix: true });
}

function StatusPill({ project }: { project: VideoClippingProject }) {
  const base =
    "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-sm";

  switch (project.status) {
    case "pending":
      return (
        <span className={cn(base, "border-white/15 bg-black/40 text-white/70")}>
          <Clock className="size-3" />
          Queued
        </span>
      );
    case "processing":
      return (
        <span className={cn(base, "border-white/40 bg-white/15 text-white/80")}>
          <Loader2 className="size-3 animate-spin" />
          Clipping
        </span>
      );
    case "partial":
      return (
        <span className={cn(base, "border-amber-300/40 bg-amber-400/15 text-amber-200")}>
          <AlertTriangle className="size-3" />
          {project.clips?.length ?? 0} clips · some failed
        </span>
      );
    case "failed":
      return (
        <span className={cn(base, "border-red-400/40 bg-red-500/15 text-red-300")}>
          <AlertTriangle className="size-3" />
          Failed
        </span>
      );
    default:
      return (
        <span className={cn(base, "border-white/40 bg-white/20 text-white/80")}>
          <Film className="size-3" />
          {project.clips?.length ?? 0} clips
        </span>
      );
  }
}

/** Segment widths for the card's timeline strip, one per clip (or a placeholder set). */
const PLACEHOLDER_SEGMENTS = [18, 12, 22, 14, 16];

export function ClippingProjectCard({
  project,
}: {
  project: VideoClippingProject;
}) {
  const host = hostnameOf(project.originalVideoUrl);
  const title = project.projectName?.trim() || host;
  const timestamp = relativeTime(project.createdAt);
  const active = isActiveStatus(project.status);
  const live = useLiveItem("clipping", project.id);
  const failed = project.status === "failed";
  const clipCount = project.clips?.length ?? 0;
  const segments = clipCount
    ? Array.from({ length: Math.min(clipCount, 8) }, (_, i) => PLACEHOLDER_SEGMENTS[i % PLACEHOLDER_SEGMENTS.length])
    : PLACEHOLDER_SEGMENTS;

  return (
    <Link
      href={`/clipping-studio/${project.id}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-neutral-950/60 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5",
        failed
          ? "border-red-400/20 hover:border-red-400/40"
          : "border-white/15 hover:border-white/40 hover:shadow-[0_0_40px_-12px_rgba(255,255,255,0.44)]",
      )}
    >
      {/* Header: the source on a "monitor", with a timeline of the clips below */}
      <div
        className={cn(
          "relative overflow-hidden border-b border-white/5 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.19),transparent_60%),radial-gradient(ellipse_at_80%_80%,rgba(255,255,255,0.11),transparent_60%)]",
          active ? "h-40" : "h-24",
        )}
      >
        {active ? (
          <>
            <ClippingProgressVisual queued={project.status === "pending"} />
            <div className="absolute inset-x-3 bottom-2 rounded-lg bg-black/55 px-2.5 py-1.5 backdrop-blur-sm">
              <JobProgress
                size="sm"
                job={{
                  status: live?.status ?? project.status,
                  createdAt: project.createdAt,
                  startedAt: live?.startedAt ?? project.outputs?.[0]?.startedAt ?? project.createdAt,
                  estimatedSeconds: live?.estimatedSeconds ?? project.estimatedSeconds,
                }}
              />
            </div>
          </>
        ) : (
          <>
            <div className="absolute inset-x-3 bottom-3 flex h-5 items-center gap-1">
              {segments.map((w, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-full rounded-[4px]",
                    failed ? "bg-red-400/30" : "bg-gradient-to-r from-white/60 to-white/30",
                  )}
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
            <Scissors className="absolute right-3 bottom-[38px] size-3.5 text-white/0 transition-colors group-hover:text-white/80" />
          </>
        )}

        <div className="absolute top-3 left-3 z-10 flex size-9 items-center justify-center rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm">
          {createElement(videoTypeIcon(project.videoType), { className: "size-4 text-white" })}
        </div>
        <div className="absolute top-3 right-3 z-10">
          <StatusPill project={project} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{title}</p>
          <p className="mt-0.5 truncate text-xs text-white/50">
            {videoTypeLabel(project.videoType)} · {host}
          </p>
        </div>

        {failed && project.errorMessage && (
          <p className="rounded-xl bg-red-500/10 p-2.5 text-xs leading-snug text-red-300">
            {project.errorMessage}
          </p>
        )}

        <div className="mt-auto flex items-center gap-2 text-[11px] text-white/60">
          <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5">
            {ratioLabel(project.ratioOfClip)}
          </span>
          <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 uppercase">
            {project.lang}
          </span>
          {timestamp && <span className="ml-auto text-white/40">{timestamp}</span>}
        </div>
      </div>
    </Link>
  );
}
