import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createBrandTheme,
  createManualBrandTheme,
  deleteBrandTheme,
  fetchBrandThemeQueues,
  fetchBrandThemes,
} from "../api";
import {
  BrandTheme,
  BrandThemeQueue,
  CreateBrandThemeRequest,
  CreateManualBrandThemeRequest,
  isActiveStatus,
} from "../types";

const POLL_INTERVAL_MS = 1000;

export const brandThemeKeys = {
  all: ["brand-themes"] as const,
  queues: ["brand-themes", "queues"] as const,
};

export function useBrandThemesQuery() {
  return useQuery({
    queryKey: brandThemeKeys.all,
    queryFn: () => fetchBrandThemes(),
    staleTime: 30_000,
    retry: 0,
    // Safety net: if the queues endpoint ever returns nothing while a theme is
    // still pending, this is what stops the card spinning forever.
    refetchInterval: (query) =>
      query.state.data?.some((theme) => isActiveStatus(theme.status))
        ? 5_000
        : false,
  });
}

/**
 * Polls the extraction jobs once a second while any is running, then stops.
 * Mirrors `useGenerationQueuesQuery` in features/generation/hooks/generation.ts.
 */
export function useBrandThemeQueuesQuery() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: brandThemeKeys.queues,
    queryFn: async () => {
      const incoming = await fetchBrandThemeQueues();
      // Merge over the cached jobs by id: a job can drop out of the endpoint's
      // window before the UI has observed it reaching a terminal state.
      const previous =
        (queryClient.getQueryData(brandThemeKeys.queues) as
          | BrandThemeQueue[]
          | undefined) ?? [];
      const byId = new Map(previous.map((job) => [job.id, job]));
      incoming.forEach((job) => byId.set(job.id, job));
      return Array.from(byId.values());
    },
    // Self-stopping: only poll while something is actually running.
    refetchInterval: (query) =>
      query.state.data?.some((job) => isActiveStatus(job.status))
        ? POLL_INTERVAL_MS
        : false,
    retry: 0,
  });
}

export function useCreateBrandThemeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateBrandThemeRequest) => createBrandTheme(body),
    onSuccess: (theme) => {
      queryClient.setQueryData<BrandTheme[]>(brandThemeKeys.all, (old) =>
        old ? [theme, ...old] : [theme],
      );
      // refetch, not invalidate — this starts the poll immediately.
      queryClient.refetchQueries({ queryKey: brandThemeKeys.queues });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useCreateManualBrandThemeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateManualBrandThemeRequest) =>
      createManualBrandTheme(body),
    onSuccess: (theme) => {
      queryClient.setQueryData<BrandTheme[]>(brandThemeKeys.all, (old) =>
        old ? [theme, ...old] : [theme],
      );
      // No refetchQueries(queues) here — a manual theme creates no extraction
      // job, so there is nothing to poll.
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteBrandThemeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBrandTheme(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<BrandTheme[]>(brandThemeKeys.all, (old) =>
        old ? old.filter((theme) => theme.id !== id) : old,
      );
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
