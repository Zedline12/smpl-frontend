"use client";
import { useGenerationQueuesQuery } from "@/features/generation/hooks/generation";
import { AiModelsEnum,  normalizeModelId } from "@/features/generation/enums/models.enum";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useMemo, ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useAiGenerationControlStore } from "@/stores/useAiGenerationControlStore";
import { Compass, History as HistoryIcon, LucideIcon, WandSparkles } from "lucide-react";
import { StylesView } from "@/features/styles/components/StylesView";
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
import { TemplateGrid } from "@/features/templates/components/TemplateGrid";
import { Template } from "@/features/templates/types";
import { calculateHeight } from "@/lib/utils";
import { MediaFilterMenu } from "./filters/MediaFilterMenu";
import { MediaGridSkeleton } from "./skeletons/MediaGridSkeleton";
import { QueuedGenerationTile } from "./QueuedGenerationTile";
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
  /**
   * Adds the Styles tab (create pages). The tab is then kept in the shared store,
   * so the sidebar's Style card can open it.
   */
  styles?: boolean;
  /** Job domain to poll; studios with isolated jobs pass their own. */
  jobsDomain?: string;
  /** "music" (Artist page): waveform song players and the DJ generating tile. */
  variant?: MediaDisplayVariant;
  /** Explore-only content (hero, examples), shown above the templates. */
  children?: ReactNode;
}
type ExplorerView = "explore" | "history" | "styles";

const CARD_ASPECT_RATIO = "16:9";
const CARD_WIDTH = 400;
const CARD_HEIGHT = calculateHeight(CARD_ASPECT_RATIO, CARD_WIDTH);

const VIEW_TABS: { value: ExplorerView; label: string; icon: LucideIcon; isNew?: boolean }[] = [
  { value: "explore", label: "Explore", icon: Compass },
  { value: "history", label: "History", icon: HistoryIcon },
  { value: "styles", label: "Styles", icon: WandSparkles, isNew: true },
];

export default function MediaExplorer({
  defaultProjectId,
  defaultModel,
  explore = false,
  styles = false,
  jobsDomain,
  variant = "default",
  children,
}: MediaExplorerProps) {
  const [localView, setLocalView] = useState<ExplorerView>(
    explore ? "explore" : "history",
  );
  const storeView = useAiGenerationControlStore((s) => s.explorerView);
  const setStoreView = useAiGenerationControlStore((s) => s.setExplorerView);
  // With Styles the tab lives in the store (the sidebar opens it); elsewhere it's local.
  const view: ExplorerView = styles ? storeView : localView;
  const setView = styles ? setStoreView : setLocalView;
  const isStyles = styles && view === "styles";
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
  // Tracks jobs where we've already invalidated the media query (CDN URL ready)
  const [mediaInvalidatedQueues, setMediaInvalidatedQueues] = useState<Set<string>>(new Set());
  // Explore shows the templates of one model: the page's own model (studios), else the
  // ?model= in the URL (set when a model is picked), else the model selected right now.
  const searchParams = useSearchParams();
  const selectedModel = useAiGenerationControlStore((s) => s.model);
  const urlModel = normalizeModelId(searchParams.get("model"));
  const templateModel =
    defaultModel ??
    (urlModel && (Object.values(AiModelsEnum) as string[]).includes(urlModel)
      ? (urlModel as AiModelsEnum)
      : selectedModel);
  // Fetched whenever Explore could show, so an empty model can hide the tab.
  const templatesQuery = useInfiniteTemplatesQuery(undefined, templateModel, explore);
  const noTemplates =
    templatesQuery.isFetched && (templatesQuery.data?.pages[0]?.totalCount ?? 0) === 0;
  const hasExplore = explore && !noTemplates;
  const isExplore = hasExplore && view === "explore";
  const isHistory = !isExplore && !isStyles;
  // The tab actually showing (Explore falls back to History when there are no templates).
  const shownView: ExplorerView = isExplore ? "explore" : isStyles ? "styles" : "history";
  const historyQuery = useInfiniteMediaQuery({
    projectId: defaultProjectId,
    filters,
    enabled: isHistory,
  });
  const active = isExplore ? templatesQuery : historyQuery;
  const {
    isFetching: isMediaFetching,
    isFetched: isMediaFetched,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = active;
  const pagedData = active.data;
  // Explore shows templates (images[] + videos[]); History shows the user's media.
  const templates: Template[] = isExplore
    ? (templatesQuery.data?.pages.flatMap((p) => p.data ?? []) ?? [])
    : [];
  const media = isExplore
    ? []
    : (historyQuery.data?.pages.flatMap((p) => p.data ?? []) ?? []);
  const shownCount = isExplore ? templates.length : media.length;
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
    if (queuedCount > lastQueuedCount && view !== "history") setView("history");
  }

  const failedQueue = useMemo(() => {
    return queues?.find(
      (q: any) => q.status === "failure" && !dismissedFailedQueues.has(q.id),
    );
  }, [queues, dismissedFailedQueues]);

  useEffect(() => {
    queues?.forEach((queue) => {
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
    // Always fills its parent, even with nothing to show.
    <div className="flex h-full min-h-full w-full flex-1 flex-col overflow-y-auto [&>*]:shrink-0 rounded-2xl border border-white/15 px-3 sm:px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex items-center justify-between gap-3 w-full py-2">
        <div className="flex items-center gap-1">
          {explore &&
            VIEW_TABS.filter(
              (t) => (t.value !== "styles" || styles) && (t.value !== "explore" || hasExplore),
            ).map(({ value, label, icon: Icon, isNew }) => (
              <button
                key={value}
                type="button"
                onClick={() => setView(value)}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  shownView === value
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="size-4" />
                {label}
                {isNew && (
                  <span className="rounded-md bg-[#d4ff00]/15 px-1.5 py-px text-[10px] font-semibold text-[#d4ff00]">
                    New
                  </span>
                )}
              </button>
            ))}
        </div>
        {isHistory && (
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

      {isHistory && topRowQueues.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 px-4 pt-4">
          {topRowQueues.map((queue) => (
            <QueuedGenerationTile key={queue.id} queue={queue} height={CARD_HEIGHT} variant={variant} />
          ))}
        </div>
      )}

      {isExplore && children}

      {isStyles ? (
        <StylesView />
      ) : !isMediaFetched || (isMediaFetching && shownCount === 0) ? (
        <MediaGridSkeleton />
      ) : isExplore ? (
        <TemplateGrid templates={templates} />
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
          // Nothing to show: leave it empty rather than show a message.
          emptyMessage={null}
        />
      )}

      {isHistory && <MediaSelectionBar media={media} />}

      {!isStyles && isMediaFetched && shownCount > 0 && (
        <div className="flex flex-col items-center gap-3 mt-6 pb-6">
          <p className="text-sm text-muted-foreground">
            Showing {shownCount} of {totalCount}
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
