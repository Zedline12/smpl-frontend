"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  ExternalLink,
  Film,
  Loader2,
  Trash2,
} from "lucide-react";
import { ClipGrid } from "@/features/clipping/components/ClipGrid";
import { ShapeGlyph } from "@/features/clipping/components/CreateClippingForm";
import {
  useClippingProjectQuery,
  useDeleteClippingProjectMutation,
} from "@/features/clipping/hooks/use-clipping";
import { isActiveStatus, VideoClippingOutput } from "@/features/clipping/types";
import { hostnameOf, languageLabel, videoTypeLabel } from "@/features/clipping/utils";
import { ClippingPlatformId, PLATFORM_BY_ID, PlatformIcon, SHAPES } from "@/features/clipping/platforms";
import { cn } from "@/lib/utils";
import { JobProgress } from "@/features/live/JobProgress";

const ASPECT: Record<number, string> = { 1: "9/16", 2: "1/1", 3: "4/5", 4: "16/9" };

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

/** Platforms an output's clips are for (older projects have none: use the shape's usual ones). */
function outputPlatforms(output: VideoClippingOutput): ClippingPlatformId[] {
  if (output.platforms?.length) return output.platforms as ClippingPlatformId[];
  const defaults: Record<number, ClippingPlatformId[]> = {
    1: ["tiktok", "instagram_reels", "youtube_shorts"],
    2: ["linkedin", "x"],
    3: ["instagram_reels"],
    4: ["youtube"],
  };
  return defaults[output.ratio] ?? [];
}

function OutputStatus({ output, estimatedSeconds }: { output: VideoClippingOutput; estimatedSeconds?: number | null }) {
  if (isActiveStatus(output.status)) {
    return (
      <div className="border-border bg-card flex items-center gap-3 rounded-2xl border p-4">
        {output.status === "pending" ? (
          <Clock className="text-white/60 size-5 shrink-0" />
        ) : (
          <Loader2 className="text-white size-5 shrink-0 animate-spin" />
        )}
        <div>
          <p className="text-white text-sm font-medium">
            {output.status === "pending" ? "Waiting to start" : `Creating your ${SHAPES[output.ratio]?.label} clips…`}
          </p>
          <p className="text-white/60 mt-0.5 text-xs">This page updates on its own — no need to refresh.</p>
          <JobProgress
            className="mt-3 w-64 max-w-full"
            job={{ status: output.status, startedAt: output.startedAt, estimatedSeconds }}
          />
        </div>
      </div>
    );
  }
  if (output.status === "failed") {
    return (
      <div className="flex items-start gap-2 rounded-2xl bg-red-500/10 p-4">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-400" />
        <p className="text-sm leading-snug text-red-400">
          {output.errorMessage || "These clips could not be made."}
        </p>
      </div>
    );
  }
  return null;
}

export default function ClippingProjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: project, isLoading, isError, error } = useClippingProjectQuery(id);
  const remove = useDeleteClippingProjectMutation();
  const [tab, setTab] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isLoading) return <ProjectSkeleton />;

  if (isError || !project) {
    return (
      <div className="mx-auto max-w-6xl p-5 md:p-8">
        <Link
          href="/clipping-studio"
          className="text-white/60 hover:text-white mb-6 inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to projects
        </Link>
        <p className="text-white/60 text-sm">
          {error instanceof Error ? error.message : "This clipping project could not be found."}
        </p>
      </div>
    );
  }

  const host = hostnameOf(project.originalVideoUrl);
  const title =
    project.projectName?.trim() || (project.sourceKind === "upload" ? "Uploaded video" : host);
  const outputs = project.outputs ?? [];
  const current = outputs[Math.min(tab, outputs.length - 1)];
  const totalClips = outputs.reduce((n, o) => n + o.clips.length, 0);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-5 md:p-8">
      <Link
        href="/clipping-studio"
        className="text-white/60 hover:text-white inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to projects
      </Link>

      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-white text-2xl font-bold">{title}</h1>
          {project.sourceKind !== "upload" && (
            <a
              href={project.originalVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white inline-flex items-center gap-1 text-xs transition-colors"
            >
              <ExternalLink className="size-3.5" />
              Source
            </a>
          )}
          <div className="ml-auto">
            {confirmDelete ? (
              <span className="flex items-center gap-2 text-xs text-white/70">
                Delete this project?
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-lg px-2 py-1 text-white/60 hover:text-white"
                >
                  No
                </button>
                <button
                  type="button"
                  disabled={remove.isPending}
                  onClick={() => remove.mutate(project.id, { onSuccess: () => router.push("/clipping-studio") })}
                  className="rounded-lg bg-red-500/90 px-2.5 py-1 font-semibold text-white disabled:opacity-50"
                >
                  Delete
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-white/50 transition-colors hover:bg-white/5 hover:text-red-300"
              >
                <Trash2 className="size-3.5" /> Delete
              </button>
            )}
          </div>
        </div>

        <div className="text-white/60 flex flex-wrap items-center gap-2 text-sm">
          <span className="bg-muted inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium">
            <Film className="size-3" />
            {totalClips} clips
          </span>
          <span className="bg-muted rounded-full px-2.5 py-0.5 text-[11px] font-medium">
            {languageLabel(project.lang)}
          </span>
          <span className="bg-muted rounded-full px-2.5 py-0.5 text-[11px] font-medium">
            {project.sourceKind === "upload" ? "Upload" : videoTypeLabel(project.videoType)}
          </span>
        </div>
      </header>

      {/* One tab per shape */}
      {outputs.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {outputs.map((o, i) => (
            <button
              key={o.providerProjectId}
              type="button"
              onClick={() => setTab(i)}
              className={cn(
                "flex items-center gap-2.5 rounded-xl border px-3.5 py-2 text-left transition-colors",
                i === tab ? "border-white/60 bg-white/10" : "border-white/10 hover:border-white/25",
              )}
            >
              <ShapeGlyph ratio={o.ratio} />
              <span>
                <span className="block text-sm font-semibold text-white">
                  {SHAPES[o.ratio]?.name} {SHAPES[o.ratio]?.label}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-white/50">
                  {outputPlatforms(o).map((p) => (
                    <PlatformIcon key={p} id={p} className="size-3" />
                  ))}
                  <span className="ml-1">
                    {o.status === "completed"
                      ? `${o.clips.length} clips`
                      : o.status === "failed"
                        ? "Failed"
                        : "Working…"}
                  </span>
                </span>
              </span>
              {isActiveStatus(o.status) && <Loader2 className="size-3.5 animate-spin text-white/60" />}
            </button>
          ))}
        </div>
      )}

      {current && (
        <>
          {outputs.length === 1 && (
            <p className="flex items-center gap-2 text-xs text-white/50">
              <ShapeGlyph ratio={current.ratio} />
              {SHAPES[current.ratio]?.name} {SHAPES[current.ratio]?.label} for{" "}
              {outputPlatforms(current)
                .map((p) => PLATFORM_BY_ID[p]?.label)
                .join(", ")}
            </p>
          )}
          <OutputStatus output={current} estimatedSeconds={project.estimatedSeconds} />
          {current.status === "completed" && (
            <ClipGrid
              key={current.providerProjectId}
              projectId={project.id}
              clips={current.clips}
              platforms={outputPlatforms(current)}
              aspect={ASPECT[current.ratio] ?? "9/16"}
            />
          )}
        </>
      )}
    </div>
  );
}
