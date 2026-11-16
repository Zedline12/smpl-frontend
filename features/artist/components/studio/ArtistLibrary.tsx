"use client";
import { useState } from "react";
import {
  Compass,
  Download,
  Heart,
  History as HistoryIcon,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
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
import {
  useInfiniteMediaQuery,
  useInfiniteTemplatesQuery,
} from "@/features/media/queries/media";
import { Media } from "@/features/media/types/media";
import { createMediaFilters } from "@/features/media/types/media-filters";
import { templateAsMedia } from "@/features/templates/recreate";
import { Template } from "@/features/templates/types";
import { cn } from "@/lib/utils";
import { useArtistQueues } from "../../hooks/useArtistQueues";
import { SONG_MODEL } from "../../hooks/useSongBuilder";
import {
  Track,
  useArtistPlayerStore,
  useCurrentTrack,
} from "../../stores/useArtistPlayerStore";
import { mediaToTrack, templateToTrack } from "../../utils/song-meta";
import { shelfCard, SongCard } from "./SongCard";

type View = "explore" | "history";

const VIEWS: { value: View; label: string; icon: LucideIcon }[] = [
  { value: "explore", label: "Explore", icon: Compass },
  { value: "history", label: "History", icon: HistoryIcon },
];

const PAGE_SIZE = 18;
const SONG_GRID =
  "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6";

interface SongItem {
  track: Track;
  media?: Media;
  template?: Template;
}

/** Explore (example songs) and History (the user's songs) below the settings. */
export function ArtistLibrary() {
  const [view, setView] = useState<View>("explore");

  const model = SONG_MODEL;
  const isExplore = view === "explore";

  const templatesQuery = useInfiniteTemplatesQuery(
    undefined,
    model,
    isExplore,
    PAGE_SIZE,
  );
  const historyQuery = useInfiniteMediaQuery({
    filters: createMediaFilters(model),
    limit: PAGE_SIZE,
    enabled: !isExplore,
  });
  const active = isExplore ? templatesQuery : historyQuery;
  const templates =
    templatesQuery.data?.pages.flatMap((p) => p.data ?? []) ?? [];
  const media = historyQuery.data?.pages.flatMap((p) => p.data ?? []) ?? [];

  const { running, failed, dismiss } = useArtistQueues("audio");
  // A new generation lands in History, so go there when one starts.
  const [lastRunning, setLastRunning] = useState(running.length);
  if (running.length !== lastRunning) {
    setLastRunning(running.length);
    if (running.length > lastRunning) setView("history");
  }

  const current = useCurrentTrack();
  const playing = useArtistPlayerStore((s) => s.playing);
  const playQueue = useArtistPlayerStore((s) => s.playQueue);
  const toggle = useArtistPlayerStore((s) => s.toggle);
  const setLiked = useArtistPlayerStore((s) => s.setLiked);
  const recreate = useRecreateMedia();
  const download = useDownloadMedia();
  const toggleLike = useToggleLikeMutation();

  const songItems: SongItem[] = isExplore
    ? templates.flatMap((t) => {
        const track = templateToTrack(t);
        return track ? [{ track, template: t }] : [];
      })
    : media
        .filter((m) => m.type === "audio")
        .map((m) => ({ track: mediaToTrack(m), media: m }));
  const tracks = songItems.map((i) => i.track);

  const shown = songItems.length;
  const loading = !active.isFetched || (active.isFetching && shown === 0);
  const showRunning = !isExplore && running.length > 0;

  const playAt = (index: number) => {
    if (current?.id === tracks[index].id) toggle();
    else playQueue(tracks, index);
  };

  const songMenu = ({ media: m, template }: SongItem) =>
    m ? (
      <>
        <DropdownMenuItem
          onSelect={() => {
            toggleLike.mutate({ id: m.id, liked: !m.liked });
            setLiked(m.id, !m.liked);
          }}
        >
          <Heart
            className={cn("size-4", m.liked && "fill-secondary text-secondary")}
          />
          {m.liked ? "Unlike" : "Like"}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => download([m])}>
          <Download className="size-4" /> Download
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => recreate(m)}>
          <Sparkles className="size-4" /> Recreate
        </DropdownMenuItem>
      </>
    ) : template ? (
      <DropdownMenuItem onSelect={() => recreate(templateAsMedia(template))}>
        <Sparkles className="size-4" /> Recreate
      </DropdownMenuItem>
    ) : null;

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center gap-2.5">
        {VIEWS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setView(value)}
            className={cn(
              "flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors",
              view === value
                ? "border-white bg-white text-black"
                : "border-white/15 text-white hover:bg-white/10",
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {loading && !showRunning ? (
        <div className={SONG_GRID}>
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className={cn(shelfCard, "border-white/[0.05] bg-white/[0.03]")}
            >
              <div
                className={
                  "aspect-square w-full animate-pulse rounded-xl bg-white/[0.06]"
                }
              />
              {
                <div className="h-8 w-2/3 animate-pulse rounded bg-white/[0.05]" />
              }
            </div>
          ))}
        </div>
      ) : shown === 0 && !showRunning ? (
        <p className="rounded-2xl border border-dashed border-white/10 py-14 text-center text-sm text-white/45">
          {isExplore
            ? "No examples yet."
            : "No songs yet. Describe one above and hit Generate."}
        </p>
      ) : (
        <div className={SONG_GRID}>
          {showRunning &&
            running.map((queue) => (
              <div
                key={queue.id}
                className={cn(shelfCard, "border-primary/25 bg-primary/[0.05]")}
              >
                <div className="aspect-square w-full">
                  <QueuedGenerationTile queue={queue} variant="music" fill />
                </div>
                {
                  <span className="truncate px-0.5 text-sm font-semibold text-white/70">
                    Generating…
                  </span>
                }
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

      {active.hasNextPage && shown > 0 && (
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
