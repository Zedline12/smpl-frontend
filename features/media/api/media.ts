import { Project } from "@/features/projects/types/project";
import { Media, MediaType } from "@/features/media/types/media";

// lib/api/projects.ts
export async function fetchMyProjects(): Promise<Project[] | []> {
  const res = await fetch("/api/projects/me");
  const json = await res.json();
  return json.data;
}

export async function fetchMedia(
  projectId?: string,
  type?: MediaType,
): Promise<Media[] | []> {
  // if (!projectId) return [];
  const res = await fetch(
    `/api/media/me?projectId=${projectId ?? ""}&type=${type ?? ""}`,
  );
  const json = await res.json();
  return json.data;
}
