import {
  CreateMarketingAdRequest,
  CreateMarketingPhotoRequest,
  MarketingStudioCreation,
} from "./types";

function unwrap<T>(json: any): T {
  return (json?.data ?? json) as T;
}

async function readError(res: Response, fallback: string): Promise<string> {
  const json = await res.json().catch(() => null);
  return json?.error || json?.message || fallback;
}

export async function createMarketingAd(
  body: CreateMarketingAdRequest,
): Promise<MarketingStudioCreation> {
  const res = await fetch("/api/marketing-studio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, mediaType: "video" }),
  });
  if (!res.ok) {
    throw new Error(await readError(res, "Failed to create the ad"));
  }
  return unwrap<MarketingStudioCreation>(await res.json());
}

export async function createMarketingPhoto(
  body: CreateMarketingPhotoRequest,
): Promise<MarketingStudioCreation> {
  const res = await fetch("/api/marketing-studio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, mediaType: "photo" }),
  });
  if (!res.ok) {
    throw new Error(await readError(res, "Failed to create the photo"));
  }
  return unwrap<MarketingStudioCreation>(await res.json());
}

export async function fetchMarketingCreations(
  limit?: number,
): Promise<MarketingStudioCreation[]> {
  const query = limit ? `?limit=${limit}` : "";
  const res = await fetch(`/api/marketing-studio${query}`);
  if (!res.ok) {
    throw new Error(await readError(res, "Failed to load creations"));
  }
  const data = unwrap<MarketingStudioCreation[]>(await res.json());
  return Array.isArray(data) ? data : [];
}

export async function fetchMarketingCreation(
  id: string,
): Promise<MarketingStudioCreation> {
  const res = await fetch(`/api/marketing-studio/${id}`);
  if (!res.ok) {
    throw new Error(await readError(res, "Failed to load creation"));
  }
  return unwrap<MarketingStudioCreation>(await res.json());
}
