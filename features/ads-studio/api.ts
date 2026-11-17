import {
  AdminAvatar,
  Avatar,
  AvatarInput,
  Product,
  ProductInput,
} from "./types";

function unwrap<T>(json: unknown): T {
  return ((json as { data?: T })?.data ?? json) as T;
}

async function request<T>(
  url: string,
  init?: RequestInit,
  fallback = "Request failed",
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
  });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.error || json?.message || fallback);
  }
  if (res.status === 204) return undefined as T;
  return unwrap<T>(await res.json());
}

const list = <T>(data: T[] | unknown): T[] =>
  Array.isArray(data) ? (data as T[]) : [];

// Products
export const fetchProducts = async () =>
  list<Product>(
    await request("/api/products", undefined, "Failed to load products"),
  );
export const createProduct = (body: ProductInput) =>
  request<Product>(
    "/api/products",
    { method: "POST", body: JSON.stringify(body) },
    "Failed to save the product",
  );
export const updateProduct = (id: string, body: Partial<ProductInput>) =>
  request<Product>(
    `/api/products/${id}`,
    { method: "PATCH", body: JSON.stringify(body) },
    "Failed to save the product",
  );
export const deleteProduct = (id: string) =>
  request<void>(
    `/api/products/${id}`,
    { method: "DELETE" },
    "Failed to delete the product",
  );

// Avatars
export const fetchAvatars = async () =>
  list<Avatar>(
    await request("/api/avatars", undefined, "Failed to load avatars"),
  );
export const createAvatar = (body: AvatarInput) =>
  request<Avatar>(
    "/api/avatars",
    { method: "POST", body: JSON.stringify(body) },
    "Failed to save the avatar",
  );
export const deleteAvatar = (id: string) =>
  request<void>(
    `/api/avatars/${id}`,
    { method: "DELETE" },
    "Failed to delete the avatar",
  );

// Admin: preset avatars
export const fetchAdminAvatars = async () =>
  list<AdminAvatar>(
    await request("/api/admin/avatars", undefined, "Failed to load avatars"),
  );
export const createAdminAvatar = (body: AvatarInput) =>
  request<AdminAvatar>(
    "/api/admin/avatars",
    { method: "POST", body: JSON.stringify(body) },
    "Failed to add the avatar",
  );
export const updateAdminAvatar = (
  id: string,
  body: Partial<AvatarInput & { isActive: boolean }>,
) =>
  request<AdminAvatar>(
    `/api/admin/avatars/${id}`,
    { method: "PATCH", body: JSON.stringify(body) },
    "Failed to save the avatar",
  );
export const deleteAdminAvatar = (id: string) =>
  request<void>(
    `/api/admin/avatars/${id}`,
    { method: "DELETE" },
    "Failed to delete the avatar",
  );
export const reorderAdminAvatars = (ids: string[]) =>
  request<void>(
    "/api/admin/avatars/reorder",
    { method: "POST", body: JSON.stringify({ ids }) },
    "Failed to reorder",
  );
