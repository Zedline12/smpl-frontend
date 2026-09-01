import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createClippingProject,
  fetchClippingCost,
  fetchClippingProject,
  fetchClippingProjects,
} from "../api";
import {
  CreateVideoClippingRequest,
  VideoClippingProject,
  isActiveStatus,
} from "../types";

// Clipping is slow work — a long interval keeps the poll cheap without the user
// noticing a difference.
const LIST_POLL_MS = 35_000;
const DETAIL_POLL_MS = 35_000;

const COST_DEBOUNCE_MS = 500;

export const clippingKeys = {
  all: ["video-clipping"] as const,
  detail: (id: string) => ["video-clipping", id] as const,
  cost: (videoUrl: string) => ["video-clipping", "cost", videoUrl] as const,
};

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

/**
 * Debounced so a valid URL forming mid-keystroke ("https://y.co") doesn't fire
 * a request per character.
 */
export function useClippingCostQuery(videoUrl: string | null) {
  const debouncedUrl = useDebouncedValue(videoUrl, COST_DEBOUNCE_MS);

  return useQuery({
    queryKey: clippingKeys.cost(debouncedUrl ?? ""),
    queryFn: () => fetchClippingCost(debouncedUrl!),
    enabled: !!debouncedUrl,
    staleTime: 60_000,
    retry: 0,
  });
}

export function useClippingProjectsQuery() {
  return useQuery({
    queryKey: clippingKeys.all,
    queryFn: () => fetchClippingProjects(),
    staleTime: 15_000,
    retry: 0,
    // Self-stopping: poll only while something is still being clipped.
    refetchInterval: (query) =>
      query.state.data?.some((project) => isActiveStatus(project.status))
        ? LIST_POLL_MS
        : false,
  });
}

/**
 * The detail view polls on the same rule, scoped to its own project — without
 * it, opening a processing project would sit frozen until a manual refresh.
 */
export function useClippingProjectQuery(id: string) {
  return useQuery({
    queryKey: clippingKeys.detail(id),
    queryFn: () => fetchClippingProject(id),
    enabled: !!id,
    retry: 0,
    refetchInterval: (query) =>
      query.state.data && isActiveStatus(query.state.data.status)
        ? DETAIL_POLL_MS
        : false,
  });
}

export function useCreateClippingProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateVideoClippingRequest) =>
      createClippingProject(body),
    onSuccess: (project) => {
      queryClient.setQueryData<VideoClippingProject[]>(
        clippingKeys.all,
        (old) => (old ? [project, ...old] : [project]),
      );
      // refetch, not invalidate — this starts the poll immediately.
      queryClient.refetchQueries({ queryKey: clippingKeys.all });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
