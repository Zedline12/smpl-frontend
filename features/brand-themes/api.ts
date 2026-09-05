import {
  BrandTheme,
  BrandThemeQueue,
  CreateBrandThemeRequest,
  CreateManualBrandThemeRequest,
  LogoSignedUrl,
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

export async function fetchLogoSignedUrl(): Promise<LogoSignedUrl> {
  const res = await fetch("/api/brand-themes/logo/signed-url", {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error(await readError(res, "Failed to get an upload URL"));
  }
  return unwrap<LogoSignedUrl>(await res.json());
}

/** Uploads the file and returns the durable object URL (the signed URL minus its query string). */
export async function uploadBrandThemeLogo(file: File): Promise<string> {
  const { url } = await fetchLogoSignedUrl();
  const putRes = await fetch(url, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });
  if (!putRes.ok) {
    throw new Error("Failed to upload the logo");
  }
  return url.split("?")[0];
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

export async function deleteBrandTheme(id: string): Promise<void> {
  const res = await fetch(`/api/brand-themes/${id}`, { method: "DELETE" });
  // 204, no body — never parse it.
  if (!res.ok) {
    throw new Error(await readError(res, "Failed to delete brand theme"));
  }
}
