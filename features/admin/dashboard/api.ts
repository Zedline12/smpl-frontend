"use client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type {
  DashboardCard,
  DashboardCatalog,
  DashboardLayout,
  DashboardRange,
  MetricPayload,
} from "./types";

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/admin/dashboard${path}`, {
    ...init,
    headers: { "Content-Type": "application/json" },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error ?? "Request failed");
  return json as T;
}

export const fetchCatalog = () => api<DashboardCatalog>("/catalog");
export const fetchLayout = () => api<DashboardLayout>("/layout");
export const saveLayout = (cards: DashboardCard[]) =>
  api<DashboardLayout>("/layout", { method: "PUT", body: JSON.stringify({ cards }) });
export const resetLayout = () => api<DashboardLayout>("/layout", { method: "DELETE" });
export const fetchMetric = (id: string, range: DashboardRange, refresh = false) =>
  api<MetricPayload>(`/metric/${encodeURIComponent(id)}?range=${range}${refresh ? "&refresh=1" : ""}`);

export const metricKey = (id: string, range: DashboardRange) => ["admin-dashboard-metric", id, range];

/** One card's numbers (cached a few minutes; the backend caches too). */
export function useMetric(id: string, range: DashboardRange) {
  return useQuery({
    queryKey: metricKey(id, range),
    queryFn: () => fetchMetric(id, range),
    staleTime: 2 * 60_000,
    // Switching the range keeps the old numbers on screen until the new ones arrive.
    placeholderData: keepPreviousData,
  });
}
