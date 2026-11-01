"use client";

import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { ScanLine } from "lucide-react";
import {
  useVideoAnalysesQuery,
  useVideoAnalysisQueuesQuery,
} from "../hooks/use-video-analyzer";
import { isActiveStatus } from "../types";
import { VideoAnalysisCard } from "./VideoAnalysisCard";

/** The user's video analyses, with loading, error and empty states. */
export function VideoAnalysesGrid({ onOpen }: { onOpen: (id: string) => void }) {
  const { data: rawAnalyses, isLoading, isError, error, refetch } =
    useVideoAnalysesQuery();
  const { data: queue } = useVideoAnalysisQueuesQuery();

  // Overlay the 1s queue poll on top of the list fetch so status appears as
  // soon as it's ready, without waiting on the list's own refetch.
  const analyses = useMemo(() => {
    if (!rawAnalyses) return rawAnalyses;
    if (!queue?.length) return rawAnalyses;
    const byId = new Map(queue.map((job) => [job.id, job]));
    return rawAnalyses.map((analysis) => byId.get(analysis.id) ?? analysis);
  }, [rawAnalyses, queue]);

  // A ref, not state — the effect depends only on `analyses`, so a state Set
  // would be stale on every run and the same analysis could toast twice.
  const handled = useRef(new Set<string>());

  useEffect(() => {
    if (!analyses?.length) return;

    let succeeded = 0;
    let failed = 0;

    analyses.forEach((analysis) => {
      if (isActiveStatus(analysis.status) || handled.current.has(analysis.id)) {
        return;
      }
      handled.current.add(analysis.id);
      if (analysis.status === "success") succeeded += 1;
      if (analysis.status === "failure") failed += 1;
    });

    if (succeeded) {
      toast.success(
        succeeded === 1 ? "Video analysis ready" : `${succeeded} analyses ready`,
      );
    }
    if (failed) {
      toast.error(
        failed === 1 ? "A video analysis failed" : `${failed} analyses failed`,
      );
    }
  }, [analyses]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse overflow-hidden rounded-2xl border border-violet-400/15 bg-[#0b0614]/70"
          >
            <div className="h-40 bg-violet-500/10" />
            <div className="p-4">
              <div className="h-3 w-1/2 rounded bg-white/10" />
              <div className="mt-2 h-2.5 w-1/3 rounded bg-white/5" />
              <div className="mt-6 h-5 w-1/4 rounded-md bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-violet-400/20 bg-[#0b0614]/50 py-14 text-center backdrop-blur-xl">
        <p className="text-muted-foreground text-sm">
          {error instanceof Error
            ? error.message
            : "Could not load your video analyses."}
        </p>
        <button type="button" onClick={() => refetch()} className="btn btn-ghost btn-sm">
          Try again
        </button>
      </div>
    );
  }

  if (!analyses?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-violet-400/25 bg-[#0b0614]/50 py-16 text-center backdrop-blur-xl">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl border border-violet-300/30 bg-violet-500/15 text-violet-200 shadow-[0_0_30px_-6px_rgba(168,85,247,0.8)]">
          <ScanLine className="size-8" />
        </div>
        <h3 className="text-lg font-semibold text-white">No analyses yet</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Pick a video above to get your first scene breakdown.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {analyses.map((analysis) => (
        <VideoAnalysisCard key={analysis.id} analysis={analysis} onOpen={onOpen} />
      ))}
    </div>
  );
}
