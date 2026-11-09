import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { fetchMedia } from "@/features/media/api/media";
import { fetchAdminTemplates, fetchTemplates } from "@/features/templates/api";
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

/** Admin: every template of a model, unpublished included. */
export function useAdminTemplatesQuery(model?: string, limit = 24) {
  return useInfiniteQuery({
    queryKey: ["templates", "admin", model],
    queryFn: ({ pageParam }) => fetchAdminTemplates({ model, limit, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.flatMap((p) => p.data).length;
      return loaded < lastPage.totalCount ? loaded : undefined;
    },
  });
}

/** Published templates for Explore, by model (model pages) or media type. */
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
