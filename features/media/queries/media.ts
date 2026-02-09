import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchGenerationCost,
  fetchMyProjects,
  fetchMedia,
  mediaGeneration,
} from "@/features/media/api/media";
import { MediaType, ImageResolution, VideoResolution } from "@/features/media/types/media";
import { GenerateMediaRequest } from "@/features/media/types/api";
import { toast } from "sonner";


export function useMediaQuery(projectId?: string, type?: MediaType) {
  return useQuery({
    queryKey: ["media", projectId, type],
    queryFn: () => fetchMedia(projectId, type),
    staleTime: 1000 * 60,
  });
}
export function useMediaGenerationMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GenerateMediaRequest) => mediaGeneration(data),
    onSuccess: (data) => {
      toast.success("Media generated successfully!");
      queryClient.invalidateQueries({
        queryKey: ["project-media", projectId],
      });
      return data;
    },
    onError: (error) => {
      toast.error("Failed to generate media");
    },
  });
}

