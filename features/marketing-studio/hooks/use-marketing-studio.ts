import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchGenerationCost } from "@/features/generation/api/generation";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import { Veo3Input } from "@/features/generation/types/models/veo-3.type";
import { GeminiFlashImageInput } from "@/features/generation/types/models/gemini-flash-image.type";
import {
  createMarketingAd,
  createMarketingPhoto,
  fetchMarketingCreation,
  fetchMarketingCreations,
  fetchMarketingQueues,
} from "../api";
import {
  CreateMarketingAdRequest,
  CreateMarketingPhotoRequest,
  MarketingStudioCreation,
  isMarketingStudioActive,
} from "../types";

const POLL_INTERVAL_MS = 1000;

export const marketingStudioKeys = {
  all: ["marketing-studio"] as const,
  detail: (id: string) => ["marketing-studio", id] as const,
  queues: ["marketing-studio", "queues"] as const,
};

export function useMarketingCreationsQuery(options?: { brandThemeId?: string }) {
  return useQuery({
    queryKey: [...marketingStudioKeys.all, options?.brandThemeId ?? null],
    queryFn: () => fetchMarketingCreations(options),
    staleTime: 30_000,
    retry: 0,
    // Safety net: if the queues endpoint ever drops an item before its media
    // shows up here, this is what stops the card spinning forever.
    refetchInterval: (query) =>
      query.state.data?.some((creation) => isMarketingStudioActive(creation))
        ? 5_000
        : false,
  });
}

/**
 * Polls `GET /marketing-studio/me/queues` once a second while any creation is
 * still generating, then stops. Mirrors `useBrandThemeQueuesQuery`. The
 * domain carries no status field — a creation is "active" purely by having a
 * null `media`, and this endpoint's items are the same full creation shape.
 */
export function useMarketingQueuesQuery() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: marketingStudioKeys.queues,
    queryFn: async () => {
      const incoming = await fetchMarketingQueues();
      // Merge over the cached jobs by id: a job can drop out of the endpoint's
      // window before the UI has observed its media populate.
      const previous =
        (queryClient.getQueryData(marketingStudioKeys.queues) as
          | MarketingStudioCreation[]
          | undefined) ?? [];
      const byId = new Map(previous.map((job) => [job.id, job]));
      incoming.forEach((job) => byId.set(job.id, job));
      return Array.from(byId.values());
    },
    // Self-stopping: only poll while something is actually running.
    refetchInterval: (query) =>
      query.state.data?.some((job) => isMarketingStudioActive(job))
        ? POLL_INTERVAL_MS
        : false,
    retry: 0,
  });
}

/**
 * Live status for one creation: prefers the queues poll (fresher, 1s) and
 * falls back to whatever was passed in (e.g. the mutation's own response)
 * until the first queue fetch resolves.
 */
export function useMarketingCreationStatus(
  id: string | null,
  fallback?: MarketingStudioCreation | null,
) {
  const { data: queue } = useMarketingQueuesQuery();
  const creation = id
    ? (queue?.find((job) => job.id === id) ?? fallback ?? undefined)
    : undefined;
  return { creation };
}

/**
 * Same endpoint the prompt composer already uses — {model, input} in,
 * {creditsCost} out. Marketing Studio has no resolution control of its own,
 * so it borrows each model's ModelDefaults resolution for the estimate.
 */
export function useMarketingCostQuery(
  params:
    | { mediaType: "video"; input: Veo3Input }
    | { mediaType: "photo"; input: GeminiFlashImageInput }
    | null,
) {
  return useQuery({
    queryKey: [
      "marketing-studio-cost",
      params?.mediaType,
      params ? { ...params.input, prompt: undefined } : null,
    ],
    queryFn: () =>
      fetchGenerationCost({
        model:
          params!.mediaType === "video"
            ? AiModelsEnum.VEO_3
            : AiModelsEnum.GEMINI_FLASH_IMAGE,
        input: params!.input,
      }),
    enabled: !!params,
    staleTime: 60_000,
    retry: 0,
  });
}

/**
 * Prepends a freshly created creation into both the unfiltered list cache and
 * (if present) the theme-filtered list cache — `useMarketingCreationsQuery`
 * keys each by `[...marketingStudioKeys.all, brandThemeId ?? null]`.
 */
function prependCreation(
  queryClient: ReturnType<typeof useQueryClient>,
  creation: MarketingStudioCreation,
) {
  for (const filter of [null, creation.brandThemeId]) {
    queryClient.setQueryData<MarketingStudioCreation[]>(
      [...marketingStudioKeys.all, filter],
      (old) => (old ? [creation, ...old] : old),
    );
  }
}

export function useCreateMarketingAdMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateMarketingAdRequest) => createMarketingAd(body),
    onSuccess: (creation) => {
      prependCreation(queryClient, creation);
      // refetch, not invalidate — this starts the poll immediately.
      queryClient.refetchQueries({ queryKey: marketingStudioKeys.queues });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useCreateMarketingPhotoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateMarketingPhotoRequest) =>
      createMarketingPhoto(body),
    onSuccess: (creation) => {
      prependCreation(queryClient, creation);
      queryClient.refetchQueries({ queryKey: marketingStudioKeys.queues });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Recovers a creation after a reload — the mutation's in-memory response
 * wouldn't survive one. Not itself the source of polling.
 */
export function useMarketingCreationQuery(id: string | null) {
  return useQuery({
    queryKey: marketingStudioKeys.detail(id ?? ""),
    queryFn: () => fetchMarketingCreation(id!),
    enabled: !!id,
    retry: 0,
    staleTime: Infinity,
  });
}
