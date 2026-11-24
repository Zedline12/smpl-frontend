"use client";

import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowRight, AudioLines } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Media } from "@/features/media/types/media";
import type { RecentBody as Body } from "../../types";
import { GRID_COLUMNS } from "../layout";

async function fetchRecent(mediaType: Body["mediaType"], limit: number): Promise<Media[]> {
  const params = new URLSearchParams({ limit: String(limit), offset: "0" });
  if (mediaType !== "all") params.set("type", mediaType);
  const res = await fetch(`/api/media/me?${params}`);
  if (!res.ok) return [];
  const json = await res.json().catch(() => null);
  const data = json?.data?.data ?? json?.data ?? [];
  return Array.isArray(data) ? data : [];
}

/** Continue with the same model. */
const continueHref = (m: Media) =>
  `/create/${m.type === "audio" ? "audio" : m.type === "video" ? "video" : "image"}${m.model ? `?model=${encodeURIComponent(m.model)}` : ""}`;

/**
 * The viewer's own latest creations, loaded in the browser. Shows nothing, header
 * included, for guests or when there's nothing yet.
 */
export function RecentBody({ body, header }: { body: Body; header?: ReactNode }) {
  const { data, isLoading } = useQuery({
    queryKey: ["home-recent-creations", body.mediaType, body.limit],
    queryFn: () => fetchRecent(body.mediaType, body.limit),
    staleTime: 60_000,
  });

  if (isLoading)
    return (
      <div className="flex flex-col gap-5">
      {header}
      <div className={cn("grid gap-3", GRID_COLUMNS[body.columns] ?? GRID_COLUMNS[4])}>
        {Array.from({ length: Math.min(body.limit, body.columns) }, (_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-xl bg-white/[0.04]" />
        ))}
      </div>
      </div>
    );
  if (!data?.length) return null;

  return (
    <div className="flex flex-col gap-5">
      {header}
      <div className="flex flex-col gap-4">
      <div className={cn("grid gap-3", GRID_COLUMNS[body.columns] ?? GRID_COLUMNS[4])}>
        {data!.map((m) => (
          <Link
            key={m.id}
            href={continueHref(m)}
            className="group relative aspect-square overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03]"
          >
            {m.type === "video" ? (
              <video src={m.url} poster={m.posterUrl ?? undefined} muted playsInline preload={m.posterUrl ? "none" : "metadata"} className="size-full object-cover" />
            ) : m.type === "audio" ? (
              <span className="flex size-full items-center justify-center">
                <AudioLines className="size-8 text-white/40" />
              </span>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.thumbUrl || m.url} alt="" loading="lazy" decoding="async" className="size-full object-cover" />
            )}
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent px-2.5 pt-6 pb-2 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
              Continue <ArrowRight className="size-3.5" />
            </span>
          </Link>
        ))}
      </div>
      {body.link?.href && (
        <Link href={body.link.href} className="self-center rounded-lg border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/[0.05]">
          {body.link.label || "View all"}
        </Link>
      )}
      </div>
    </div>
  );
}
