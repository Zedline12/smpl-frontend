"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { Scissors } from "lucide-react";
import { useClippingProjectsQuery } from "../hooks/use-clipping";
import { ClippingProjectCard } from "./ClippingProjectCard";

interface ClippingProjectsGridProps {
  /** What the empty state offers; defaults to a link to the create page. */
  emptyAction?: ReactNode;
}

/** The user's clipping projects, with loading, error and empty states. */
export function ClippingProjectsGrid({ emptyAction }: ClippingProjectsGridProps) {
  const { data: projects, isLoading, isError, error, refetch } =
    useClippingProjectsQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse overflow-hidden rounded-2xl border border-white/15 bg-neutral-950/60"
          >
            <div className="h-24 bg-white/10" />
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
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/20 bg-neutral-950/40 py-14 text-center backdrop-blur-xl">
        <p className="text-white/60 text-sm">
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
      <div className="rounded-2xl border border-dashed border-white/25 bg-neutral-950/40 py-16 text-center backdrop-blur-xl">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white shadow-[0_0_30px_-6px_rgba(255,255,255,0.44)]">
          <Scissors className="size-8" />
        </div>
        <h3 className="text-lg font-semibold text-white">No clips yet</h3>
        {emptyAction ?? (
          <>
            <p className="text-white/60 mt-1 mb-6 text-sm">
              Paste a video link to get your first set of clips.
            </p>
            <Link href="/clipping-studio" className="btn rounded-lg bg-white text-black hover:bg-white/90 shadow-[0_0_24px_-6px_rgba(255,255,255,0.5)]">
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
