import {
  ClippingCost,
  CreateVideoClippingRequest,
  VideoClippingProject,
} from "./types";

function unwrap<T>(json: any): T {
  return (json?.data ?? json) as T;
}

async function readError(res: Response, fallback: string): Promise<string> {
  const json = await res.json().catch(() => null);
  return json?.error || json?.message || fallback;
}

export async function fetchClippingProjects(
  limit?: number,
): Promise<VideoClippingProject[]> {
  const query = limit ? `?limit=${limit}` : "";
  const res = await fetch(`/api/video-clipping${query}`);
  if (!res.ok) {
    throw new Error(await readError(res, "Failed to load clipping projects"));
  }
  const data = unwrap<VideoClippingProject[]>(await res.json());
  return Array.isArray(data) ? data : [];
}

export async function fetchClippingProject(
  id: string,
): Promise<VideoClippingProject> {
  const res = await fetch(`/api/video-clipping/${id}`);
  if (!res.ok) {
    throw new Error(await readError(res, "Failed to load clipping project"));
  }
  return unwrap<VideoClippingProject>(await res.json());
}

export async function fetchClippingCost(
  videoUrl: string,
): Promise<ClippingCost> {
  const res = await fetch("/api/video-clipping/calculate-cost", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ videoUrl }),
  });
  if (!res.ok) {
    throw new Error(await readError(res, "Failed to calculate cost"));
  }
  return unwrap<ClippingCost>(await res.json());
}

export async function createClippingProject(
  body: CreateVideoClippingRequest,
): Promise<VideoClippingProject> {
  const res = await fetch("/api/video-clipping", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await readError(res, "Failed to start clipping"));
  }
  return unwrap<VideoClippingProject>(await res.json());
}
