"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, BellRing, CheckCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { markAllNotificationsRead, markNotificationRead, notificationKeys, type AdminNotification } from "../api";
import { useAdminNotifications } from "../useAdminNotifications";
import { NotificationItem } from "./NotificationItem";

export function NotificationBell() {
  const router = useRouter();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { notifications, isLoading, unreadCount, criticalUnread, permission, requestPermission } =
    useAdminNotifications();

  const invalidate = () => qc.invalidateQueries({ queryKey: notificationKeys.all });
  const markAll = useMutation({ mutationFn: markAllNotificationsRead, onSuccess: invalidate });
  const markOne = useMutation({ mutationFn: markNotificationRead, onSuccess: invalidate });

  const openNotification = (n: AdminNotification) => {
    if (!n.readAt) markOne.mutate(n.id);
    setOpen(false);
    router.push(n.data?.link || "/admin/notifications");
  };

  const badge = unreadCount > 9 ? "9+" : String(unreadCount);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
          className="relative rounded-[10px] p-2 text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white focus:outline-none data-[state=open]:bg-white/[0.06] data-[state=open]:text-white"
        >
          {criticalUnread > 0 ? <BellRing className="h-4 w-4 text-red-400" /> : <Bell className="h-4 w-4" />}
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex">
              {criticalUnread > 0 && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
              )}
              <span className="relative flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                {badge}
              </span>
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[380px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border border-white/10 bg-[#111] p-0 text-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-[11px] text-white/40">{unreadCount ? `${unreadCount} unread` : "You're all caught up"}</p>
          </div>
          <button
            type="button"
            onClick={() => markAll.mutate()}
            disabled={!unreadCount || markAll.isPending}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        </div>

        {permission === "default" && (
          <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] bg-[#6b41ff]/10 px-4 py-2.5">
            <p className="text-[12px] text-white/70">Get real-time alerts with sound on this browser.</p>
            <button
              type="button"
              onClick={requestPermission}
              className="flex-shrink-0 rounded-lg px-2.5 py-1 text-[12px] font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #6b41ff 0%, #ea4bff 100%)" }}
            >
              Enable
            </button>
          </div>
        )}
        {permission === "denied" && (
          <p className="border-b border-white/[0.07] bg-red-500/10 px-4 py-2 text-[11px] text-red-200/80">
            Browser notifications are blocked — allow them in site settings to get real-time alerts.
          </p>
        )}

        <div className="max-h-[420px] space-y-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            </div>
          ) : notifications.length === 0 ? (
            <p className="py-10 text-center text-[13px] text-white/40">No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} compact onClick={() => openNotification(n)} />
            ))
          )}
        </div>

        <Link
          href="/admin/notifications"
          onClick={() => setOpen(false)}
          className="block border-t border-white/[0.07] py-2.5 text-center text-[12px] font-medium text-white/60 transition-colors hover:bg-white/[0.04] hover:text-white"
        >
          View all notifications
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
