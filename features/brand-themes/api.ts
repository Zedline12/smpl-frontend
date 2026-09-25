import {
  BrandTheme,
  BrandThemeQueue,
  CreateBrandThemeRequest,
  CreateManualBrandThemeRequest,
  LogoSignedUrl,
  UpdateBrandThemeRequest,
} from "./types";

function unwrap<T>(json: any): T {
  return (json?.data ?? json) as T;
}

async function readError(res: Response, fallback: string): Promise<string> {
  const json = await res.json().catch(() => null);
  return json?.error || json?.message || fallback;
}

export async function fetchBrandThemes(limit?: number): Promise<BrandTheme[]> {
  const query = limit ? `?limit=${limit}` : "";
  const res = await fetch(`/api/brand-themes${query}`);
  if (!res.ok) {
    throw new Error(await readError(res, "Failed to load brand themes"));
  }
  const data = unwrap<BrandTheme[]>(await res.json());
  return Array.isArray(data) ? data : [];
}

export async function fetchBrandThemeQueues(): Promise<BrandThemeQueue[]> {
  const res = await fetch("/api/brand-themes/me/queues");
  if (!res.ok) {
    throw new Error(await readError(res, "Failed to load extraction jobs"));
  }
  const data = unwrap<BrandThemeQueue[]>(await res.json());
  return Array.isArray(data) ? data : [];
}

export async function createBrandTheme(
  body: CreateBrandThemeRequest,
): Promise<BrandTheme> {
  const res = await fetch("/api/brand-themes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await readError(res, "Failed to create brand theme"));
  }
  return unwrap<BrandTheme>(await res.json());
}

/** Uses the media controller's signed-url endpoint (same one the media library upload uses). */
export async function fetchLogoSignedUrl(
  contentType: string,
): Promise<LogoSignedUrl> {
  const res = await fetch("/api/media/upload-signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType }),
  });
  if (!res.ok) {
    throw new Error(await readError(res, "Failed to get an upload URL"));
  }
  return unwrap<LogoSignedUrl>(await res.json());
}

async function fetchReferenceImageUrls(): Promise<string[]> {
  const res = await fetch("/api/media/reference-images");
  if (!res.ok) {
    throw new Error(await readError(res, "Failed to load your image library"));
  }
  const json = await res.json();
  return Array.isArray(json?.data) ? json.data : [];
}

/**
 * Same process as uploading a reference image in the media manager: signed URL
 * → PUT → the usable URL is whichever entry newly appears in the user's
 * reference-image library. (The signed URL minus its query string is not a
 * URL the browser can load.)
 */
export async function uploadBrandThemeLogo(file: File): Promise<string> {
  const previousUrls = new Set(await fetchReferenceImageUrls());

  const { url } = await fetchLogoSignedUrl(file.type);
  const putRes = await fetch(url, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });
  if (!putRes.ok) {
    throw new Error("Failed to upload the logo");
  }

  // The library can lag the upload by a moment, so retry once before giving up.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (attempt > 0) await new Promise((resolve) => setTimeout(resolve, 1000));
    const uploaded = (await fetchReferenceImageUrls()).find(
      (candidate) => !previousUrls.has(candidate),
    );
    if (uploaded) return uploaded;
  }

  throw new Error("Logo uploaded, but its URL couldn't be found. Try again.");
}

export async function createManualBrandTheme(
  body: CreateManualBrandThemeRequest,
): Promise<BrandTheme> {
  const res = await fetch("/api/brand-themes/manual", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await readError(res, "Failed to create brand theme"));
  }
  return unwrap<BrandTheme>(await res.json());
}

export async function updateBrandTheme(
  id: string,
  body: UpdateBrandThemeRequest,
): Promise<BrandTheme> {
  const res = await fetch(`/api/brand-themes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await readError(res, "Failed to update brand theme"));
  }
  return unwrap<BrandTheme>(await res.json());
}

export async function deleteBrandTheme(id: string): Promise<void> {
  const res = await fetch(`/api/brand-themes/${id}`, { method: "DELETE" });
  // 204, no body — never parse it.
  if (!res.ok) {
    throw new Error(await readError(res, "Failed to delete brand theme"));
  }
}
