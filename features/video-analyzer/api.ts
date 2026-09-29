import { CreateVideoAnalysisRequest, VideoAnalysis } from "./types";

function unwrap<T>(json: any): T {
  return (json?.data ?? json) as T;
}

async function readError(res: Response, fallback: string): Promise<string> {
  const json = await res.json().catch(() => null);
  return json?.error || json?.message || fallback;
}

export async function fetchVideoAnalyses(
  limit?: number,
): Promise<VideoAnalysis[]> {
  const query = limit ? `?limit=${limit}` : "";
  const res = await fetch(`/api/video-analyzer${query}`);
  if (!res.ok) {
    throw new Error(await readError(res, "Failed to load video analyses"));
  }
  const data = unwrap<VideoAnalysis[]>(await res.json());
  return Array.isArray(data) ? data : [];
}

export async function fetchVideoAnalysis(id: string): Promise<VideoAnalysis> {
  const res = await fetch(`/api/video-analyzer/${id}`);
  if (!res.ok) {
    throw new Error(await readError(res, "Failed to load video analysis"));
  }
  return unwrap<VideoAnalysis>(await res.json());
}

export async function fetchVideoAnalysisQueues(): Promise<VideoAnalysis[]> {
  const res = await fetch("/api/video-analyzer/me/queues");
  if (!res.ok) {
    throw new Error(await readError(res, "Failed to load analysis jobs"));
  }
  const data = unwrap<VideoAnalysis[]>(await res.json());
  return Array.isArray(data) ? data : [];
}

export async function createVideoAnalysis(
  body: CreateVideoAnalysisRequest,
): Promise<VideoAnalysis> {
  const res = await fetch("/api/video-analyzer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await readError(res, "Failed to start the analysis"));
  }
  return unwrap<VideoAnalysis>(await res.json());
}

export async function deleteVideoAnalysis(id: string): Promise<void> {
  const res = await fetch(`/api/video-analyzer/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error(await readError(res, "Failed to delete video analysis"));
  }
}
