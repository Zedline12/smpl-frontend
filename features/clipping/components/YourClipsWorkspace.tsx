"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Scissors } from "lucide-react";
import { useClippingProjectsQuery } from "../hooks/use-clipping";
import { isActiveStatus } from "../types";
import { ClippingProjectCard } from "./ClippingProjectCard";

export function YourClipsWorkspace() {
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

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-5 md:p-8">
      <header>
        <h1 className="text-foreground text-2xl font-bold">Your Clips</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Every video you&apos;ve clipped, and anything still processing.
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
      ) : !projects?.length ? (
        <div className="border-border bg-card rounded-2xl border border-dashed py-16 text-center">
          <div className="bg-muted text-muted-foreground mx-auto mb-4 flex size-16 items-center justify-center rounded-full">
            <Scissors className="size-8" />
          </div>
          <h3 className="text-foreground text-lg font-semibold">
            No clips yet
          </h3>
          <p className="text-muted-foreground mt-1 mb-6 text-sm">
            Paste a video link to get your first set of clips.
          </p>
          <Link href="/clipping-studio" className="btn btn-primary">
            Create clips
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ClippingProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
