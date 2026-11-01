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
        <span className={cn(base, "border-cyan-300/40 bg-cyan-400/15 text-cyan-200")}>
          <Loader2 className="size-3 animate-spin" />
          Clipping
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
        <span className={cn(base, "border-blue-300/40 bg-blue-500/20 text-blue-100")}>
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
  const failed = project.status === "failed";
  const clipCount = project.clips?.length ?? 0;
  const segments = clipCount
    ? Array.from({ length: Math.min(clipCount, 8) }, (_, i) => PLACEHOLDER_SEGMENTS[i % PLACEHOLDER_SEGMENTS.length])
    : PLACEHOLDER_SEGMENTS;

  return (
    <Link
      href={`/clipping-studio/${project.id}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-slate-950/60 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5",
        failed
          ? "border-red-400/20 hover:border-red-400/40"
          : "border-blue-400/15 hover:border-blue-400/40 hover:shadow-[0_0_40px_-12px_rgba(59,130,246,0.8)]",
      )}
    >
      {/* Header: the source on a blue "monitor", with a timeline of the clips below */}
      <div
        className={cn(
          "relative overflow-hidden border-b border-white/5 bg-[radial-gradient(ellipse_at_30%_20%,rgba(59,130,246,0.35),transparent_60%),radial-gradient(ellipse_at_80%_80%,rgba(34,211,238,0.2),transparent_60%)]",
          active ? "h-40" : "h-24",
        )}
      >
        {active ? (
          <ClippingProgressVisual queued={project.status === "pending"} />
        ) : (
          <>
            <div className="absolute inset-x-3 bottom-3 flex h-5 items-center gap-1">
              {segments.map((w, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-full rounded-[4px]",
                    failed ? "bg-red-400/30" : "bg-gradient-to-r from-blue-500/80 to-cyan-400/70",
                  )}
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
            <Scissors className="absolute right-3 bottom-[38px] size-3.5 text-white/0 transition-colors group-hover:text-cyan-300" />
          </>
        )}

        <div className="absolute top-3 left-3 z-10 flex size-9 items-center justify-center rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm">
          {createElement(videoTypeIcon(project.videoType), { className: "size-4 text-blue-200" })}
        </div>
        <div className="absolute top-3 right-3 z-10">
          <StatusPill project={project} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{title}</p>
          <p className="mt-0.5 truncate text-xs text-blue-100/50">
            {videoTypeLabel(project.videoType)} · {host}
          </p>
        </div>

        {failed && project.errorMessage && (
          <p className="rounded-xl bg-red-500/10 p-2.5 text-xs leading-snug text-red-300">
            {project.errorMessage}
          </p>
        )}

        <div className="mt-auto flex items-center gap-2 text-[11px] text-blue-100/60">
          <span className="rounded-full border border-blue-300/20 bg-blue-500/10 px-2 py-0.5">
            {ratioLabel(project.ratioOfClip)}
          </span>
          <span className="rounded-full border border-blue-300/20 bg-blue-500/10 px-2 py-0.5 uppercase">
            {project.lang}
          </span>
          {timestamp && <span className="ml-auto text-white/40">{timestamp}</span>}
        </div>
      </div>
    </Link>
  );
}
