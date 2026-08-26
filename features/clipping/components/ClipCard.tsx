"use client";

import { Play } from "lucide-react";
import { VideoClip } from "../types";
import { formatClipDuration } from "../utils";
import { ViralScoreBadge } from "./ViralScoreBadge";

interface ClipCardProps {
  clip: VideoClip;
  onOpen: (clip: VideoClip) => void;
}

export function ClipCard({ clip, onOpen }: ClipCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(clip)}
      className="group border-border bg-card hover:border-white/20 flex cursor-pointer flex-col overflow-hidden rounded-2xl border text-left transition-colors"
    >
      <div className="relative aspect-[9/16] w-full overflow-hidden bg-black">
        {/*
          preload="none" plus the #t=0.1 fragment: the browser seeks to the
          first frame and paints it as a de-facto poster (there is no
          thumbnailUrl on the wire) without downloading the whole clip.
          Play on hover rather than autoplay — 100 autoplaying videos would
          exhaust the browser's decoder budget.
        */}
        <video
          src={`${clip.videoUrl}#t=0.1`}
          preload="none"
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          onMouseOver={(event) => {
            void event.currentTarget.play().catch(() => {});
          }}
          onMouseOut={(event) => event.currentTarget.pause()}
        />

        <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />

        <span className="pointer-events-none absolute top-2 left-2">
          <ViralScoreBadge score={clip.viralScore} />
        </span>

        <span className="pointer-events-none absolute right-2 bottom-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
          {formatClipDuration(clip.videoMsDuration)}
        </span>

        <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <span className="flex size-11 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm">
            <Play className="size-5 fill-white text-white" />
          </span>
        </span>
      </div>

      <div className="flex flex-col gap-1 p-3">
        <p className="text-foreground line-clamp-2 text-xs font-medium">
          {clip.title || "Untitled clip"}
        </p>
        {clip.relatedTopic && (
          <p className="text-muted-foreground truncate text-[11px]">
            {clip.relatedTopic}
          </p>
        )}
      </div>
    </button>
  );
}
