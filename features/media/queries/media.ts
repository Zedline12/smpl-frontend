import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { fetchMedia, fetchTemplates } from "@/features/media/api/media";
import { MediaType } from "@/features/media/types/media";
import { MediaFilters } from "@/features/media/types/media-filters";

export function useMediaQuery(projectId?: string, type?: MediaType) {
  return useQuery({
    queryKey: ["media", projectId, type],
    queryFn: () => fetchMedia({ projectId, type }),
    staleTime: 1000 * 60,
  });
}

export function useInfiniteMediaQuery({
  projectId,
  type,
  filters,
  limit = 5,
  enabled = true,
}: {
  projectId?: string;
  type?: MediaType;
  filters?: MediaFilters;
  limit?: number;
  enabled?: boolean;
}) {
  return useInfiniteQuery({
    queryKey: ["media", projectId, type, filters],
    enabled,
    queryFn: ({ pageParam }) =>
      fetchMedia({ projectId, type, filters, limit, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.flatMap((p) => p.data).length;
      return loaded < lastPage.totalCount ? loaded : undefined;
    },
    staleTime: 1000 * 60,
  });
}

/** Admin-made templates, by model (model pages) or media type (/create). */
export function useInfiniteTemplatesQuery(
  type?: MediaType,
  model?: string,
  enabled = true,
  limit = 12,
) {
  return useInfiniteQuery({
    queryKey: ["templates", type, model],
    enabled,
    queryFn: ({ pageParam }) =>
      fetchTemplates({ type, model, limit, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.flatMap((p) => p.data).length;
      return loaded < lastPage.totalCount ? loaded : undefined;
    },
    staleTime: 1000 * 60 * 5,
  });
}
