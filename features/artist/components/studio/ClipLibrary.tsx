"use client";
import { useState } from "react";
import { Clapperboard, Download, Sparkles } from "lucide-react";
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

const PAGE_SIZE = 12;
const GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

/** The user's video clips (and the ones being made), below the clip inputs. */
export function ClipLibrary() {
  const query = useInfiniteMediaQuery({
    type: "video",
    filters: createMediaFilters(CLIP_MODEL),
    limit: PAGE_SIZE,
  });
  const clips = (query.data?.pages.flatMap((p) => p.data ?? []) ?? []).filter(
    (m) => m.type === "video",
  );
  const { running, failed, dismiss } = useArtistQueues("video");
  const download = useDownloadMedia();
  const recreate = useRecreateMedia();
  const [playing, setPlaying] = useState<string | null>(null);

  const loading = !query.isFetched && running.length === 0;

  return (
    <section className="flex flex-col gap-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
        <Clapperboard className="size-4" /> Your video clips
      </h2>

      {loading ? (
        <div className={GRID}>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="aspect-[9/16] animate-pulse rounded-2xl bg-white/[0.05]" />
          ))}
        </div>
      ) : clips.length === 0 && running.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/10 py-14 text-center text-sm text-white/45">
          No clips yet. Pick a song part, your character and a style above.
        </p>
      ) : (
        <div className={GRID}>
          {running.map((queue) => (
            <div key={queue.id} className="aspect-[9/16] overflow-hidden rounded-2xl border border-primary/25">
              <QueuedGenerationTile queue={queue} fill />
            </div>
          ))}
          {clips.map((m) => (
            <div
              key={m.id}
              className="group relative aspect-[9/16] overflow-hidden rounded-2xl border border-white/[0.07] bg-black/40"
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

      {query.hasNextPage && clips.length > 0 && (
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
              <AlertDialogTitle>{failed.failedMeta?.category ?? "Generation Failed"}</AlertDialogTitle>
              <AlertDialogDescription>
                {failed.failedMeta?.clientMessage ?? "An unknown error occurred during generation."}
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
