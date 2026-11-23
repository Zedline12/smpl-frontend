"use client";
import { ArrowRight, Download, Heart, Music2, Sparkles } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { QueuedGenerationTile } from "@/features/media/components/QueuedGenerationTile";
import {
  useDownloadMedia,
  useRecreateMedia,
  useToggleLikeMutation,
} from "@/features/media/hooks/useMediaActions";
import { useInfiniteMediaQuery } from "@/features/media/queries/media";
import { Media } from "@/features/media/types/media";
import { createMediaFilters } from "@/features/media/types/media-filters";
import { cn } from "@/lib/utils";
import { useArtistQueues } from "../../hooks/useArtistQueues";
import { SONG_MODEL } from "../../hooks/useSongBuilder";
import {
  Track,
  useArtistPlayerStore,
  useCurrentTrack,
} from "../../stores/useArtistPlayerStore";
import { mediaToTrack } from "../../utils/song-meta";
import { useArtistSection } from "./ArtistModeSwitch";
import { shelfCard, SongCard } from "./SongCard";

const PAGE_SIZE = 18;
/** Home shows only the latest few (the generating ones count too). */
export const RECENT_COUNT = 5;
const SONG_GRID =
  "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6";

interface SongItem {
  track: Track;
  media: Media;
}

/**
 * The user's songs. Home: the latest 5 with "See all"; `full`: the "Your songs" page,
 * every song with "Show more".
 */
export function ArtistLibrary({ full }: { full?: boolean } = {}) {
  const model = SONG_MODEL;
  const [, setSection] = useArtistSection();

  const historyQuery = useInfiniteMediaQuery({
    filters: createMediaFilters(model),
    limit: full ? PAGE_SIZE : RECENT_COUNT,
  });
  const active = historyQuery;
  const media = historyQuery.data?.pages.flatMap((p) => p.data ?? []) ?? [];

  const { running, failed, dismiss } = useArtistQueues("audio");

  const current = useCurrentTrack();
  const playing = useArtistPlayerStore((s) => s.playing);
  const playQueue = useArtistPlayerStore((s) => s.playQueue);
  const toggle = useArtistPlayerStore((s) => s.toggle);
  const setLiked = useArtistPlayerStore((s) => s.setLiked);
  const recreate = useRecreateMedia();
  const download = useDownloadMedia();
  const toggleLike = useToggleLikeMutation();

  const allItems: SongItem[] = media
    .filter((m) => m.type === "audio")
    .map((m) => ({ track: mediaToTrack(m), media: m }));
  // Home: the generating songs first, then the newest, 5 in all.
  const songItems = full ? allItems : allItems.slice(0, Math.max(0, RECENT_COUNT - running.length));
  const runningShown = full ? running : running.slice(0, RECENT_COUNT);
  const tracks = songItems.map((i) => i.track);

  const shown = songItems.length;
  const loading = !active.isFetched || (active.isFetching && shown === 0);
  const showRunning = runningShown.length > 0;

  const playAt = (index: number) => {
    if (current?.id === tracks[index].id) toggle();
    else playQueue(tracks, index);
  };

  const songMenu = ({ media: m }: SongItem) => (
    <>
      <DropdownMenuItem
        onSelect={() => {
          toggleLike.mutate({ id: m.id, liked: !m.liked });
          setLiked(m.id, !m.liked);
        }}
      >
        <Heart className={cn("size-4", m.liked && "fill-secondary text-secondary")} />
        {m.liked ? "Unlike" : "Like"}
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => download([m])}>
        <Download className="size-4" /> Download
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => recreate(m)}>
        <Sparkles className="size-4" /> Recreate
      </DropdownMenuItem>
    </>
  );

  return (
    <section className="flex flex-col gap-5">
      {full ? (
        <h2 className="flex items-center gap-2 text-xl font-bold text-white">
          <Music2 className="size-5" /> Your songs
        </h2>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-base font-semibold text-white">
            <Music2 className="size-4" /> Recent songs
          </h2>
          {shown > 0 && (
            <button
              type="button"
              onClick={() => setSection("songs")}
              className="flex items-center gap-1 text-sm font-medium text-white/55 transition-colors hover:text-white"
            >
              See all <ArrowRight className="size-4" />
            </button>
          )}
        </div>
      )}

      {loading && !showRunning ? (
        <div className={SONG_GRID}>
          {Array.from({ length: full ? 6 : RECENT_COUNT }, (_, i) => (
            <div key={i} className={cn(shelfCard, "border-white/[0.05] bg-white/[0.03]")}>
              <div className="aspect-square w-full animate-pulse rounded-xl bg-white/[0.06]" />
              <div className="h-8 w-2/3 animate-pulse rounded bg-white/[0.05]" />
            </div>
          ))}
        </div>
      ) : shown === 0 && !showRunning ? (
        <p className="rounded-2xl border border-dashed border-white/10 py-14 text-center text-sm text-white/45">
          {full ? "No songs yet. Make one from Home." : "No songs yet. Describe one above and hit Generate."}
        </p>
      ) : (
        <div className={SONG_GRID}>
          {runningShown.map((queue) => (
            <div key={queue.id} className={cn(shelfCard, "border-primary/25 bg-primary/[0.05]")}>
              <div className="aspect-square w-full">
                <QueuedGenerationTile queue={queue} variant="music" fill />
              </div>
              <span className="truncate px-0.5 text-sm font-semibold text-white/70">Generating…</span>
            </div>
          ))}

          {songItems.map((item, i) => (
            <SongCard
              key={item.track.id}
              track={item.track}
              current={current?.id === item.track.id}
              playing={playing}
              onPlay={() => playAt(i)}
              menu={songMenu(item)}
            />
          ))}
        </div>
      )}

      {full && active.hasNextPage && shown > 0 && (
        <button
          type="button"
          onClick={() => active.fetchNextPage()}
          disabled={active.isFetchingNextPage}
          className="self-center rounded-full border border-white/15 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:opacity-50"
        >
          {active.isFetchingNextPage ? "Loading…" : "Show more"}
        </button>
      )}

      {failed && (
        <AlertDialog open onOpenChange={(open) => !open && dismiss(failed.id)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {failed.failedMeta?.category ?? "Generation Failed"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {failed.failedMeta?.clientMessage ??
                  "An unknown error occurred during generation."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => dismiss(failed.id)}>
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </section>
  );
}
