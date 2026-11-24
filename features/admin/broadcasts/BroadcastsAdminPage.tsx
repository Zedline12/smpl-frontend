"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  createBroadcast,
  deleteBroadcast,
  duplicateBroadcast,
  fetchAdminBroadcasts,
  setBroadcastEnabled,
  updateBroadcast,
} from "@/features/broadcasts/api";
import {
  AUDIENCE_LABELS,
  STATUS_LABELS,
  blankBroadcast,
  type AdminBroadcast,
  type BroadcastInput,
  type BroadcastStatus,
} from "@/features/broadcasts/types";
import { BroadcastForm } from "./BroadcastForm";

const KEY = ["admin-broadcasts"];

const STATUS_STYLE: Record<BroadcastStatus, string> = {
  live: "bg-emerald-500/15 text-emerald-300",
  scheduled: "bg-sky-500/15 text-sky-300",
  ended: "bg-white/10 text-white/50",
  disabled: "bg-white/5 text-white/40",
};

function when(iso: string | null, empty: string) {
  return iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : empty;
}

/** Admin → Announcements: popups shown once to each matching user, with views and clicks. */
export function BroadcastsAdminPage() {
  const qc = useQueryClient();
  const { data: list, isLoading, error } = useQuery({ queryKey: KEY, queryFn: fetchAdminBroadcasts });
  /** null: the list; "new": a new one; otherwise the one being edited. */
  const [editing, setEditing] = useState<AdminBroadcast | "new" | null>(null);

  const refresh = () => qc.invalidateQueries({ queryKey: KEY });
  const onError = (e: Error) => toast.error(e.message);

  const save = useMutation({
    mutationFn: (draft: BroadcastInput) =>
      editing && editing !== "new" ? updateBroadcast(editing.id, draft) : createBroadcast(draft),
    onSuccess: () => {
      toast.success("Saved");
      setEditing(null);
      void refresh();
    },
    onError,
  });
  const toggle = useMutation({
    mutationFn: (b: AdminBroadcast) => setBroadcastEnabled(b.id, !b.enabled),
    onSuccess: () => void refresh(),
    onError,
  });
  const copy = useMutation({
    mutationFn: (b: AdminBroadcast) => duplicateBroadcast(b.id),
    onSuccess: () => {
      toast.success("Copied (off)");
      void refresh();
    },
    onError,
  });
  const remove = useMutation({
    mutationFn: (b: AdminBroadcast) => deleteBroadcast(b.id),
    onSuccess: () => void refresh(),
    onError,
  });

  if (editing) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <h1 className="text-xl font-semibold text-white">{editing === "new" ? "New announcement" : `Edit: ${editing.name}`}</h1>
        <BroadcastForm
          key={editing === "new" ? "new" : editing.id}
          initial={editing === "new" ? blankBroadcast() : editing}
          saving={save.isPending}
          onSave={(draft) => save.mutate(draft)}
          onCancel={() => setEditing(null)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white">Announcements</h1>
          <p className="text-sm text-white/50">
            Popups for signed-in users. Each person sees one once, whether they close it or click it.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="bg-primary hover:bg-primary/90 flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white"
        >
          <Plus className="size-4" /> New announcement
        </button>
      </div>

      {isLoading && <Loader2 className="size-5 animate-spin text-white/40" />}
      {error && <p className="text-sm text-red-400">{(error as Error).message}</p>}
      {list && list.length === 0 && (
        <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-white/45">
          No announcements yet.
        </p>
      )}

      {list && list.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-white/[0.03] text-left text-[11px] tracking-wide text-white/45 uppercase">
              <tr>
                <th className="px-4 py-2.5 font-medium">Announcement</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Who</th>
                <th className="px-4 py-2.5 font-medium">When</th>
                <th className="px-4 py-2.5 text-right font-medium">Viewed</th>
                <th className="px-4 py-2.5 text-right font-medium">Clicked</th>
                <th className="px-4 py-2.5 text-right font-medium">Closed</th>
                <th className="px-4 py-2.5 font-medium">On</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {list.map((b) => (
                <tr key={b.id} className="text-white/80">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{b.name}</div>
                    <div className="max-w-[260px] truncate text-xs text-white/40">{b.design.title}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", STATUS_STYLE[b.status])}>
                      {STATUS_LABELS[b.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">{AUDIENCE_LABELS[b.audience]}</td>
                  <td className="px-4 py-3 text-xs text-white/60">
                    {when(b.startsAt, "When turned on")} → {when(b.endsAt, "no end")}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{b.stats.views}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {b.stats.clicks}
                    <span className="ml-1 text-xs text-white/40">({Math.round(b.stats.clickRate * 100)}%)</span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{b.stats.closes}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={b.enabled}
                      aria-label={b.enabled ? "Turn off" : "Turn on"}
                      disabled={toggle.isPending}
                      onClick={() => toggle.mutate(b)}
                      className={cn("relative h-5 w-9 rounded-full transition-colors", b.enabled ? "bg-primary" : "bg-white/15")}
                    >
                      <span className={cn("absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform", b.enabled && "translate-x-4")} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <IconButton title="Edit" onClick={() => setEditing(b)}>
                        <Pencil className="size-3.5" />
                      </IconButton>
                      <IconButton title="Duplicate" onClick={() => copy.mutate(b)}>
                        <Copy className="size-3.5" />
                      </IconButton>
                      <IconButton
                        title="Delete"
                        danger
                        onClick={() => {
                          if (confirm(`Delete "${b.name}" and its stats?`)) remove.mutate(b);
                        }}
                      >
                        <Trash2 className="size-3.5" />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function IconButton({
  title,
  onClick,
  danger,
  children,
}: {
  title: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={cn(
        "flex size-8 items-center justify-center rounded-md border border-white/10 transition-colors",
        danger ? "text-red-300 hover:bg-red-500/10" : "text-white/70 hover:bg-white/5 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}
