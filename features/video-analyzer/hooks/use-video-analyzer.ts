import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createVideoAnalysis,
  deleteVideoAnalysis,
  fetchVideoAnalyses,
  fetchVideoAnalysis,
  fetchVideoAnalysisQueues,
} from "../api";
import {
  CreateVideoAnalysisRequest,
  VideoAnalysis,
  isActiveStatus,
} from "../types";

const QUEUE_POLL_MS = 1000;
const DETAIL_POLL_MS = 5000;

export const videoAnalyzerKeys = {
  all: ["video-analyzer"] as const,
  detail: (id: string) => ["video-analyzer", id] as const,
  queues: ["video-analyzer", "queues"] as const,
};

export function useVideoAnalysesQuery() {
  return useQuery({
    queryKey: videoAnalyzerKeys.all,
    queryFn: () => fetchVideoAnalyses(),
    staleTime: 15_000,
    retry: 0,
    // Safety net: if the queues endpoint ever drops an item before its status
    // shows up here, this is what stops the card spinning forever.
    refetchInterval: (query) =>
      query.state.data?.some((analysis) => isActiveStatus(analysis.status))
        ? 5_000
        : false,
  });
}

/**
 * Polls the extraction-style jobs once a second while any is running, then
 * stops. Mirrors `useBrandThemeQueuesQuery`.
 */
export function useVideoAnalysisQueuesQuery() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: videoAnalyzerKeys.queues,
    queryFn: async () => {
      const incoming = await fetchVideoAnalysisQueues();
      // Merge over the cached jobs by id: a job can drop out of the endpoint's
      // window before the UI has observed it reaching a terminal state.
      const previous =
        (queryClient.getQueryData(videoAnalyzerKeys.queues) as
          | VideoAnalysis[]
          | undefined) ?? [];
      const byId = new Map(previous.map((job) => [job.id, job]));
      incoming.forEach((job) => byId.set(job.id, job));
      return Array.from(byId.values());
    },
    refetchInterval: (query) =>
      query.state.data?.some((job) => isActiveStatus(job.status))
        ? QUEUE_POLL_MS
        : false,
    retry: 0,
  });
}

/**
 * The detail view polls on its own rule, scoped to its own analysis — without
 * it, opening a processing analysis would sit frozen until a manual refresh.
 */
export function useVideoAnalysisQuery(id: string) {
  return useQuery({
    queryKey: videoAnalyzerKeys.detail(id),
    queryFn: () => fetchVideoAnalysis(id),
    enabled: !!id,
    retry: 0,
    refetchInterval: (query) =>
      query.state.data && isActiveStatus(query.state.data.status)
        ? DETAIL_POLL_MS
        : false,
  });
}

export function useCreateVideoAnalysisMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateVideoAnalysisRequest) => createVideoAnalysis(body),
    onSuccess: (analysis) => {
      queryClient.setQueryData<VideoAnalysis[]>(videoAnalyzerKeys.all, (old) =>
        old ? [analysis, ...old] : [analysis],
      );
      // refetch, not invalidate — this starts the poll immediately.
      queryClient.refetchQueries({ queryKey: videoAnalyzerKeys.queues });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteVideoAnalysisMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteVideoAnalysis(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<VideoAnalysis[]>(videoAnalyzerKeys.all, (old) =>
        old ? old.filter((analysis) => analysis.id !== id) : old,
      );
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
