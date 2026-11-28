"use client";

import { useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, GitCommitHorizontal, ImagePlus, Loader2, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { uploadTemplateFile } from "@/features/templates/api";

/** One commit pushed to GitHub (recorded by the backend's GitHub webhook). */
interface SiteUpdate {
  id: string;
  repo: string;
  app: string;
  branch: string;
  sha: string;
  shortSha: string;
  title: string;
  description: string;
  authorName: string;
  authorUsername: string;
  committedAt: string;
  url: string;
  files: { added: number; modified: number; removed: number };
  images: string[];
  features: string[];
  extrasUpdatedBy: string | null;
  extrasUpdatedAt: string | null;
}

interface Page {
  updates: SiteUpdate[];
  total: number;
  page: number;
  hasMore: boolean;
}

type AppFilter = "" | "backend" | "frontend";

const FILTERS: { label: string; value: AppFilter }[] = [
  { label: "All", value: "" },
  { label: "Backend", value: "backend" },
  { label: "Frontend", value: "frontend" },
];

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

const dayKey = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

async function fetchPage(app: AppFilter, page: number): Promise<Page> {
  const params = new URLSearchParams({ page: String(page), limit: "20", ...(app ? { app } : {}) });
  const res = await fetch(`/api/admin/releases?${params}`);
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error ?? "Couldn't load updates");
  return json as Page;
}

/**
 * Every update pushed to the backend and frontend repos, newest first, with its
 * description and date. Read-only: updates can't be switched, rolled back or edited.
 * Admins may attach optional screenshots and a feature list to explain one.
 */
export function UpdatesAdminPage() {
  const [app, setApp] = useState<AppFilter>("");
  const query = useInfiniteQuery({
    queryKey: ["admin-site-updates", app],
    queryFn: ({ pageParam }) => fetchPage(app, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
  });
  const updates = query.data?.pages.flatMap((p) => p.updates) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;

  // Group by day for a readable timeline.
  const groups: { day: string; items: SiteUpdate[] }[] = [];
  for (const u of updates) {
    const day = dayKey(u.committedAt);
    const last = groups[groups.length - 1];
    if (last?.day === day) last.items.push(u);
    else groups.push({ day, items: [u] });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Updates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every change pushed to the backend and frontend, recorded automatically from GitHub. Updates can&apos;t be
          changed or rolled back here; you can add screenshots and a feature list to describe one.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-lg border border-neutral-700 bg-neutral-800/50 p-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setApp(f.value)}
              className={cn(
                "rounded-md px-3 py-1 text-sm font-medium transition-colors",
                app === f.value ? "bg-neutral-700 text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        {!!total && (
          <span className="ml-auto text-xs text-muted-foreground">
            {total} update{total === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {query.isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-white/[0.04]" />
          ))}
        </div>
      )}
      {query.isError && <p className="text-sm text-destructive">{(query.error as Error).message}</p>}
      {!query.isLoading && !query.isError && updates.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-muted-foreground">
          No updates yet. They appear here as soon as code is pushed to GitHub (the GitHub webhook must be set up on
          both repos).
        </div>
      )}

      {groups.map((g) => (
        <section key={g.day} className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{g.day}</h2>
          {g.items.map((u) => (
            <UpdateCard key={u.id} update={u} />
          ))}
        </section>
      ))}

      {query.hasNextPage && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => query.fetchNextPage()}
            disabled={query.isFetchingNextPage}
            className="rounded-lg border border-neutral-700 bg-neutral-800/50 px-5 py-2 text-sm text-muted-foreground transition-colors hover:border-neutral-500 hover:text-foreground disabled:opacity-50"
          >
            {query.isFetchingNextPage ? "Loading…" : "See more"}
          </button>
        </div>
      )}
    </div>
  );
}

