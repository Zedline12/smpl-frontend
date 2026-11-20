"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { JobProgress } from "@/features/live/JobProgress";
import { useLiveItem } from "@/features/live/store";
import { cn } from "@/lib/utils";
import type { MyClip } from "../hooks/use-clipping";
import type { ClippingPlatformId } from "../platforms";
import type { VideoClippingProject } from "../types";
import { CLIP_ASPECT, hostnameOf } from "../utils";
import { ClipCard } from "./ClipCard";
import { ClipPreviewDialog } from "./ClipPreviewDialog";

export const CLIP_GRID_CLASS =
  "grid grid-cols-2 items-start gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

/** Clips from any number of projects; clicking one opens it with its post copy. */
export function ClipTiles({
  items,
  platform,
  className,
}: {
  items: MyClip[];
  /** The category being shown: its captions tab opens first. */
  platform?: ClippingPlatformId;
  className?: string;
}) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const keyOf = (item: MyClip) =>
    `${item.projectId}:${item.clip.providerVideoId}`;
  const open = items.find((item) => keyOf(item) === openKey) ?? null;
  const platforms = open
    ? platform && open.platforms.includes(platform)
      ? [platform, ...open.platforms.filter((p) => p !== platform)]
      : open.platforms
    : [];

  return (
    <>
      <div className={cn(CLIP_GRID_CLASS, className)}>
        {items.map((item) => (
          <ClipCard
            key={keyOf(item)}
            clip={item.clip}
            aspect={CLIP_ASPECT[item.ratio] ?? "9/16"}
            onOpen={() => setOpenKey(keyOf(item))}
          />
        ))}
      </div>
      <ClipPreviewDialog
        projectId={open?.projectId ?? ""}
        clip={open?.clip ?? null}
        platforms={platforms}
        open={!!open}
        onClose={() => setOpenKey(null)}
        projectHref={open ? `/clipping-studio/${open.projectId}` : undefined}
      />
    </>
  );
}

/** A project still being clipped, linking to its page. */
export function RunningClipTile({
  project,
}: {
  project: VideoClippingProject;
}) {
  const live = useLiveItem("clipping", project.id);
  const title =
    project.projectName?.trim() ||
    (project.sourceKind === "upload"
      ? "Uploaded video"
      : hostnameOf(project.originalVideoUrl));

  return (
    <Link
      href={`/clipping-studio/${project.id}`}
      className="flex aspect-[9/16] flex-col justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3 transition-colors hover:border-white/20"
    >
      <span className="flex items-center gap-1.5 text-xs font-medium text-white/70">
        <Loader2 className="size-3.5 animate-spin" />
        {project.status === "pending" ? "Queued" : "Clipping…"}
      </span>
      <span className="flex flex-col gap-2">
        <span className="line-clamp-2 text-sm font-semibold break-words text-white">
          {title}
        </span>
        <JobProgress
          size="sm"
          job={{
            status: live?.status ?? project.status,
            createdAt: project.createdAt,
            startedAt:
              live?.startedAt ??
              project.outputs?.[0]?.startedAt ??
              project.createdAt,
            estimatedSeconds:
              live?.estimatedSeconds ?? project.estimatedSeconds,
          }}
        />
      </span>
    </Link>
  );
}

export function ClipTileSkeleton() {
  return (
    <div className="aspect-[9/16] animate-pulse rounded-2xl bg-white/[0.05]" />
  );
}
