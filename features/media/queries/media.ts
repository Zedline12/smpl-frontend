import { useQuery } from "@tanstack/react-query";
import { fetchMedia } from "@/features/media/api/media";
import { MediaType } from "@/features/media/types/media";

export function useMediaQuery(projectId?: string, type?: MediaType) {
  return useQuery({
    queryKey: ["media", projectId, type],
    queryFn: () => fetchMedia(projectId, type),
    staleTime: 1000 * 60,
  });
}
