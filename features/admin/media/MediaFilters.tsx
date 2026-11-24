"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

const SORTS = [
  { id: "newest", label: "Newest" },
  { id: "oldest", label: "Oldest" },
  { id: "mostLiked", label: "Liked first" },
  { id: "mostDownloaded", label: "Downloaded first" },
];
const RANGES = [
  { id: "", label: "Any time" },
  { id: "1", label: "Last 24 hours" },
  { id: "7", label: "Last 7 days" },
  { id: "30", label: "Last 30 days" },
  { id: "90", label: "Last 90 days" },
];
const select = "h-9 rounded-lg border border-white/10 bg-[#111] px-2 text-sm text-white";

/** Admin → Media: sort, time range and filters, kept in the URL (shareable, survives refresh). */
export function MediaFilters({ models }: { models: { id: string; name: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [user, setUser] = useState(params.get("user") ?? "");

  const set = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    next.delete("page");
    router.push(`${pathname}?${next}`);
  };
  const any = ["sort", "days", "type", "model", "published", "hidden", "user"].some((k) => params.get(k));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select value={params.get("sort") ?? "newest"} onChange={(e) => set({ sort: e.target.value === "newest" ? "" : e.target.value })} className={select}>
        {SORTS.map((s) => (
          <option key={s.id} value={s.id}>
            Sort: {s.label}
          </option>
        ))}
      </select>
      <select value={params.get("days") ?? ""} onChange={(e) => set({ days: e.target.value })} className={select}>
        {RANGES.map((r) => (
          <option key={r.id} value={r.id}>
            {r.label}
          </option>
        ))}
      </select>
      <select value={params.get("type") ?? ""} onChange={(e) => set({ type: e.target.value })} className={select}>
        <option value="">All types</option>
        <option value="image">Images</option>
        <option value="video">Videos</option>
        <option value="audio">Audio</option>
      </select>
      <select value={params.get("model") ?? ""} onChange={(e) => set({ model: e.target.value })} className={`${select} max-w-[12rem]`}>
        <option value="">All models</option>
        {models.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>
      <select
        value={params.get("hidden") ? "hidden" : (params.get("published") ?? "")}
        onChange={(e) =>
          set(
            e.target.value === "hidden"
              ? { hidden: "true", published: "" }
              : { published: e.target.value, hidden: "" },
          )
        }
        className={select}
      >
        <option value="">Published or not</option>
        <option value="true">Published</option>
        <option value="false">Not published</option>
        <option value="hidden">Hidden after a report</option>
      </select>
      <form
        className="relative min-w-[12rem] flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          set({ user: user.trim() });
        }}
      >
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-white/35" />
        <input value={user} onChange={(e) => setUser(e.target.value)} placeholder="User email or id (Enter)" className="h-9 w-full rounded-lg border border-white/10 bg-white/[0.03] pr-3 pl-8 text-sm text-white outline-none focus:border-white/30" />
      </form>
      {any && (
        <button type="button" onClick={() => { setUser(""); router.push(pathname); }} className="flex h-9 items-center gap-1 rounded-lg px-2 text-sm text-white/60 hover:text-white">
          <X className="size-4" /> Clear
        </button>
      )}
    </div>
  );
}
