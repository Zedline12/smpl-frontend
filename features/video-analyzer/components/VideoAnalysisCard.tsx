"use client";

import { CSSProperties } from "react";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, Clock, Coins, ListVideo, Loader2, ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { VideoAnalysisProject, isActiveStatus } from "../types";
import { JobProgress } from "@/features/live/JobProgress";
import { useLiveItem } from "@/features/live/store";
import { formatDuration } from "../utils";

function relativeTime(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return formatDistanceToNow(date, { addSuffix: true });
}

function StatusPill({ analysis }: { analysis: VideoAnalysisProject }) {
  const base =
    "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm";

  switch (analysis.status) {
    case "pending":
      return (
        <span className={cn(base, "border-white/15 bg-black/50 text-white/70")}>
          <Clock className="size-3" />
          Queued
        </span>
      );
    case "processing":
      return (
        <span className={cn(base, "border-fuchsia-300/40 bg-fuchsia-500/20 text-fuchsia-100")}>
          <Loader2 className="size-3 animate-spin" />
          Analyzing
        </span>
      );
    case "failure":
      return (
        <span className={cn(base, "border-red-400/40 bg-red-500/20 text-red-200")}>
          <AlertTriangle className="size-3" />
          Failed
        </span>
      );
    default:
      return (
        <span className={cn(base, "border-violet-300/40 bg-violet-500/25 text-violet-50")}>
          <ListVideo className="size-3" />
          {analysis.totalScenes ?? 0} scenes
        </span>
      );
  }
}

export function VideoAnalysisCard({
  analysis,
  onOpen,
}: {
  analysis: VideoAnalysisProject;
  onOpen: (id: string) => void;
}) {
  const title = analysis.name?.trim() || "Untitled analysis";
  const timestamp = relativeTime(analysis.createdAt);
  const active = isActiveStatus(analysis.status);
  const live = useLiveItem("video-analysis", analysis.id);
  const failed = analysis.status === "failure";
  const sceneCount = Math.min(analysis.totalScenes ?? 0, 16);

  return (
    <button
      type="button"
      onClick={() => onOpen(analysis.id)}
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-[#0b0614]/70 text-left backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-fuchsia-400",
        failed
          ? "border-red-400/20 hover:border-red-400/40"
          : "border-violet-400/15 hover:border-fuchsia-400/40 hover:shadow-[0_0_40px_-12px_rgba(192,38,211,0.8)]",
      )}
    >
      {/* The source video as the thumbnail, with the scene breakdown under it */}
      <div className="relative h-40 overflow-hidden border-b border-white/5 bg-[radial-gradient(ellipse_at_30%_20%,rgba(139,92,246,0.4),transparent_60%),radial-gradient(ellipse_at_80%_80%,rgba(217,70,239,0.25),transparent_60%)]">
        {analysis.originalVideoUrl && (
          <video
            src={`${analysis.originalVideoUrl}#t=0.5`}
            muted
            playsInline
            preload="metadata"
            className={cn(
              "absolute inset-0 size-full object-cover transition-all duration-500 group-hover:scale-105",
              active ? "opacity-40 saturate-50" : "opacity-70",
              failed && "opacity-30 grayscale",
            )}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0614] via-[#0b0614]/30 to-transparent" />

        {active && (
          <>
            {/* Grid + a beam scanning the frame while the model works */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(216,180,254,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(216,180,254,0.4) 1px, transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            />
            <div
              className="animate-analyzer-sweep absolute inset-y-0 w-0"
              style={{ "--sweep-speed": analysis.status === "pending" ? "5s" : "2.4s" } as CSSProperties}
            >
              <span className="absolute inset-y-0 -left-8 w-16 bg-gradient-to-r from-transparent via-fuchsia-400/25 to-transparent" />
              <span className="absolute inset-y-0 -left-px w-0.5 bg-fuchsia-300 shadow-[0_0_14px_3px_rgba(232,121,249,0.8)]" />
            </div>
            <div className="absolute inset-x-3 bottom-2 rounded-lg bg-black/55 px-2.5 py-1.5 backdrop-blur-sm">
              <JobProgress
                size="sm"
                job={{
                  status: live?.status ?? analysis.status,
                  startedAt: live?.startedAt,
                  estimatedSeconds: live?.estimatedSeconds,
                }}
              />
            </div>
          </>
        )}

        {!active && !failed && sceneCount > 0 && (
          <div className="absolute inset-x-3 bottom-3 flex h-4 items-center gap-[3px]">
            {Array.from({ length: sceneCount }, (_, i) => (
              <span
                key={i}
                className="h-full flex-1 rounded-[3px] bg-gradient-to-r from-violet-500/85 to-fuchsia-400/75 transition-transform group-hover:scale-y-125"
                style={{ transitionDelay: `${i * 20}ms` }}
              />
            ))}
          </div>
        )}

        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-md border border-white/10 bg-black/50 px-2 py-0.5 font-mono text-[10px] text-white/80 backdrop-blur-sm">
          <ScanLine className="size-3 text-fuchsia-300" />
          {formatDuration(analysis.durationSeconds)}
        </div>
        <div className="absolute top-3 right-3 z-10">
          <StatusPill analysis={analysis} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{title}</p>
          <p className="mt-0.5 truncate font-mono text-[11px] text-violet-100/50">
            {analysis.sceneDurationSeconds}s per scene
          </p>
        </div>

        {failed && analysis.errorMessage && (
          <p className="line-clamp-2 rounded-xl bg-red-500/10 p-2.5 text-xs leading-snug text-red-300">
            {analysis.errorMessage}
          </p>
        )}

        <div className="mt-auto flex items-center gap-2 text-[11px] text-violet-100/60">
          <span className="inline-flex items-center gap-1 rounded-md border border-violet-300/20 bg-violet-500/10 px-2 py-0.5">
            <Coins className="size-3" />
            {analysis.creditsUsed}
          </span>
          {timestamp && <span className="ml-auto text-white/40">{timestamp}</span>}
        </div>
      </div>
    </button>
  );
}
