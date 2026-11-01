import { Project } from "@/features/projects/types/project";
import { Media, MediaType } from "@/features/media/types/media";
import { MediaFilters, resolveDateRange } from "@/features/media/types/media-filters";

export async function markMediaDownloaded(ids: string[]): Promise<void> {
  await fetch("/api/media/downloaded", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
}

export async function fetchMyProjects(): Promise<Project[] | []> {
  const res = await fetch("/api/projects/me");
  const json = await res.json();
  return json.data;
}

export async function fetchMedia({
  projectId,
  type,
  filters,
  limit = 5,
  offset = 0,
}: {
  projectId?: string;
  type?: MediaType;
  filters?: MediaFilters;
  limit?: number;
  offset?: number;
}): Promise<{ data: Media[]; totalCount: number; limit: number }> {
  const params = new URLSearchParams();
  if (projectId) params.set("projectId", projectId);
  if (type) params.set("type", type);
  if (filters) {
    if (filters.model) params.set("model", filters.model);
    if (filters.liked) params.set("liked", "true");
    if (filters.downloaded) params.set("downloaded", "true");
    const { from, to } = resolveDateRange(filters.dateRange);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
  }
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  const res = await fetch(`/api/media/me?${params}`);
  const json = await res.json();
  return { data: json.data.data, totalCount: json.data.totalCount, limit: json.data.limit };
}

export async function fetchTemplates({
  type,
  model,
  limit = 12,
  offset = 0,
}: {
  type?: MediaType;
  model?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: Media[]; totalCount: number; limit: number }> {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (model) params.set("model", model);
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  const res = await fetch(`/api/media/templates?${params}`);
  const json = await res.json();
  return {
    data: json.data?.data ?? [],
    totalCount: json.data?.totalCount ?? 0,
    limit: json.data?.limit ?? limit,
  };
}
