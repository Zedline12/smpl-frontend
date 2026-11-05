export type NotificationLevel = "critical" | "important" | "ordinary";

export type NotificationKind =
  | "blocked_ip_attempt"
  | "threat_user"
  | "risky_user"
  | "new_subscriber"
  | "payment_received"
  | "subscription_canceled"
  | "refund";

export interface AdminNotification {
  id: string;
  kind: NotificationKind;
  level: NotificationLevel;
  title: string;
  body: string;
  data: {
    userId?: string;
    email?: string;
    ip?: string;
    amount?: number;
    currency?: string;
    link?: string;
  };
  readAt: string | null;
  createdAt: string;
}

export interface NotificationsPage {
  data: AdminNotification[];
  totalCount: number;
  unreadCount: number;
  hasMore: boolean;
}

export const LEVEL_STYLES: Record<
  NotificationLevel,
  { label: string; dot: string; chip: string; ring: string }
> = {
  critical: {
    label: "Critical",
    dot: "bg-red-500",
    chip: "bg-red-500/15 text-red-300 border-red-500/30",
    ring: "border-red-500/40",
  },
  important: {
    label: "Important",
    dot: "bg-amber-400",
    chip: "bg-amber-400/15 text-amber-200 border-amber-400/30",
    ring: "border-amber-400/40",
  },
  ordinary: {
    label: "Ordinary",
    dot: "bg-slate-400",
    chip: "bg-slate-400/15 text-slate-200 border-slate-400/30",
    ring: "border-white/15",
  },
};

export const notificationKeys = {
  all: ["admin-notifications"] as const,
  list: (params: object) => ["admin-notifications", "list", params] as const,
  unread: ["admin-notifications", "unread-count"] as const,
};

/** Backend responses may be wrapped in `{ data }`; unwrap the envelope once. */
function unwrap<T>(json: unknown): T {
  const j = json as { data?: unknown } | null;
  if (j && j.data && !Array.isArray(j.data) && typeof j.data === "object") return j.data as T;
  return json as T;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json?.error || "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return unwrap<T>(await res.json());
}

export function fetchNotifications(params: {
  page?: number;
  limit?: number;
  level?: NotificationLevel;
  unread?: boolean;
}): Promise<NotificationsPage> {
  const qs = new URLSearchParams({
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 20),
  });
  if (params.level) qs.set("level", params.level);
  if (params.unread) qs.set("unread", "true");
  return request(`/api/admin/notifications?${qs.toString()}`);
}

export function fetchUnreadCount(): Promise<{ unreadCount: number; criticalUnread: number }> {
  return request("/api/admin/notifications/unread-count");
}

export function markNotificationRead(id: string): Promise<AdminNotification> {
  return request(`/api/admin/notifications/${encodeURIComponent(id)}/read`, { method: "PATCH" });
}

export function markAllNotificationsRead(): Promise<{ updated: number }> {
  return request("/api/admin/notifications/read-all", { method: "PATCH" });
}

// ---- Mobile app pairing ----

export interface AdminDevice {
  id: string;
  platform: "web" | "ios" | "android";
  deviceName: string | null;
  userAgent: string | null;
  email: string | null;
  lastSeenAt: string;
  pairedAt: string | null;
  createdAt: string;
}

export const deviceKeys = { all: ["admin-notification-devices"] as const };

export function createPairingCode(): Promise<{ code: string; expiresAt: string }> {
  return request("/api/admin/notifications/pairing-code", { method: "POST" });
}

export async function fetchDevices(): Promise<AdminDevice[]> {
  const res = await fetch("/api/admin/notifications/devices");
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || "Request failed");
  // The list comes back as `{ data: [...] }` (the generic unwrap skips arrays).
  return Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [];
}

export function removeDevice(id: string): Promise<void> {
  return request(`/api/admin/notifications/devices/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function registerDeviceToken(token: string): Promise<void> {
  return request("/api/admin/notifications/device-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
}
