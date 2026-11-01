"use client";
import { useGenerationQueuesQuery } from "@/features/generation/hooks/generation";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { Compass, History as HistoryIcon, LucideIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useInfiniteMediaQuery,
  useInfiniteTemplatesQuery,
} from "../queries/media";
import { createMediaFilters, MediaFilters } from "../types/media-filters";
import { MediaDisplayVariant } from "../types/media";
import { MediaGrid } from "./MediaGrid";
import { calculateHeight } from "@/lib/utils";
import { MediaFilterMenu } from "./filters/MediaFilterMenu";
import { MediaGridSkeleton } from "./skeletons/MediaGridSkeleton";
import { QueuedGenerationTile } from "./QueuedGenerationTile";
import { toast } from "sonner";
import { MediaSelectionBar } from "./actions/MediaSelectionBar";
import { useMediaSelectionStore } from "../stores/useMediaSelectionStore";
interface MediaExplorerProps {
  /** Scopes History to one project (the project page). */
  defaultProjectId?: string;
  /**
   * The model History starts filtered to, and the model Explore shows templates
   * for (studio pages like AI Influencer). The user can still change History's
   * model from the filter menu.
   */
  defaultModel?: AiModelsEnum;
  /** Adds the Explore view (templates) next to History. */
  explore?: boolean;
  /** Job domain to poll; studios with isolated jobs pass their own. */
  jobsDomain?: string;
  /** "music" (Artist page): waveform song players and the DJ generating tile. */
  variant?: MediaDisplayVariant;
}
type ExplorerView = "explore" | "history";

const CARD_ASPECT_RATIO = "16:9";
const CARD_WIDTH = 400;
const CARD_HEIGHT = calculateHeight(CARD_ASPECT_RATIO, CARD_WIDTH);

const VIEW_TABS: { value: ExplorerView; label: string; icon: LucideIcon }[] = [
  { value: "explore", label: "Explore", icon: Compass },
  { value: "history", label: "History", icon: HistoryIcon },
];

