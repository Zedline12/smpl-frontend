"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isToday, isYesterday } from "date-fns";
import { CheckCheck } from "lucide-react";
import {
  LEVEL_STYLES,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  notificationKeys,
  type AdminNotification,
  type NotificationLevel,
} from "../api";
import { NotificationItem } from "./NotificationItem";

const FILTERS: { value: NotificationLevel | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "critical", label: "Critical" },
  { value: "important", label: "Important" },
  { value: "ordinary", label: "Ordinary" },
];

function dayLabel(date: Date) {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEEE, MMMM d, yyyy");
}

export function NotificationsHistory() {
  const router = useRouter();
  const qc = useQueryClient();
  const [level, setLevel] = useState<NotificationLevel | "all">("all");
  const [unreadOnly, setUnreadOnly] = useState(false);

  const params = { level: level === "all" ? undefined : level, unread: unreadOnly };
  const query = useInfiniteQuery({
    queryKey: notificationKeys.list({ history: true, ...params }),
    queryFn: ({ pageParam }) => fetchNotifications({ ...params, page: pageParam, limit: 30 }),
    initialPageParam: 1,
    getNextPageParam: (last, pages) => (last.hasMore ? pages.length + 1 : undefined),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: notificationKeys.all });
  const markAll = useMutation({ mutationFn: markAllNotificationsRead, onSuccess: invalidate });
  const markOne = useMutation({ mutationFn: markNotificationRead, onSuccess: invalidate });

  const items = useMemo(() => query.data?.pages.flatMap((p) => p.data ?? []) ?? [], [query.data]);
  const totalCount = query.data?.pages[0]?.totalCount ?? 0;
  const unreadCount = query.data?.pages[0]?.unreadCount ?? 0;

  // Group by calendar day, newest first.
  const groups = useMemo(() => {
    const map = new Map<string, AdminNotification[]>();
    for (const n of items) {
      const key = format(new Date(n.createdAt), "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(n);
    }
    return [...map.entries()];
  }, [items]);

  const open = (n: AdminNotification) => {
    if (!n.readAt) markOne.mutate(n.id);
    if (n.data?.link) router.push(n.data.link);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-neutral-900/40 p-1">
          {FILTERS.map((f) => {
            const active = level === f.value;
            const dot = f.value !== "all" ? LEVEL_STYLES[f.value].dot : null;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setLevel(f.value)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] transition-colors ${
                  active ? "bg-white/10 text-white" : "text-white/50 hover:text-white"
                }`}
              >
                {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-white/60">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="h-3.5 w-3.5 accent-[#6b41ff]"
            />
            Unread only
          </label>
          <button
            type="button"
            onClick={() => markAll.mutate()}
            disabled={!unreadCount || markAll.isPending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-[12px] text-white/60 transition-colors hover:border-white/20 hover:text-white disabled:opacity-40"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        </div>
      </div>

      {!query.isLoading && (
        <p className="text-xs tabular-nums text-white/40">
          {totalCount} notification{totalCount === 1 ? "" : "s"} · {unreadCount} unread
        </p>
      )}

      {query.isLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </div>
      ) : query.isError ? (
        <p className="py-12 text-center text-sm text-red-300">Couldn&apos;t load notifications.</p>
      ) : items.length === 0 ? (
        <p className="py-16 text-center text-sm text-white/40">No notifications here.</p>
      ) : (
        <div className="space-y-6">
          {groups.map(([day, list]) => (
            <section key={day} className="space-y-1.5">
              <h2 className="sticky top-16 z-10 bg-background/90 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/40 backdrop-blur">
                {dayLabel(new Date(list[0].createdAt))}
              </h2>
              <div className="space-y-1 rounded-2xl border border-white/[0.07] bg-neutral-900/30 p-1.5">
                {list.map((n) => (
                  <NotificationItem key={n.id} notification={n} onClick={() => open(n)} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {query.hasNextPage && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => query.fetchNextPage()}
            disabled={query.isFetchingNextPage}
            className="rounded-lg border border-neutral-700 bg-neutral-800/50 px-5 py-2 text-sm text-white/60 transition-colors hover:border-neutral-500 hover:text-white disabled:opacity-50"
          >
            {query.isFetchingNextPage ? "Loading…" : "See more"}
          </button>
        </div>
      )}
    </div>
  );
}
