"use client";

import { ReactNode, useEffect, useRef } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Scissors } from "lucide-react";
import { useClippingProjectsQuery } from "../hooks/use-clipping";
import { isActiveStatus } from "../types";
import { ClippingProjectCard } from "./ClippingProjectCard";

interface ClippingProjectsGridProps {
  /** What the empty state offers; defaults to a link to the create page. */
  emptyAction?: ReactNode;
}

/** The user's clipping projects, with loading, error and empty states. */
export function ClippingProjectsGrid({ emptyAction }: ClippingProjectsGridProps) {
  const { data: projects, isLoading, isError, error, refetch } =
    useClippingProjectsQuery();

  // A ref, not state — the effect depends only on `projects`, so a state Set
  // would be stale on every run and the same project could toast twice.
  const handled = useRef(new Set<string>());

  useEffect(() => {
    if (!projects?.length) return;

    let completed = 0;
    let failed = 0;

    projects.forEach((project) => {
      if (isActiveStatus(project.status) || handled.current.has(project.id)) {
        return;
      }
      handled.current.add(project.id);
      if (project.status === "completed") completed += 1;
      if (project.status === "failed") failed += 1;
    });

    if (completed) {
      toast.success(
        completed === 1 ? "Clips are ready" : `${completed} projects finished`,
      );
    }
    if (failed) {
      toast.error(
        failed === 1 ? "A clipping job failed" : `${failed} clipping jobs failed`,
      );
    }
  }, [projects]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse overflow-hidden rounded-2xl border border-blue-400/15 bg-slate-950/60"
          >
            <div className="h-24 bg-blue-500/10" />
            <div className="p-4">
              <div className="h-3 w-1/2 rounded bg-white/10" />
              <div className="mt-2 h-2.5 w-1/3 rounded bg-white/5" />
              <div className="mt-6 h-5 w-2/3 rounded-full bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-blue-400/20 bg-slate-950/40 py-14 text-center backdrop-blur-xl">
        <p className="text-muted-foreground text-sm">
          {error instanceof Error
            ? error.message
            : "Could not load your clipping projects."}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="btn btn-ghost btn-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!projects?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-blue-400/25 bg-slate-950/40 py-16 text-center backdrop-blur-xl">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full border border-blue-300/30 bg-blue-500/15 text-blue-200 shadow-[0_0_30px_-6px_rgba(59,130,246,0.8)]">
          <Scissors className="size-8" />
        </div>
        <h3 className="text-lg font-semibold text-white">No clips yet</h3>
        {emptyAction ?? (
          <>
            <p className="text-muted-foreground mt-1 mb-6 text-sm">
              Paste a video link to get your first set of clips.
            </p>
            <Link href="/clipping-studio" className="btn btn-primary">
              Create clips
            </Link>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <ClippingProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