export default function MediaExplorer({
  defaultProjectId,
  defaultModel,
  explore = false,
  jobsDomain,
  variant = "default",
}: MediaExplorerProps) {
  const [view, setView] = useState<ExplorerView>(
    explore ? "explore" : "history",
  );
  const isExplore = explore && view === "explore";
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<MediaFilters>(() =>
    createMediaFilters(defaultModel),
  );
  const [filtersModel, setFiltersModel] = useState(defaultModel);
  if (filtersModel !== defaultModel) {
    setFiltersModel(defaultModel);
    setFilters(createMediaFilters(defaultModel));
  }
  const [dismissedFailedQueues, setDismissedFailedQueues] = useState<
    Set<string>
  >(new Set());
  // Tracks jobs where we've already shown the toast
  const [toastedQueues, setToastedQueues] = useState<Set<string>>(new Set());
  // Tracks jobs where we've already invalidated the media query (CDN URL ready)
  const [mediaInvalidatedQueues, setMediaInvalidatedQueues] = useState<Set<string>>(new Set());
  const historyQuery = useInfiniteMediaQuery({
    projectId: defaultProjectId,
    filters,
    enabled: !isExplore,
  });
  const templatesQuery = useInfiniteTemplatesQuery(undefined, defaultModel, isExplore);
  const {
    data: pagedData,
    isFetching: isMediaFetching,
    isFetched: isMediaFetched,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = isExplore ? templatesQuery : historyQuery;
  const media = pagedData?.pages.flatMap((p) => p.data ?? []) ?? [];
  const selecting = useMediaSelectionStore((s) => s.active);
  const clearSelection = useMediaSelectionStore((s) => s.clear);

  // Selection is per view: drop it when the tab or filters change, or on leave.
  useEffect(() => {
    clearSelection();
  }, [filters, view, clearSelection]);
  useEffect(() => clearSelection, [clearSelection]);

  // The bottom selection bar replaces the fixed prompt composer while selecting.
  useEffect(() => {
    if (!selecting) return;
    document.body.dataset.mediaSelecting = "true";
    return () => {
      delete document.body.dataset.mediaSelecting;
    };
  }, [selecting]);
  const totalCount = pagedData?.pages[0]?.totalCount ?? 0;
  const { data: queues } = useGenerationQueuesQuery(jobsDomain);
  const updatingMediaIds = useMemo(() => {
    const active = queues?.filter((q: any) =>
      ["pending", "processing"].includes(q.status) && q.mediaId
    ) ?? [];
    return new Set(active.map((q: any) => q.mediaId as string));
  }, [queues]);

  const topRowQueues = useMemo(() =>
    queues?.filter((q: any) => {
      // Active jobs (pending/processing) with no mediaId yet
      if (["pending", "processing"].includes(q.status) && !q.mediaId) return true;
      // Success with providerUrl but mediaId not yet set (R2 upload in progress)
      if (q.status === "success" && q.providerUrl && !q.mediaId) return true;
      return false;
    }) ?? []
  , [queues]);

  // A new generation lands in History, so switch there when one starts.
  const queuedCount = topRowQueues.length;
  const [lastQueuedCount, setLastQueuedCount] = useState(queuedCount);
  if (queuedCount !== lastQueuedCount) {
    setLastQueuedCount(queuedCount);
    if (queuedCount > lastQueuedCount && view === "explore") setView("history");
  }

  const failedQueue = useMemo(() => {
    return queues?.find(
      (q: any) => q.status === "failure" && !dismissedFailedQueues.has(q.id),
    );
  }, [queues, dismissedFailedQueues]);

  useEffect(() => {
    queues?.forEach((queue) => {
      // Toast as soon as the provider returns (may not have mediaId yet)
      if (queue.status === "success" && !toastedQueues.has(queue.id)) {
        toast.success("Generation completed successfully!");
        setToastedQueues((prev) => new Set([...prev, queue.id]));
      }
      // Invalidate media query only when CDN URL is ready (mediaId is set)
      if (queue.status === "success" && queue.mediaId && !mediaInvalidatedQueues.has(queue.id)) {
        queryClient.invalidateQueries({ queryKey: ["media"] });
        queryClient.invalidateQueries({ queryKey: ["templates"] });
        queryClient.invalidateQueries({ queryKey: ["current-user"] });
        queryClient.invalidateQueries({ queryKey: ["user-models"] });
        setMediaInvalidatedQueues((prev) => new Set([...prev, queue.id]));
      }
    });
  }, [queues]);
  return (
    <div className="max-h-full overflow-y-auto w-full rounded-2xl border border-white/15 px-3 sm:px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex items-center justify-between gap-3 w-full py-2">
        <div className="flex items-center gap-1">
          {explore &&
            VIEW_TABS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setView(value)}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  view === value
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
        </div>
        {!isExplore && (
          <MediaFilterMenu
            value={filters}
            onChange={setFilters}
            defaultModel={defaultModel}
          />
        )}
      </div>

      {failedQueue && (
        <AlertDialog
          open={!!failedQueue}
          onOpenChange={(open) => {
            if (!open) {
              setDismissedFailedQueues((prev) => {
                const next = new Set(prev);
                next.add(failedQueue.id);
                return next;
              });
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {(failedQueue as any).failedMeta?.category ??
                  "Generation Failed"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {(failedQueue as any).failedMeta?.clientMessage ??
                  "An unknown error occurred during generation."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={() => {
                  setDismissedFailedQueues((prev) => {
                    const next = new Set(prev);
                    next.add(failedQueue.id);
                    return next;
                  });
                }}
              >
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {!isExplore && topRowQueues.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 px-4 pt-4">
          {topRowQueues.map((queue) => (
            <QueuedGenerationTile key={queue.id} queue={queue} height={CARD_HEIGHT} variant={variant} />
          ))}
        </div>
      )}

      {!isMediaFetched || (isMediaFetching && media.length === 0) ? (
        <MediaGridSkeleton />
      ) : (
        <MediaGrid
          aspectRatio={CARD_ASPECT_RATIO}
          imagesWidth={CARD_WIDTH}
          layout="grid"
          media={media}
          key={view}
          variant={variant}
          updatingMediaIds={isExplore ? undefined : updatingMediaIds}
          actions={!isExplore}
          template={isExplore}
          emptyMessage={isExplore ? "No templates yet" : "Start Generating !"}
        />
      )}

      {!isExplore && <MediaSelectionBar media={media} />}

      {isMediaFetched && media.length > 0 && (
        <div className="flex flex-col items-center gap-3 mt-6 pb-6">
          <p className="text-sm text-muted-foreground">
            Showing {media.length} of {totalCount}
          </p>
          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="btn btn-ghost btn-sm"
            >
              {isFetchingNextPage ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  Loading...
                </span>
              ) : (
                "Show More"
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
