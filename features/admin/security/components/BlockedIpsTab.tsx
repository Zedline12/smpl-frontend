"use client";

import { useState, type FormEvent } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ban, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { addBlockedIp, fetchBlockedIps, removeBlockedIp } from "../api";
import { ListSpinner, SeeMoreButton } from "./SecurityBadges";

export default function BlockedIpsTab() {
  const qc = useQueryClient();
  const [ip, setIp] = useState("");
  const [note, setNote] = useState("");

  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["security-blocked-ips"],
      queryFn: ({ pageParam }) => fetchBlockedIps(pageParam),
      initialPageParam: 1,
      getNextPageParam: (last, pages) => (last.hasMore ? pages.length + 1 : undefined),
    });

  const rows = data?.pages.flatMap((p) => p.data ?? []) ?? [];
  const totalCount = data?.pages[0]?.totalCount ?? 0;

  const addMutation = useMutation({
    mutationFn: () => addBlockedIp(ip.trim(), note.trim()),
    onSuccess: () => {
      toast.success(`${ip.trim()} blocked`);
      setIp("");
      setNote("");
      qc.invalidateQueries({ queryKey: ["security-blocked-ips"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => removeBlockedIp(id),
    onSuccess: () => {
      toast.success("IP unblocked");
      qc.invalidateQueries({ queryKey: ["security-blocked-ips"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!ip.trim() || addMutation.isPending) return;
    addMutation.mutate();
  };

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-base font-semibold">Blocked IPs</h2>
        <p className="text-xs text-muted-foreground">
          Requests from these IPs can&apos;t register, log in, or open Stripe checkout. Suspending a
          user blocks their IP automatically; unsuspending them lifts it.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-2 rounded-xl border border-white/10 bg-neutral-900/40 p-3 sm:flex-row"
      >
        <input
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          placeholder="IP address, e.g. 203.0.113.7"
          aria-label="IP address"
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm outline-none placeholder:font-sans placeholder:text-muted-foreground/60 focus:border-white/25"
        />
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optional)"
          aria-label="Note"
          maxLength={200}
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-white/25"
        />
        <button
          type="submit"
          disabled={!ip.trim() || addMutation.isPending}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-700/40 bg-red-900/20 px-4 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-900/40 disabled:opacity-50"
        >
          <Ban className="h-4 w-4" />
          {addMutation.isPending ? "Blocking…" : "Block IP"}
        </button>
      </form>

      {isLoading ? (
        <ListSpinner />
      ) : isError ? (
        <p className="py-8 text-center text-sm text-red-300">Couldn&apos;t load blocked IPs.</p>
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No blocked IPs.</p>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground tabular-nums">{totalCount} blocked</p>
          {rows.map((row) => (
            <div
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-neutral-900/40 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="font-mono text-sm">{row.ip}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  {row.source === "suspended" ? (
                    <span className="rounded-full bg-orange-900/40 px-1.5 text-orange-300">Suspended user</span>
                  ) : (
                    <span className="rounded-full bg-neutral-800 px-1.5 text-neutral-300">Manual</span>
                  )}
                  {row.user && (
                    <a href={`/admin/users/${row.user.id}`} className="underline-offset-2 hover:text-foreground hover:underline">
                      {row.user.email || [row.user.firstName, row.user.lastName].filter(Boolean).join(" ")}
                    </a>
                  )}
                  {row.note && <span className="truncate">· {row.note}</span>}
                  <span>· {new Date(row.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <button
                onClick={() => removeMutation.mutate(row.id)}
                disabled={removeMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Unblock
              </button>
            </div>
          ))}
        </div>
      )}

      {hasNextPage && (
        <SeeMoreButton onClick={() => fetchNextPage()} loading={isFetchingNextPage} />
      )}
    </section>
  );
}
