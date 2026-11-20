"use client";

import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLiveStore } from "@/features/live/store";
import { isActive } from "@/features/live/types";

export interface UserNotification {
  id: string;
  kind: "generation" | "payment";
  type: string;
  title: string;
  detail: string | null;
  credits: number | null;
  model: string | null;
  href: string | null;
  createdAt: string;
}

interface NotificationsResponse {
  data: UserNotification[];
  unreadCount: number;
}

const KEY = ["notifications"];

async function fetchNotifications(): Promise<NotificationsResponse> {
  const res = await fetch("/api/notifications?limit=30");
  if (!res.ok) throw new Error("Couldn't load notifications");
  const json = await res.json();
  // The backend's response interceptor may wrap the body in `data`.
  const body = json?.data && !Array.isArray(json.data) ? json.data : json;
  return {
    data: Array.isArray(body?.data) ? body.data : [],
    unreadCount: Number(body?.unreadCount) || 0,
  };
}

/** `enabled: false` (no session) fetches nothing. */
export function useNotifications(enabled = true) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: KEY,
    queryFn: fetchNotifications,
    enabled,
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
    staleTime: 15_000,
  });

  // A job finishing (live stream) is when a generation notification appears.
  const finished = useLiveStore(
    (s) => Object.values(s.items).filter((i) => !isActive(i.status)).length,
  );
  const lastFinished = useRef(finished);
  useEffect(() => {
    if (finished > lastFinished.current) {
      // The ledger row lands just after the job: wait a moment before refetching.
      const t = setTimeout(() => queryClient.invalidateQueries({ queryKey: KEY }), 1500);
      lastFinished.current = finished;
      return () => clearTimeout(t);
    }
    lastFinished.current = finished;
  }, [finished, queryClient]);

  const markSeen = useMutation({
    mutationFn: () => fetch("/api/notifications/seen", { method: "POST" }),
    onMutate: () => {
      queryClient.setQueryData<NotificationsResponse>(KEY, (old) =>
        old ? { ...old, unreadCount: 0 } : old,
      );
    },
  });

  return {
    notifications: query.data?.data ?? [],
    unreadCount: query.data?.unreadCount ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    markSeen: () => markSeen.mutate(),
  };
}
