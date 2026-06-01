import { Project } from "@/features/projects/types/project";
import { Media, MediaType } from "@/features/media/types/media";

export async function fetchMyProjects(): Promise<Project[] | []> {
  const res = await fetch("/api/projects/me");
  const json = await res.json();
  return json.data;
}

export async function fetchMedia({
  projectId,
  type,
  limit = 5,
  offset = 0,
}: {
  projectId?: string;
  type?: MediaType;
  limit?: number;
  offset?: number;
}): Promise<{ data: Media[]; totalCount: number; limit: number }> {
  const params = new URLSearchParams();
  if (projectId) params.set("projectId", projectId);
  if (type) params.set("type", type);
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  const res = await fetch(`/api/media/me?${params}`);
  const json = await res.json();
  return { data: json.data.data, totalCount: json.data.totalCount, limit: json.data.limit };
}
