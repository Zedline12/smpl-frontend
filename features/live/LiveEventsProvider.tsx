"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useLiveStore } from "./store";
import { maybeAskForPermission, notifyFinished, prepareSound, pruneClaims } from "./notifier";
import { LiveItem, isFinished, liveKey } from "./types";

type WithId = { id: string };

/** Puts the item's own object into a cached list (by id), or removes it. */
function mergeInto(queryClient: QueryClient, key: readonly unknown[], data: WithId | undefined, remove = false) {
  if (!data?.id) return;
  queryClient.setQueryData<WithId[]>(key, (old) => {
    const list = Array.isArray(old) ? old : [];
    const rest = list.filter((x) => x.id !== data.id);
    return remove ? rest : [data, ...rest];
  });
}

/** Updates the screens that list this kind of job, then refreshes what it produced. */
function applyToCaches(queryClient: QueryClient, item: LiveItem, finishedNow: boolean) {
  const data = item.data as WithId | undefined;
  const removed = item.status === "removed";

  if (item.kind === "job") {
    if (item.domain === "clipping-studio") return;
    const queueKey =
      item.domain === "marketing-studio" ? ["marketing-studio", "queues"] : ["generation-queues", item.domain ?? "media-generation"];
    mergeInto(queryClient, queueKey, data, removed);
    if (finishedNow) {
      queryClient.invalidateQueries({ queryKey: ["current-user"] }); // credits (used or refunded)
      if (item.status === "success") {
        queryClient.invalidateQueries({ queryKey: ["media"] });
        queryClient.invalidateQueries({ queryKey: ["templates"] });
        queryClient.invalidateQueries({ queryKey: ["user-models"] });
        if (item.domain === "marketing-studio") queryClient.invalidateQueries({ queryKey: ["marketing-studio"] });
      }
    }
    // The saved media arrives a moment after the provider finishes.
    if (item.status === "success" && item.mediaId) queryClient.invalidateQueries({ queryKey: ["media"] });
    return;
  }

  if (item.kind === "clipping" && data) {
    queryClient.setQueryData(["video-clipping", item.id], data);
    queryClient.setQueryData<WithId[]>(["video-clipping"], (old) =>
      Array.isArray(old)
        ? old.some((p) => p.id === item.id)
          ? old.map((p) => (p.id === item.id ? data : p))
          : [data, ...old]
        : old,
    );
    if (finishedNow) queryClient.invalidateQueries({ queryKey: ["current-user"] });
    return;
  }

  if (item.kind === "brand-theme") {
    mergeInto(queryClient, ["brand-themes", "queues"], data, removed);
    if (finishedNow) queryClient.invalidateQueries({ queryKey: ["brand-themes"] });
    return;
  }

  if (item.kind === "video-analysis") {
    mergeInto(queryClient, ["video-analyzer", "queues"], data, removed);
    if (finishedNow) {
      queryClient.invalidateQueries({ queryKey: ["video-analyzer"] });
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    }
  }
}

const MAX_BACKOFF_MS = 30_000;

/**
 * One live connection per signed-in tab: job changes come in as they happen,
 * update the screens, drive progress bars and fire the "done" notifications.
 * While it's down, the old polling hooks take over (they watch `connected`).
 */
export function LiveEventsProvider() {
  const { isAuthenticated } = useCurrentUser();
  const queryClient = useQueryClient();
  const router = useRouter();
  const navigate = useRef((href: string) => router.push(href));
  useEffect(() => {
    navigate.current = (href: string) => router.push(href);
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated || typeof window === "undefined" || !("EventSource" in window)) return;
    prepareSound();
    pruneClaims();

    const store = useLiveStore.getState;
    let source: EventSource | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let backoff = 1000;
    let stopped = false;
    let firstSnapshot = true;

    const handle = (items: LiveItem[], fromSnapshot: boolean) => {
      const previous = store().upsert(items);
      for (const item of items) {
        const before = previous[liveKey(item)];
        const finishedNow = isFinished(item.status) && (!before || !isFinished(before.status));
        applyToCaches(queryClient, item, finishedNow);
        // New job started in this session: offer system notifications once.
        if (!fromSnapshot && item.status === "pending" && !before) maybeAskForPermission();
        // Notify on the change to done. On the very first snapshot, only for things
        // that finished in the last few minutes (claims stop repeats across tabs/reloads).
        if (finishedNow) {
          const recent =
            !fromSnapshot || !firstSnapshot || Date.now() - Date.parse(item.finishedAt ?? item.updatedAt) < 5 * 60 * 1000;
          if (recent) notifyFinished(item, (href) => navigate.current(href));
        }
      }
    };

    const connect = () => {
      if (stopped) return;
      source = new EventSource("/api/live/stream");
      source.addEventListener("open", () => {
        backoff = 1000;
        store().setConnected(true);
      });
      source.addEventListener("snapshot", (e) => {
        try {
          const { items, serverTime } = JSON.parse((e as MessageEvent).data) as { items: LiveItem[]; serverTime: number };
          if (serverTime) store().setClockOffset(serverTime - Date.now());
          handle(items ?? [], true);
          firstSnapshot = false;
        } catch {
          // ignore a malformed snapshot
        }
      });
      source.addEventListener("item", (e) => {
        try {
          handle([JSON.parse((e as MessageEvent).data) as LiveItem], false);
        } catch {
          // ignore a malformed event
        }
      });
      source.addEventListener("error", () => {
        if (store().connected) {
          store().setConnected(false);
          // Wake the polling fallbacks (they stand down while connected).
          for (const key of [["generation-queues"], ["marketing-studio"], ["brand-themes"], ["video-analyzer"], ["video-clipping"]]) {
            queryClient.invalidateQueries({ queryKey: key });
          }
        }
        // The browser retries by itself unless the connection is closed for good
        // (e.g. signed out or the server said no): then retry with backoff.
        if (source?.readyState === EventSource.CLOSED) {
          source.close();
          retryTimer = setTimeout(connect, backoff);
          backoff = Math.min(backoff * 2, MAX_BACKOFF_MS);
        }
      });
    };

    connect();
    return () => {
      stopped = true;
      clearTimeout(retryTimer);
      source?.close();
      store().reset();
    };
  }, [isAuthenticated, queryClient]);

  return null;
}