function UpdateCard({ update: u }: { update: SiteUpdate }) {
  const [editing, setEditing] = useState(false);
  const hasExtras = u.images.length > 0 || u.features.length > 0;

  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-start gap-3">
        <GitCommitHorizontal className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                u.app === "backend" ? "bg-violet-500/15 text-violet-300" : "bg-sky-500/15 text-sky-300",
              )}
            >
              {u.app}
            </span>
            <h3 className="min-w-0 break-words font-medium text-foreground">{u.title}</h3>
          </div>
          {u.description && (
            <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-foreground/75">{u.description}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>{fmtDate(u.committedAt)}</span>
            {(u.authorName || u.authorUsername) && <span>by {u.authorName || u.authorUsername}</span>}
            <span>
              {u.files.added + u.files.modified + u.files.removed} file
              {u.files.added + u.files.modified + u.files.removed === 1 ? "" : "s"} changed
            </span>
            {u.url ? (
              <a href={u.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-mono hover:text-foreground">
                {u.shortSha} <ExternalLink className="size-3" />
              </a>
            ) : (
              <span className="font-mono">{u.shortSha}</span>
            )}
          </div>

          {hasExtras && !editing && (
            <div className="mt-3 space-y-3">
              {u.features.length > 0 && (
                <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/85">
                  {u.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              )}
              {u.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {u.images.map((src) => (
                    <a key={src} href={src} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="aspect-video w-full object-cover" loading="lazy" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {editing ? (
            <ExtrasEditor update={u} onClose={() => setEditing(false)} />
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              {hasExtras ? <Pencil className="size-3.5" /> : <ImagePlus className="size-3.5" />}
              {hasExtras ? "Edit images & features" : "Add images or features (optional)"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/** The only edit: optional screenshots and a list of the features this update brought. */
function ExtrasEditor({ update, onClose }: { update: SiteUpdate; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [images, setImages] = useState<string[]>(update.images);
  const [features, setFeatures] = useState<string[]>(update.features.length ? update.features : [""]);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const save = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/releases/${update.id}/extras`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images, features: features.map((f) => f.trim()).filter(Boolean) }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Couldn't save");
      return json;
    },
    onSuccess: () => {
      toast.success("Saved");
      void queryClient.invalidateQueries({ queryKey: ["admin-site-updates"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const upload = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadTemplateFile(file);
      setImages((prev) => [...prev, url].slice(0, 12));
    } catch (e) {
      toast.error((e as Error).message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const addUrl = () => {
    const url = imageUrl.trim();
    if (!/^https:\/\//i.test(url)) {
      toast.error("Use an https:// image link");
      return;
    }
    setImages((prev) => [...prev, url].slice(0, 12));
    setImageUrl("");
  };

  const field = "w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-neutral-500";

  return (
    <div className="mt-3 space-y-4 rounded-lg border border-white/10 bg-black/20 p-3">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Features (optional)</p>
        {features.map((f, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={f}
              onChange={(e) => setFeatures((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))}
              placeholder="e.g. Search users by email"
              maxLength={300}
              className={field}
            />
            <button
              type="button"
              aria-label="Remove feature"
              onClick={() => setFeatures((prev) => prev.filter((_, j) => j !== i))}
              className="shrink-0 rounded-lg border border-neutral-700 px-2 text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
        {features.length < 30 && (
          <button
            type="button"
            onClick={() => setFeatures((prev) => [...prev, ""])}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Plus className="size-3.5" /> Add a feature
          </button>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Images (optional)</p>
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {images.map((src) => (
              <div key={src} className="relative overflow-hidden rounded-lg border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="aspect-video w-full object-cover" />
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={() => setImages((prev) => prev.filter((x) => x !== src))}
                  className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        {images.length < 12 && (
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-700 px-3 py-2 text-xs text-muted-foreground hover:text-foreground">
              {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
              Upload
              <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => upload(e.target.files?.[0])} />
            </label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="or paste an image link (https://…)"
              className={cn(field, "min-w-0 flex-1")}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrl())}
            />
            <button type="button" onClick={addUrl} className="rounded-lg border border-neutral-700 px-3 py-2 text-xs text-muted-foreground hover:text-foreground">
              Add
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded-lg border border-neutral-700 px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
          Cancel
        </button>
        <button
          type="button"
          onClick={() => save.mutate()}
          disabled={save.isPending || uploading}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
        >
          {save.isPending && <Loader2 className="size-4 animate-spin" />}
          Save
        </button>
      </div>
    </div>
  );
}
