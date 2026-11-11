"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp, Bookmark, CheckSquare, Download, Film, Loader2, X } from "lucide-react";
import { StyleMenuButton } from "@/features/artist/components/StyleMenuButton";
import { cn } from "@/lib/utils";
import { downloadClipsZip } from "../api";
import { useSaveClipsMutation } from "../hooks/use-clipping";
import { VideoClip } from "../types";
import { parseViralScore } from "../utils";
import { ClipCard } from "./ClipCard";
import { ClipPreviewDialog } from "./ClipPreviewDialog";

/** Only mount this many <video> elements up front; a project can hold 100. */
const INITIAL_VISIBLE = 12;
const PAGE_SIZE = 12;

type Sort = "score" | "short" | "long" | "original";
const SORT_OPTIONS = [
  { id: "score", label: "Viral score" },
  { id: "short", label: "Shortest first" },
  { id: "long", label: "Longest first" },
  { id: "original", label: "Original order" },
];
const SCORE_OPTIONS = [
  { id: "0", label: "All scores" },
  { id: "50", label: "Score 50+" },
  { id: "80", label: "Score 80+" },
];
const MENU_TRIGGER = "h-9 bg-transparent hover:bg-transparent data-[state=open]:bg-transparent";

const score = (c: VideoClip) => c.viralScoreNum ?? parseViralScore(c.viralScore) ?? -1;

interface ClipGridProps {
  projectId: string;
  clips: VideoClip[];
  /** Platforms these clips are for (post copy tabs). */
  platforms: string[];
  /** CSS aspect-ratio of the clips, e.g. "9/16". */
  aspect?: string;
}

export function ClipGrid({ projectId, clips, platforms, aspect = "9/16" }: ClipGridProps) {
  const [visible, setVisible] = useState(INITIAL_VISIBLE);
  const [openId, setOpenId] = useState<number | null>(null);
  const [sort, setSort] = useState<Sort>("score");
  const [minScore, setMinScore] = useState(0);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const save = useSaveClipsMutation(projectId);

  const sorted = useMemo(() => {
    const list = clips.filter((c) => minScore === 0 || score(c) >= minScore);
    if (sort === "score") return [...list].sort((a, b) => score(b) - score(a));
    if (sort === "short") return [...list].sort((a, b) => a.videoMsDuration - b.videoMsDuration);
    if (sort === "long") return [...list].sort((a, b) => b.videoMsDuration - a.videoMsDuration);
    return list;
  }, [clips, sort, minScore]);

  // The dialog reads the live clip so regenerated captions / saves show at once.
  const openClip = clips.find((c) => c.providerVideoId === openId) ?? null;

  if (!clips.length) {
    return (
      <div className="border-border bg-card rounded-2xl border border-dashed py-16 text-center">
        <div className="bg-muted text-white/60 mx-auto mb-4 flex size-16 items-center justify-center rounded-full">
          <Film className="size-8" />
        </div>
        <h3 className="text-white text-lg font-semibold">No clips yet</h3>
        <p className="text-white/60 mt-1 text-sm">This finished without producing any clips.</p>
      </div>
    );
  }

  const shown = sorted.slice(0, visible);
  const selectedIds = [...selected];
  const toggle = (clip: VideoClip) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(clip.providerVideoId)) next.delete(clip.providerVideoId);
      else next.add(clip.providerVideoId);
      return next;
    });
  const exitSelect = () => {
    setSelectMode(false);
    setSelected(new Set());
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="w-44">
          <StyleMenuButton
            icon={ArrowDownUp}
            label="Sort"
            options={SORT_OPTIONS}
            selected={[sort]}
            max={1}
            triggerClassName={MENU_TRIGGER}
            onChange={([v]) => v && setSort(v as Sort)}
          />
        </div>
        <div className="w-40">
          <StyleMenuButton
            icon={Film}
            label="Show"
            options={SCORE_OPTIONS}
            selected={[String(minScore)]}
            max={1}
            triggerClassName={MENU_TRIGGER}
            onChange={([v]) => v && setMinScore(Number(v))}
          />
        </div>
        <span className="text-xs text-white/45">
          {sorted.length} of {clips.length} clips
        </span>

        <div className="ml-auto flex items-center gap-2">
          {selectMode ? (
            <>
              <button
                type="button"
                onClick={() =>
                  setSelected(selected.size === sorted.length ? new Set() : new Set(sorted.map((c) => c.providerVideoId)))
                }
                className="rounded-lg px-2.5 py-1.5 text-xs text-white/70 hover:text-white"
              >
                {selected.size === sorted.length ? "Clear" : "Select all"}
              </button>
              <button
                type="button"
                disabled={!selected.size}
                onClick={() => downloadClipsZip(projectId, selectedIds)}
                className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
              >
                <Download className="size-3.5" /> Download ({selected.size})
              </button>
              <button
                type="button"
                disabled={!selected.size || save.isPending}
                onClick={() => save.mutate(selectedIds, { onSuccess: exitSelect })}
                className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-40"
              >
                {save.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Bookmark className="size-3.5" />}
                Save to library ({selected.size})
              </button>
              <button
                type="button"
                onClick={exitSelect}
                aria-label="Stop selecting"
                className="flex size-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => downloadClipsZip(projectId, sorted.map((c) => c.providerVideoId))}
                className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/5"
              >
                <Download className="size-3.5" /> Download all
              </button>
              <button
                type="button"
                onClick={() => setSelectMode(true)}
                className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/5"
              >
                <CheckSquare className="size-3.5" /> Select
              </button>
            </>
          )}
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="py-10 text-center text-sm text-white/50">No clips match this filter.</p>
      ) : (
        <div
          className={cn(
            "grid gap-4",
            aspect === "16/9" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-2 md:grid-cols-3 xl:grid-cols-4",
          )}
        >
          {shown.map((clip, i) => (
            <ClipCard
              key={clip.providerVideoId}
              clip={clip}
              aspect={aspect}
              rank={sort === "score" ? i + 1 : undefined}
              onOpen={(c) => setOpenId(c.providerVideoId)}
              selectMode={selectMode}
              selected={selected.has(clip.providerVideoId)}
              onToggleSelect={toggle}
            />
          ))}
        </div>
      )}

      {visible < sorted.length && (
        <div className="flex flex-col items-center gap-2 pt-2">
          <p className="text-white/60 text-sm">
            Showing {shown.length} of {sorted.length}
          </p>
          <button type="button" onClick={() => setVisible((current) => current + PAGE_SIZE)} className="btn btn-ghost btn-sm">
            Show more
          </button>
        </div>
      )}

      <ClipPreviewDialog
        projectId={projectId}
        clip={openClip}
        platforms={platforms}
        open={!!openClip}
        onClose={() => setOpenId(null)}
      />
    </>
  );
}
