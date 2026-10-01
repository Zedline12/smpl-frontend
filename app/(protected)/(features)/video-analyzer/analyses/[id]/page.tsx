"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, Clock, ListVideo, Loader2 } from "lucide-react";
import { SceneList } from "@/features/video-analyzer/components/SceneList";
import { useVideoAnalysisQuery } from "@/features/video-analyzer/hooks/use-video-analyzer";
import { isActiveStatus } from "@/features/video-analyzer/types";
import { formatDuration } from "@/features/video-analyzer/utils";

function AnalysisSkeleton() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse space-y-8 p-5 md:p-8">
      <div className="space-y-3">
        <div className="bg-muted h-8 w-64 rounded-lg" />
        <div className="flex gap-2">
          <div className="bg-muted h-6 w-20 rounded-full" />
          <div className="bg-muted h-6 w-20 rounded-full" />
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-muted h-28 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function VideoAnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const { data: analysis, isLoading, isError, error } = useVideoAnalysisQuery(id);

  if (isLoading) return <AnalysisSkeleton />;

  if (isError || !analysis) {
    return (
      <div className="mx-auto max-w-4xl p-5 md:p-8">
        <Link
          href="/video-analyzer/analyses"
          className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to analyses
        </Link>
        <p className="text-muted-foreground text-sm">
          {error instanceof Error
            ? error.message
            : "This video analysis could not be found."}
        </p>
      </div>
    );
  }

  const title = analysis.name?.trim() || "Untitled analysis";
  const active = isActiveStatus(analysis.status);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-5 md:p-8">
      <Link
        href="/video-analyzer/analyses"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to analyses
      </Link>

      <header className="flex flex-col gap-3">
        <h1 className="text-foreground text-2xl font-bold">{title}</h1>

        <div className="border-border overflow-hidden rounded-2xl border bg-black">
          <video
            src={analysis.originalVideoUrl}
            controls
            className="max-h-[50vh] w-full object-contain"
          />
        </div>

        <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
          <span className="bg-muted inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium">
            <ListVideo className="size-3" />
            {analysis.totalScenes ?? 0} scenes
          </span>
          <span className="bg-muted rounded-full px-2.5 py-0.5 text-[11px] font-medium">
            {formatDuration(analysis.durationSeconds)}
          </span>
          <span className="bg-muted rounded-full px-2.5 py-0.5 text-[11px] font-medium">
            {analysis.sceneDurationSeconds}s scenes
          </span>
          <span className="bg-muted rounded-full px-2.5 py-0.5 text-[11px] font-medium">
            {analysis.creditsUsed} credits
          </span>
        </div>
      </header>

      {active && (
        <div className="border-border bg-card flex items-center gap-3 rounded-2xl border p-4">
          {analysis.status === "pending" ? (
            <Clock className="text-muted-foreground size-5 shrink-0" />
          ) : (
            <Loader2 className="text-primary size-5 shrink-0 animate-spin" />
          )}
          <div>
            <p className="text-foreground text-sm font-medium">
              {analysis.status === "pending"
                ? "Waiting to start"
                : "Analyzing the video…"}
            </p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              This page updates on its own — no need to refresh.
            </p>
          </div>
        </div>
      )}

      {analysis.status === "failure" && (
        <div className="flex items-start gap-2 rounded-2xl bg-red-500/10 p-4">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-400" />
          <p className="text-sm leading-snug text-red-400">
            {analysis.errorMessage || "This video could not be analyzed."}
          </p>
        </div>
      )}

      {!active && analysis.status !== "failure" && (
        <SceneList scenes={analysis.scenes ?? []} />
      )}
    </div>
  );
}
