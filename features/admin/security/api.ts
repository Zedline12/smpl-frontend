import type { QueryClient } from "@tanstack/react-query";

export type SecurityType = "threat" | "vpn" | "datacenter" | "proxy" | "suspended";

export interface SecurityStats {
  threatCount: number;
  vpnCount: number;
  datacenterCount: number;
  proxyCount: number;
  suspendedCount: number;
  captchaActive?: boolean;
  ipTrackingActive?: boolean;
}

export interface SecurityUser {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  clientIp?: string | null;
  country?: string | null;
  countryCode?: string | null;
  city?: string | null;
  plan?: string;
  creditsBalance?: number;
  isSuspended?: boolean;
  isVpn?: boolean;
  isProxy?: boolean;
  isDataCenter?: boolean;
  isThreat?: boolean;
}

export interface PaidSecurityUser extends SecurityUser {
  subscriptionStatus?: string;
  subscriptionPlanName?: string;
}

export interface BlockedIp {
  id: string;
  ip: string;
  source: "manual" | "suspended";
  note?: string;
  createdAt: string;
  user: { id: string; email?: string; firstName?: string; lastName?: string } | null;
}

export interface Paged<T> {
  data: T[];
  totalCount: number;
  hasMore: boolean;
}

export const PAGE_SIZE = 20;

/** Backend responses are sometimes wrapped in `{ data }`; unwrap once. */
async function readJson<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || json?.message || "Request failed");
  return (json?.data && !Array.isArray(json.data) && "data" in json.data ? json.data : json) as T;
}

export async function fetchStats(): Promise<SecurityStats> {
  const res = await fetch("/api/admin/security/stats");
  if (!res.ok) throw new Error("Failed");
  const json = await res.json();
  return json.data ?? json;
}

export async function fetchSecurityUsers(type: SecurityType, page: number) {
  const params = new URLSearchParams({ type, page: String(page), limit: String(PAGE_SIZE) });
  const res = await fetch(`/api/admin/security/users?${params.toString()}`);
  if (!res.ok) throw new Error("Failed");
  const json = await res.json();
  return json.data ?? json;
}

export async function fetchPaidUsers(page: number): Promise<Paged<PaidSecurityUser>> {
  const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
  return readJson(await fetch(`/api/admin/security/paid-users?${params.toString()}`));
}

export async function fetchBlockedIps(page: number): Promise<Paged<BlockedIp>> {
  const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
  return readJson(await fetch(`/api/admin/security/blocked-ips?${params.toString()}`));
}

export async function addBlockedIp(ip: string, note: string): Promise<void> {
  const res = await fetch("/api/admin/security/blocked-ips", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ip, note }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json?.error || "Couldn't block this IP");
  }
}

export async function removeBlockedIp(id: string): Promise<void> {
  const res = await fetch(`/api/admin/security/blocked-ips/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Couldn't remove this IP");
}

export async function patchUser(userId: string, isSuspended: boolean) {
  const res = await fetch(`/api/admin/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isSuspended }),
  });
  if (!res.ok) throw new Error("Failed");
}

/** Suspending changes every tab (lists, counts, and the IP block list). */
export function invalidateSecurityQueries(qc: QueryClient) {
  for (const key of ["security-users", "security-paid-users", "security-stats", "security-blocked-ips"]) {
    qc.invalidateQueries({ queryKey: [key] });
  }
}

/** "US" → 🇺🇸 */
export function countryFlag(countryCode?: string | null): string {
  if (!countryCode || !/^[a-z]{2}$/i.test(countryCode)) return "";
  return String.fromCodePoint(
    ...countryCode.toUpperCase().split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}
