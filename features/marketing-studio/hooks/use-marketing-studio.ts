import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchGenerationCost } from "@/features/generation/api/generation";
import { useGenerationQueuesQuery } from "@/features/generation/hooks/generation";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import { GenerationQueue } from "@/features/generation/types/generation";
import { Veo3Input } from "@/features/generation/types/models/veo-3.type";
import { GeminiFlashImageInput } from "@/features/generation/types/models/gemini-flash-image.type";
import {
  createMarketingAd,
  createMarketingPhoto,
  fetchMarketingCreation,
  fetchMarketingCreations,
} from "../api";
import {
  CreateMarketingAdRequest,
  CreateMarketingPhotoRequest,
} from "../types";

export const marketingStudioKeys = {
  all: ["marketing-studio"] as const,
  detail: (id: string) => ["marketing-studio", id] as const,
};

export function useMarketingCreationsQuery() {
  return useQuery({
    queryKey: marketingStudioKeys.all,
    queryFn: () => fetchMarketingCreations(),
    staleTime: 30_000,
    retry: 0,
  });
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

export function useCreateMarketingAdMutation() {
  return useMutation({
    mutationFn: (body: CreateMarketingAdRequest) => createMarketingAd(body),
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useCreateMarketingPhotoMutation() {
  return useMutation({
    mutationFn: (body: CreateMarketingPhotoRequest) =>
      createMarketingPhoto(body),
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Recovers a creation's `jobId` after a reload — the mutation's in-memory
 * response wouldn't survive one. Not itself the source of status/progress.
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

/**
 * `GET /marketing-studio/:id` carries no status or result — that lives on the
 * generation job identified by `jobId`, which `useGenerationQueuesQuery`
 * already polls (self-stopping, 1s) for every other generation in the app.
 * This reads that same cache rather than starting a second independent poll.
 *
 * Matched against the queue item's `id`, not its `jobId` — the latter is
 * declared on `GenerationQueue` but is not actually populated by the backend
 * (see the earlier refund-generation fix, which hit the same gap).
 */
export function useMarketingJobStatus(jobId: string | null) {
  const { data: queues } = useGenerationQueuesQuery();
  const job = jobId
    ? (queues as GenerationQueue[] | undefined)?.find(
        (queue) => queue.id === jobId,
      )
    : undefined;
  return { job };
}
