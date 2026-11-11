"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CheckCircle2, Layers, Loader2, XCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useLiveStore } from "./store";
import { JobProgress } from "./JobProgress";
import { LiveItem, isActive, liveItemLabel, liveItemLink } from "./types";

/** Clipping's internal job row duplicates its project; show the project only. */
const visible = (i: LiveItem) => !(i.kind === "job" && i.domain === "clipping-studio");

function JobRow({ item }: { item: LiveItem }) {
  const active = isActive(item.status);
  return (
    <Link
      href={liveItemLink(item)}
      className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.05]"
    >
      <div className="flex items-center gap-2">
        {active ? (
          <Loader2 className="size-3.5 shrink-0 animate-spin text-white/70" />
        ) : item.status === "success" ? (
          <CheckCircle2 className="size-3.5 shrink-0 text-emerald-400" />
        ) : (
          <XCircle className="size-3.5 shrink-0 text-red-400" />
        )}
        <span className="min-w-0 flex-1 truncate text-[13px] text-white">
          {item.title || `Your ${liveItemLabel(item)}`}
        </span>
        <span className="shrink-0 text-[10px] text-white/40 capitalize">{liveItemLabel(item)}</span>
      </div>
      {active ? (
        <JobProgress job={item} size="sm" className="mt-2" />
      ) : (
        <p className={cn("mt-1 truncate pl-5.5 text-[11px]", item.status === "failure" ? "text-red-300/80" : "text-white/40")}>
          {item.status === "success" ? "Ready · View" : item.failedMessage || "Failed"}
        </p>
      )}
    </Link>
  );
}

/** Navbar button with the number of running jobs; opens a list with progress. */
export function JobsIndicator() {
  const items = useLiveStore((s) => s.items);
  const { active, recent } = useMemo(() => {
    const all = Object.values(items).filter(visible);
    const byNewest = (a: LiveItem, b: LiveItem) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
    return {
      active: all.filter((i) => isActive(i.status)).sort(byNewest),
      recent: all.filter((i) => !isActive(i.status)).sort(byNewest).slice(0, 5),
    };
  }, [items]);

  if (!active.length && !recent.length) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={active.length ? `${active.length} jobs running` : "Recent jobs"}
          className="relative flex size-9 items-center justify-center rounded-full border border-white/10 text-white/70 transition-colors hover:border-white/25 hover:text-white"
        >
          {active.length ? (
            <>
              <span className="border-t-primary absolute inset-0 animate-spin rounded-full border-2 border-white/10" />
              <span className="text-[12px] font-bold text-white">{active.length}</span>
            </>
          ) : (
            <Layers className="size-4" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded-2xl border-white/10 bg-[#141518] p-1.5">
        {active.length > 0 && (
          <>
            <p className="px-3 pt-1.5 pb-1 text-[10px] font-semibold tracking-widest text-white/40 uppercase">
              In progress
            </p>
            {active.map((item) => (
              <JobRow key={`${item.kind}:${item.id}`} item={item} />
            ))}
          </>
        )}
        {recent.length > 0 && (
          <>
            <p className="px-3 pt-2 pb-1 text-[10px] font-semibold tracking-widest text-white/40 uppercase">
              Recently finished
            </p>
            {recent.map((item) => (
              <JobRow key={`${item.kind}:${item.id}`} item={item} />
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
