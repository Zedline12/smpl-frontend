import { Brand, BrandInput, BrandQueue } from "./types";

function unwrap<T>(json: unknown): T {
  return ((json as { data?: T })?.data ?? json) as T;
}

async function request<T>(
  url: string,
  init: RequestInit | undefined,
  fallback: string,
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
  });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    const message = json?.error || json?.message;
    throw new Error(
      Array.isArray(message) ? message.join(", ") : message || fallback,
    );
  }
  if (res.status === 204) return undefined as T;
  return unwrap<T>(await res.json());
}

const asList = <T>(data: unknown): T[] =>
  Array.isArray(data) ? (data as T[]) : [];

export const fetchBrands = async (): Promise<Brand[]> =>
  asList<Brand>(
    await request("/api/brands", undefined, "Failed to load brands"),
  );

export const fetchBrand = (id: string) =>
  request<Brand>(`/api/brands/${id}`, undefined, "Failed to load the brand");

export const fetchBrandQueues = async (): Promise<BrandQueue[]> =>
  asList<BrandQueue>(
    await request(
      "/api/brands/me/queues",
      undefined,
      "Failed to load extraction jobs",
    ),
  );

/** Create my brand: starts extracting the website; the brand comes back pending. */
export const createBrandFromWebsite = (websiteUrl: string) =>
  request<Brand>(
    "/api/brands/from-website",
    { method: "POST", body: JSON.stringify({ websiteUrl }) },
    "Couldn't start reading that website",
  );

/** Create brand kit manually. */
export const createBrand = (body: BrandInput) =>
  request<Brand>(
    "/api/brands",
    { method: "POST", body: JSON.stringify(body) },
    "Failed to save the brand",
  );

export const updateBrand = (id: string, body: Partial<BrandInput>) =>
  request<Brand>(
    `/api/brands/${id}`,
    { method: "PATCH", body: JSON.stringify(body) },
    "Failed to save the brand",
  );

export const deleteBrand = (id: string) =>
  request<void>(
    `/api/brands/${id}`,
    { method: "DELETE" },
    "Failed to delete the brand",
  );
