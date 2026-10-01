"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ListVideo } from "lucide-react";
import {
  useVideoAnalysesQuery,
  useVideoAnalysisQueuesQuery,
} from "../hooks/use-video-analyzer";
import { isActiveStatus } from "../types";
import { VideoAnalysisCard } from "./VideoAnalysisCard";

export function MyAnalysesWorkspace() {
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

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-5 md:p-8">
      <header>
        <h1 className="text-foreground text-2xl font-bold">My Analyses</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Every video you&apos;ve analyzed, and anything still processing.
        </p>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="border-border bg-card animate-pulse rounded-2xl border p-4"
            >
              <div className="bg-background-lighter h-3 w-1/2 rounded" />
              <div className="bg-background-light mt-2 h-2.5 w-1/3 rounded" />
              <div className="bg-background-light mt-6 h-5 w-2/3 rounded-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="border-border flex flex-col items-center gap-3 rounded-2xl border border-dashed py-14 text-center">
          <p className="text-muted-foreground text-sm">
            {error instanceof Error
              ? error.message
              : "Could not load your video analyses."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="btn btn-ghost btn-sm"
          >
            Try again
          </button>
        </div>
      ) : !analyses?.length ? (
        <div className="border-border bg-card rounded-2xl border border-dashed py-16 text-center">
          <div className="bg-muted text-muted-foreground mx-auto mb-4 flex size-16 items-center justify-center rounded-full">
            <ListVideo className="size-8" />
          </div>
          <h3 className="text-foreground text-lg font-semibold">
            No analyses yet
          </h3>
          <p className="text-muted-foreground mt-1 mb-6 text-sm">
            Upload a video to get your first scene breakdown.
          </p>
          <Link href="/video-analyzer" className="btn btn-primary">
            Analyze a video
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {analyses.map((analysis) => (
            <VideoAnalysisCard key={analysis.id} analysis={analysis} />
          ))}
        </div>
      )}
    </div>
  );
}
