import {
  ClipPostCopy,
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

export async function fetchClippingCost(input: {
  videoUrl: string;
  platforms: string[];
  sourceKind: "link" | "upload";
}): Promise<ClippingCost> {
  // Priced by the shared generation cost endpoint, under the "video-clipping" model.
  const res = await fetch("/api/generation/calculate-cost", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "video-clipping", input }),
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

export async function deleteClippingProject(id: string): Promise<void> {
  const res = await fetch(`/api/video-clipping/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await readError(res, "Couldn't delete this project"));
}

export async function regenerateClipCopy(
  id: string,
  videoId: number,
): Promise<{ providerVideoId: number; postCopy: Record<string, ClipPostCopy> }> {
  const res = await fetch(`/api/video-clipping/${id}/clips/${videoId}/copy`, { method: "POST" });
  if (!res.ok) throw new Error(await readError(res, "Couldn't rewrite the captions"));
  return unwrap(await res.json());
}

export async function saveClipsToLibrary(
  id: string,
  videoIds: number[],
): Promise<{ saved: { providerVideoId: number; mediaId: string }[] }> {
  const res = await fetch(`/api/video-clipping/${id}/clips/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ videoIds }),
  });
  if (!res.ok) throw new Error(await readError(res, "Couldn't save to your library"));
  return unwrap(await res.json());
}

/** Starts a browser download of the chosen clips as one zip. */
export function downloadClipsZip(id: string, videoIds: number[]) {
  const a = document.createElement("a");
  a.href = `/api/video-clipping/${id}/download${videoIds.length ? `?ids=${videoIds.join(",")}` : ""}`;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Uploads a video file for clipping; returns its public URL. */
export async function uploadClippingVideo(
  file: File,
  onProgress?: (fraction: number) => void,
): Promise<string> {
  const sigRes = await fetch("/api/media/upload-signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType: file.type || "video/mp4" }),
  });
  if (!sigRes.ok) throw new Error(await readError(sigRes, "Couldn't start the upload"));
  const sig = unwrap<{ url?: string; publicUrl?: string }>(await sigRes.json());
  if (!sig.url || !sig.publicUrl) throw new Error("Couldn't start the upload");

  // XHR for upload progress (fetch can't report it).
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", sig.url!);
    xhr.setRequestHeader("Content-Type", file.type || "video/mp4");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total);
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("Upload failed")));
    xhr.onerror = () => reject(new Error("Upload failed. Check your connection and try again."));
    xhr.send(file);
  });
  return sig.publicUrl;
}
