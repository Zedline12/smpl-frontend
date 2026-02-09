import {
  fetchGenerationCost,
  fetchGenerationQueues,
} from "@/features/generation/api/generation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  imageGeneration,
  videoGeneration,
} from "@/features/generation/api/generation";
import {
  GenerateImageRequest,
  GenerateVideoRequest,
} from "@/features/generation/types/api";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import {
  ImageResolution,
  MediaType,
  VideoResolution,
} from "@/features/media/types/media";
import { useImageGenerationStore } from "@/stores/useImageGenerationStore";
export function useGenerateImageAction() {
  const mutation = useImageGenerationMutation();

  const { prompt, aspectRatio, resolution, referenceImages, projectId, reset } =
    useImageGenerationStore();

  const generate = async () => {
    if (!prompt.trim()) {
      toast.error("Prompt is required");
      return;
    }

    const payload: GenerateImageRequest = {
      prompt,
      aspectRatio,
      resolution,
      referenceImages: referenceImages.filter(Boolean) as File[],
      projectId: projectId!,
    };

    await mutation.mutateAsync(payload);

    reset(); // optional
  };

  return {
    ...mutation,
    generate,
  };
}

export function useGenerationCostQuery(
  resolution: ImageResolution | VideoResolution,
  mediaType: MediaType,
) {
  return useQuery({
    queryKey: ["generation-cost", resolution, mediaType],
    queryFn: () => fetchGenerationCost({ resolution, mediaType }),
    staleTime: 1000 * 60,
  });
}
export function useImageGenerationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GenerateImageRequest) => imageGeneration(data),
    onSuccess: (data) => {
      console.log("success", data);
      queryClient.refetchQueries({
        queryKey: ["generation-queues"],
      });
      return data;
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
export function useVideoGenerationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GenerateVideoRequest) => videoGeneration(data),
    onSuccess: (data) => {
      queryClient.refetchQueries({
        queryKey: ["generation-queues"],
      });
      return data;
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
export const useGenerationQueuesQuery = () => {
  return useQuery({
    queryKey: ["generation-queues"],
    queryFn: () => fetchGenerationQueues(),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (
        data?.some((item) => ["pending", "processing"].includes(item.status))
      ) {
        return 1000;
      }
      return false;
    },
  });
};
