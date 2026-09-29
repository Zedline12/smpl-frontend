"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, Clock, Loader2, ListVideo } from "lucide-react";
import { cn } from "@/lib/utils";
import { VideoAnalysis } from "../types";
import { hostnameOf } from "../utils";

function relativeTime(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return formatDistanceToNow(date, { addSuffix: true });
}

function StatusPill({ analysis }: { analysis: VideoAnalysis }) {
  const base =
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold";

  switch (analysis.status) {
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
          Analyzing
        </span>
      );
    case "failure":
      return (
        <span className={cn(base, "bg-red-500/15 text-red-500")}>
          <AlertTriangle className="size-3" />
          Failed
        </span>
      );
    default:
      return (
        <span className={cn(base, "bg-green-500/15 text-green-500")}>
          <ListVideo className="size-3" />
          {analysis.scenes?.length ?? 0} scenes
        </span>
      );
  }
}

export function VideoAnalysisCard({ analysis }: { analysis: VideoAnalysis }) {
  const host = hostnameOf(analysis.youtubeUrl);
  const title = analysis.name?.trim() || host;
  const timestamp = relativeTime(analysis.createdAt);

  return (
    <Link
      href={`/video-analyzer/analyses/${analysis.id}`}
      className="border-border bg-card hover:border-white/20 flex flex-col gap-3 rounded-2xl border p-4 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-foreground truncate text-sm font-semibold">{title}</p>
          <p className="text-muted-foreground mt-0.5 truncate text-xs">{host}</p>
        </div>
        <StatusPill analysis={analysis} />
      </div>

      {analysis.status === "failure" && analysis.errorMessage && (
        <p className="rounded-xl bg-red-500/10 p-2.5 text-xs leading-snug text-red-400">
          {analysis.errorMessage}
        </p>
      )}

      {timestamp && (
        <p className="text-muted-foreground mt-auto text-[11px]">{timestamp}</p>
      )}
    </Link>
  );
}
