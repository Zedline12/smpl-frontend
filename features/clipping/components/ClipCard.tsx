"use client";

import { Bookmark, Check, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { VideoClip } from "../types";
import { formatClipDuration } from "../utils";
import { ViralScoreBadge } from "./ViralScoreBadge";

interface ClipCardProps {
  clip: VideoClip;
  onOpen: (clip: VideoClip) => void;
  /** CSS aspect-ratio of the clip, e.g. "9/16". */
  aspect?: string;
  /** Position when sorted by score (1 = best). */
  rank?: number;
  selectMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (clip: VideoClip) => void;
}

export function ClipCard({
  clip,
  onOpen,
  aspect = "9/16",
  rank,
  selectMode,
  selected,
  onToggleSelect,
}: ClipCardProps) {
  const handleClick = () => (selectMode ? onToggleSelect?.(clip) : onOpen(clip));

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={selectMode ? selected : undefined}
      className={cn(
        "group bg-card flex cursor-pointer flex-col overflow-hidden rounded-2xl border text-left transition-colors",
        selected ? "border-white/70 ring-1 ring-white/50" : "border-border hover:border-white/20",
      )}
    >
      <div className="relative w-full overflow-hidden bg-black" style={{ aspectRatio: aspect }}>
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

        <span className="pointer-events-none absolute top-2 left-2 flex items-center gap-1.5">
          {rank !== undefined && (
            <span className="rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm">
              #{rank}
            </span>
          )}
          <ViralScoreBadge score={clip.viralScore} />
        </span>

        {selectMode ? (
          <span
            className={cn(
              "absolute top-2 right-2 flex size-6 items-center justify-center rounded-full border-2 transition-colors",
              selected ? "border-white bg-white text-black" : "border-white/70 bg-black/40",
            )}
          >
            {selected && <Check className="size-3.5" strokeWidth={3} />}
          </span>
        ) : (
          clip.savedMediaId && (
            <span
              title="Saved to your library"
              className="pointer-events-none absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm"
            >
              <Bookmark className="size-3 fill-white" /> Saved
            </span>
          )
        )}

        <span className="pointer-events-none absolute right-2 bottom-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
          {formatClipDuration(clip.videoMsDuration)}
        </span>

        {!selectMode && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
            <span className="flex size-11 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm">
              <Play className="size-5 fill-white text-white/80" />
            </span>
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1 p-3">
        <p className="text-white line-clamp-2 text-xs font-medium">{clip.title || "Untitled clip"}</p>
        {clip.relatedTopic && <p className="text-white/60 truncate text-[11px]">{clip.relatedTopic}</p>}
      </div>
    </button>
  );
}
