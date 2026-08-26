"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  ExternalLink,
  Film,
  Loader2,
} from "lucide-react";
import { ClipGrid } from "@/features/clipping/components/ClipGrid";
import { useClippingProjectQuery } from "@/features/clipping/hooks/use-clipping";
import { isActiveStatus } from "@/features/clipping/types";
import {
  hostnameOf,
  languageLabel,
  ratioLabel,
  videoTypeLabel,
} from "@/features/clipping/utils";

function ProjectSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-8 p-5 md:p-8">
      <div className="space-y-3">
        <div className="bg-muted h-8 w-64 rounded-lg" />
        <div className="flex gap-2">
          <div className="bg-muted h-6 w-20 rounded-full" />
          <div className="bg-muted h-6 w-20 rounded-full" />
          <div className="bg-muted h-6 w-20 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-muted aspect-[9/16] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function ClippingProjectPage() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading, isError, error } =
    useClippingProjectQuery(id);

  if (isLoading) return <ProjectSkeleton />;

  if (isError || !project) {
    return (
      <div className="mx-auto max-w-6xl p-5 md:p-8">
        <Link
          href="/clipping-studio/your-clips"
          className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to projects
        </Link>
        <p className="text-muted-foreground text-sm">
          {error instanceof Error
            ? error.message
            : "This clipping project could not be found."}
        </p>
      </div>
    );
  }

  const host = hostnameOf(project.originalVideoUrl);
  const title = project.projectName?.trim() || host;
  const active = isActiveStatus(project.status);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-5 md:p-8">
      <Link
        href="/clipping-studio/your-clips"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to projects
      </Link>

      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-foreground text-2xl font-bold">{title}</h1>
          <a
            href={project.originalVideoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs transition-colors"
          >
            <ExternalLink className="size-3.5" />
            Source
          </a>
        </div>

        <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
          <span className="bg-muted inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium">
            <Film className="size-3" />
            {project.clips?.length ?? 0} clips
          </span>
          <span className="bg-muted rounded-full px-2.5 py-0.5 text-[11px] font-medium">
            {ratioLabel(project.ratioOfClip)}
          </span>
          <span className="bg-muted rounded-full px-2.5 py-0.5 text-[11px] font-medium">
            {languageLabel(project.lang)}
          </span>
          <span className="bg-muted rounded-full px-2.5 py-0.5 text-[11px] font-medium">
            {videoTypeLabel(project.videoType)}
          </span>
        </div>
      </header>

      {active && (
        <div className="border-border bg-card flex items-center gap-3 rounded-2xl border p-4">
          {project.status === "pending" ? (
            <Clock className="text-muted-foreground size-5 shrink-0" />
          ) : (
            <Loader2 className="text-primary size-5 shrink-0 animate-spin" />
          )}
          <div>
            <p className="text-foreground text-sm font-medium">
              {project.status === "pending"
                ? "Waiting to start"
                : "Creating your clips…"}
            </p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              This page updates on its own — no need to refresh.
            </p>
          </div>
        </div>
      )}

      {project.status === "failed" && (
        <div className="flex items-start gap-2 rounded-2xl bg-red-500/10 p-4">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-400" />
          <p className="text-sm leading-snug text-red-400">
            {project.errorMessage || "This video could not be clipped."}
          </p>
        </div>
      )}

      {!active && project.status !== "failed" && (
        <ClipGrid clips={project.clips ?? []} />
      )}
    </div>
  );
}
