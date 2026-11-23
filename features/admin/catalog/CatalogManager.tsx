"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowUpRight, Check, EyeOff, Loader2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── types (GET /admin/catalog) ────────────────────────────────────────────────

type Kind = "model" | "generator" | "compute";

interface Edit {
  at: string;
  by: string | null;
  changes: Record<string, unknown>;
}

interface Base {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  defaults: { name: string; description: string };
  updatedAt: string | null;
  updatedBy: string | null;
  history: Edit[];
}

interface AdminOffering extends Base {
  kind: Kind;
  mediaType: string;
  provider: string | null;
  internal: boolean;
  renamable: boolean;
  engines: { offering?: string; label: string; name: string }[];
  costFromEngine: boolean;
}

interface AdminStudio extends Base {
  route: string;
  offerings: string[];
}

type Tab = Kind | "studio";

const TABS: { id: Tab; label: string; description: string }[] = [
  { id: "generator", label: "Smpl generators", description: "Our white-label generators. Users never see what they run on." },
  { id: "model", label: "Models", description: "Third-party models we resell. They keep their official names." },
  { id: "compute", label: "Smpl compute", description: "Tools that run on our own servers." },
  { id: "studio", label: "Studios", description: "Pages built from the offerings above." },
];

const card = "rounded-2xl border border-white/[0.08] bg-[#161616]";
const input =
  "w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-[13px] text-white placeholder:text-white/30 focus:border-white/25 focus:outline-none";

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/admin/catalog${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error || json?.message || "Request failed");
  return (json?.data ?? json) as T;
}

const when = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;

// ─── page ──────────────────────────────────────────────────────────────────────

/**
 * What we sell, by kind: Smpl generators, third-party models, Smpl compute, and studio
 * pages. Rename what we brand, rewrite descriptions, hide things (hidden offerings can't
 * be used). Engines are shown here only.
 */
