"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, Clock, Film, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { VideoClippingProject } from "../types";
import { hostnameOf, ratioLabel, videoTypeLabel } from "../utils";

function relativeTime(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return formatDistanceToNow(date, { addSuffix: true });
}

function StatusPill({ project }: { project: VideoClippingProject }) {
  const base =
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold";

  switch (project.status) {
    case "pending":
      return (
        <span className={cn(base, "bg-foreground/10 text-muted-foreground")}>
          <Clock className="size-3" />
          Queued
        </span>
      );
    case "processing":
      return (
        <span className={cn(base, "bg-primary/15 text-primary")}>
          <Loader2 className="size-3 animate-spin" />
          Clipping
        </span>
      );
    case "failed":
      return (
        <span className={cn(base, "bg-red-500/15 text-red-500")}>
          <AlertTriangle className="size-3" />
          Failed
        </span>
      );
    default:
      return (
        <span className={cn(base, "bg-green-500/15 text-green-500")}>
          <Film className="size-3" />
          {project.clips?.length ?? 0} clips
        </span>
      );
  }
}

export function ClippingProjectCard({
  project,
}: {
  project: VideoClippingProject;
}) {
  const host = hostnameOf(project.originalVideoUrl);
  const title = project.projectName?.trim() || host;
  const timestamp = relativeTime(project.createdAt);

  return (
    <Link
      href={`/clipping-studio/your-clips/${project.id}`}
      className="border-border bg-card hover:border-white/20 flex flex-col gap-3 rounded-2xl border p-4 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-foreground truncate text-sm font-semibold">
            {title}
          </p>
          <p className="text-muted-foreground mt-0.5 truncate text-xs">
            {videoTypeLabel(project.videoType)} · {host}
          </p>
        </div>
        <StatusPill project={project} />
      </div>

      {project.status === "failed" && project.errorMessage && (
        <p className="rounded-xl bg-red-500/10 p-2.5 text-xs leading-snug text-red-400">
          {project.errorMessage}
        </p>
      )}

      <div className="text-muted-foreground mt-auto flex items-center gap-2 text-[11px]">
        <span className="bg-muted rounded-full px-2 py-0.5">
          {ratioLabel(project.ratioOfClip)}
        </span>
        <span className="bg-muted rounded-full px-2 py-0.5 uppercase">
          {project.lang}
        </span>
        {timestamp && <span className="ml-auto">{timestamp}</span>}
      </div>
    </Link>
  );
}
