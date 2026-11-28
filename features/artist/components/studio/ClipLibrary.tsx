"use client";
import { failureCodeLabel, failureMessage, failureTitle } from "@/lib/failure";
import { useState } from "react";
import { ArrowRight, Clapperboard, Download, Sparkles } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { QueuedGenerationTile } from "@/features/media/components/QueuedGenerationTile";
import {
  useDownloadMedia,
  useRecreateMedia,
} from "@/features/media/hooks/useMediaActions";
import { useInfiniteMediaQuery } from "@/features/media/queries/media";
import { createMediaFilters } from "@/features/media/types/media-filters";
import { CLIP_MODEL } from "../../hooks/useVideoClipBuilder";
import { useArtistQueues } from "../../hooks/useArtistQueues";
import { RECENT_COUNT } from "./ArtistLibrary";
import { useArtistSection } from "./ArtistModeSwitch";

const PAGE_SIZE = 12;
const GRID = "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

/**
 * The user's video clips (and the ones being made). Home: the latest 5 with "See all";
 * `full`: the "Your clips" page, every clip with "Show more".
 */
export function ClipLibrary({ full }: { full?: boolean } = {}) {
  const [, setSection] = useArtistSection();
  const query = useInfiniteMediaQuery({
    type: "video",
    filters: createMediaFilters(CLIP_MODEL),
    limit: full ? PAGE_SIZE : RECENT_COUNT,
  });
  const allClips = (query.data?.pages.flatMap((p) => p.data ?? []) ?? []).filter(
    (m) => m.type === "video",
  );
  const { running: allRunning, failed, dismiss } = useArtistQueues("video");
  // Home: the generating clips first, then the newest, 5 in all.
  const running = full ? allRunning : allRunning.slice(0, RECENT_COUNT);
  const clips = full ? allClips : allClips.slice(0, Math.max(0, RECENT_COUNT - running.length));
  const download = useDownloadMedia();
  const recreate = useRecreateMedia();
  const [playing, setPlaying] = useState<string | null>(null);

  const loading = !query.isFetched && running.length === 0;

  return (
    <section className="flex flex-col gap-5">
      {full ? (
        <h2 className="flex items-center gap-2 text-xl font-bold text-white">
          <Clapperboard className="size-5" /> Your clips
        </h2>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-base font-semibold text-white">
            <Clapperboard className="size-4" /> Recent clips
          </h2>
          {clips.length > 0 && (
            <button
              type="button"
              onClick={() => setSection("clips")}
              className="flex items-center gap-1 text-sm font-medium text-white/55 transition-colors hover:text-white"
            >
              See all <ArrowRight className="size-4" />
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className={GRID}>
          {Array.from({ length: full ? 4 : RECENT_COUNT }, (_, i) => (
            <div key={i} className="aspect-video animate-pulse rounded-2xl bg-white/[0.05]" />
          ))}
        </div>
      ) : clips.length === 0 && running.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/10 py-14 text-center text-sm text-white/45">
          {full ? "No clips yet. Make one from Home." : "No clips yet. Pick a clip type and a song part above."}
        </p>
      ) : (
        <div className={GRID}>
          {running.map((queue) => (
            <div key={queue.id} className="aspect-video overflow-hidden rounded-2xl border border-primary/25">
              <QueuedGenerationTile queue={queue} fill />
            </div>
          ))}
          {clips.map((m) => (
            <div
              key={m.id}
              className="group relative aspect-video overflow-hidden rounded-2xl border border-white/[0.07] bg-black/40"
            >
              <video
                src={m.url}
                preload="metadata"
                playsInline
                loop
                controls={playing === m.id}
                onPlay={() => setPlaying(m.id)}
                onClick={(e) => {
                  const v = e.currentTarget;
                  if (v.paused) void v.play();
                  else v.pause();
                }}
                className="h-full w-full cursor-pointer object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-1.5 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => download([m])}
                  aria-label="Download"
                  className="flex size-8 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
                >
                  <Download className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => recreate(m)}
                  aria-label="Recreate"
                  className="flex size-8 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
                >
                  <Sparkles className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {full && query.hasNextPage && clips.length > 0 && (
        <button
          type="button"
          onClick={() => query.fetchNextPage()}
          disabled={query.isFetchingNextPage}
          className="self-center rounded-full border border-white/15 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:opacity-50"
        >
          {query.isFetchingNextPage ? "Loading…" : "Show more"}
        </button>
      )}

      {failed && (
        <AlertDialog open onOpenChange={(open) => !open && dismiss(failed.id)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{failureTitle(failed.failedMeta)}</AlertDialogTitle>
              <AlertDialogDescription>
                {failureMessage(failed.failedMeta)}
                {failureCodeLabel(failed.failedMeta?.code) && (
                  <span className="mt-2 block text-xs text-white/40">{failureCodeLabel(failed.failedMeta?.code)}</span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => dismiss(failed.id)}>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </section>
  );
}
