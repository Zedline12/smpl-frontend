"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchNotifications,
  fetchUnreadCount,
  notificationKeys,
  type NotificationLevel,
} from "./api";
import { enablePush, getPushPermission, onForegroundMessage, type PushPermission } from "./firebase-client";
import { installAudioUnlock, playNotificationSound } from "./sound";

const TOAST_BY_LEVEL = {
  critical: toast.error,
  important: toast.warning,
  ordinary: toast.info,
} as const;

/**
 * Live admin notifications: recent list + unread count, real-time FCM messages
 * (sound + toast), and a 60s polling fallback when push isn't available.
 */
export function useAdminNotifications() {
  const qc = useQueryClient();
  const router = useRouter();
  const [permission, setPermission] = useState<PushPermission>(() => getPushPermission());

  const recent = useQuery({
    queryKey: notificationKeys.list({ recent: true }),
    queryFn: () => fetchNotifications({ page: 1, limit: 15 }),
  });

  const unread = useQuery({
    queryKey: notificationKeys.unread,
    queryFn: fetchUnreadCount,
    // Push keeps this fresh; polling is the fallback when it's off.
    refetchInterval: permission === "granted" ? 5 * 60_000 : 60_000,
  });

  const refresh = useCallback(() => {
    qc.invalidateQueries({ queryKey: notificationKeys.all });
  }, [qc]);

  // Register this browser silently if permission was already granted earlier.
  useEffect(() => {
    installAudioUnlock();
    if (getPushPermission() === "granted") {
      enablePush(false).then(setPermission).catch(() => {});
    }
  }, []);

  // Real-time messages while the tab is open.
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    onForegroundMessage((payload) => {
      const data = payload.data ?? {};
      const level = (data.level as NotificationLevel) || "ordinary";
      playNotificationSound(level);
      TOAST_BY_LEVEL[level](data.title || "New notification", {
        description: data.body,
        duration: level === "critical" ? 15_000 : 6_000,
        action: data.link ? { label: "View", onClick: () => router.push(data.link!) } : undefined,
      });
      refresh();
    }).then((unsub) => {
      if (cancelled) unsub();
      else unsubscribe = unsub;
    });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [refresh, router]);

  const requestPermission = useCallback(async () => {
    try {
      const result = await enablePush(true);
      setPermission(result);
      if (result === "granted") toast.success("Notifications enabled on this browser");
      else if (result === "denied") toast.error("Notifications are blocked in your browser settings");
    } catch {
      toast.error("Couldn't enable notifications");
    }
  }, []);

  return {
    notifications: recent.data?.data ?? [],
    isLoading: recent.isLoading,
    unreadCount: unread.data?.unreadCount ?? recent.data?.unreadCount ?? 0,
    criticalUnread: unread.data?.criticalUnread ?? 0,
    permission,
    requestPermission,
    refresh,
  };
}
