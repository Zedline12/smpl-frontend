import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { fetchMedia } from "@/features/media/api/media";
import { MediaType } from "@/features/media/types/media";

export function useMediaQuery(projectId?: string, type?: MediaType) {
  return useQuery({
    queryKey: ["media", projectId, type],
    queryFn: () => fetchMedia({ projectId, type }),
    staleTime: 1000 * 60,
  });
}

export function useInfiniteMediaQuery(
  projectId?: string,
  type?: MediaType,
  limit = 5,
) {
  return useInfiniteQuery({
    queryKey: ["media", projectId, type],
    queryFn: ({ pageParam }) =>
      fetchMedia({ projectId, type, limit, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.flatMap((p) => p.data).length;
      return loaded < lastPage.totalCount ? loaded : undefined;
    },
    staleTime: 1000 * 60,
  });
}