export function CatalogManager() {
  const [tab, setTab] = useState<Tab>("generator");
  const [showInternal, setShowInternal] = useState(false);
  const catalog = useQuery({
    queryKey: ["admin", "catalog"],
    queryFn: () => api<{ offerings: AdminOffering[]; studios: AdminStudio[] }>(""),
  });

  const rows = useMemo(() => {
    if (!catalog.data) return [];
    if (tab === "studio") return catalog.data.studios;
    return catalog.data.offerings.filter((o) => o.kind === tab && (showInternal || !o.internal));
  }, [catalog.data, tab, showInternal]);

  const counts = useMemo(() => {
    const out: Record<Tab, number> = { generator: 0, model: 0, compute: 0, studio: catalog.data?.studios.length ?? 0 };
    for (const o of catalog.data?.offerings ?? []) if (!o.internal) out[o.kind] += 1;
    return out;
  }, [catalog.data]);

  const active = TABS.find((t) => t.id === tab)!;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Catalog</h1>
        <p className="mt-1 text-[13px] text-white/50">
          Everything we sell. Names and descriptions change everywhere users see them; ids never change.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
              tab === t.id ? "bg-white/10 text-white" : "text-white/50 hover:text-white",
            )}
          >
            {t.label}
            <span className="ml-1.5 text-white/35 tabular-nums">{counts[t.id]}</span>
          </button>
        ))}
        {tab === "model" && (
          <label className="ml-auto flex items-center gap-2 text-[12px] text-white/50">
            <input type="checkbox" checked={showInternal} onChange={(e) => setShowInternal(e.target.checked)} />
            Show internal models
          </label>
        )}
      </div>
      <p className="text-[13px] text-white/45">{active.description}</p>

      {catalog.isError ? (
        <p className="text-[13px] text-red-400">{(catalog.error as Error).message}</p>
      ) : !catalog.data ? (
        <div className={cn(card, "flex h-40 items-center justify-center gap-2 text-sm text-white/40")}>
          <Loader2 className="size-4 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <EntryCard key={`${tab}:${row.id}:${row.updatedAt ?? ""}`} row={row} studio={tab === "studio"} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── one entry ─────────────────────────────────────────────────────────────────

/** Offerings with their own content editor (opened from the card). */
const CONTENT_PAGES: Record<string, string> = {
  "smpl-artist-video-clip": "/admin/catalog/artist-video-clip",
};

function EntryCard({ row, studio }: { row: AdminOffering | AdminStudio; studio: boolean }) {
  const queryClient = useQueryClient();
  const offering = studio ? null : (row as AdminOffering);
  const renamable = studio || !!offering?.renamable;
  const [name, setName] = useState(row.name);
  const [description, setDescription] = useState(row.description);

  const save = useMutation({
    mutationFn: (patch: Record<string, unknown>) =>
      api(`/${studio ? "studios" : "offerings"}/${encodeURIComponent(row.id)}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      }),
    onSuccess: () => {
      toast.success(`${name || row.defaults.name} saved`);
      void queryClient.invalidateQueries({ queryKey: ["admin", "catalog"] });
      // The admin's own app shows the new names too.
      void queryClient.invalidateQueries({ queryKey: ["catalog"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "pricing"] });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const patch: Record<string, unknown> = {};
  if (renamable && name.trim() !== row.name) patch.name = name.trim() === row.defaults.name ? null : name.trim();
  if (description.trim() !== row.description)
    patch.description = description.trim() === row.defaults.description ? null : description.trim();
  const dirty = Object.keys(patch).length > 0;
  const customized = row.name !== row.defaults.name || row.description !== row.defaults.description;
  const last = row.history[row.history.length - 1];

  return (
    <div className={cn(card, "p-4", !row.enabled && "opacity-70")}>
      <div className="flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[11px] text-white/50">{row.id}</code>
            {offering?.provider && <span className="text-[11px] text-white/40">by {offering.provider}</span>}
            {offering?.internal && (
              <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-white/45 uppercase">Internal</span>
            )}
            {!row.enabled && (
              <span className="flex items-center gap-1 rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] text-red-300 uppercase">
                <EyeOff className="size-3" /> Hidden
              </span>
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
            <div>
              <label className="mb-1 block text-[11px] text-white/40">Name</label>
              {renamable ? (
                <input className={input} value={name} maxLength={40} onChange={(e) => setName(e.target.value)} />
              ) : (
                <p className="py-2 text-[13px] font-medium text-white" title="Third-party models keep their official names">
                  {row.name}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-white/40">Description</label>
              <input
                className={input}
                value={description}
                maxLength={200}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {offering && offering.kind === "generator" && (
            <p className="text-[12px] text-white/45">
              Runs on{" "}
              <span className="text-white/75">{offering.engines.map((e) => e.name).join(" → ") || "—"}</span>
              {offering.costFromEngine ? " · costs come from it" : " · own cost rate"}
              <span className="ml-2 text-white/30">(never shown to users)</span>
            </p>
          )}
          {studio && (
            <p className="text-[12px] text-white/45">
              Page <code className="text-white/60">{(row as AdminStudio).route}</code>
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <label className="flex items-center gap-2 text-[12px] text-white/60">
            Visible
            <input
              type="checkbox"
              checked={row.enabled}
              disabled={save.isPending}
              onChange={(e) => save.mutate({ enabled: e.target.checked })}
            />
          </label>
          {CONTENT_PAGES[row.id] && (
            <Link
              href={CONTENT_PAGES[row.id]}
              className="flex items-center gap-1 text-[12px] font-medium text-primary hover:text-white"
            >
              Edit content <ArrowUpRight className="size-3.5" />
            </Link>
          )}
          {offering && !offering.internal && (
            <Link
              href={`/admin/credit-pricing?model=${encodeURIComponent(row.id)}`}
              className="flex items-center gap-1 text-[12px] text-white/50 hover:text-white"
            >
              Pricing <ArrowUpRight className="size-3.5" />
            </Link>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3">
        <span className="text-[11px] text-white/35">
          {last ? `Last edited ${when(last.at)}${last.by ? ` by ${last.by}` : ""}` : "Using the defaults"}
        </span>
        <div className="ml-auto flex items-center gap-2">
          {customized && (
            <button
              type="button"
              disabled={save.isPending}
              onClick={() => save.mutate({ ...(renamable ? { name: null } : {}), description: null })}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] text-white/50 hover:bg-white/[0.06] hover:text-white"
            >
              <RotateCcw className="size-3.5" /> Reset to default
            </button>
          )}
          {dirty && (
            <button
              type="button"
              disabled={save.isPending}
              onClick={() => save.mutate(patch)}
              className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[12px] font-semibold text-black hover:bg-white/90 disabled:opacity-60"
            >
              {save.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
