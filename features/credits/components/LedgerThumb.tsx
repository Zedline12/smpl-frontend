"use client";

import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LedgerRow } from "../ledger";

/**
 * A ledger row's first output (opens it in a new tab), or a plain coin tile when the
 * row didn't pay for media.
 */
export function LedgerThumb({
  media,
  count,
  className,
}: {
  media: LedgerRow["media"];
  count?: number;
  className?: string;
}) {
  const box = cn(
    "relative size-10 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]",
    className,
  );
  if (!media) {
    return (
      <span className={cn(box, "flex items-center justify-center text-white/30")}>
        <Coins className="size-4" />
      </span>
    );
  }
  return (
    <a
      href={media.url}
      target="_blank"
      rel="noopener noreferrer"
      title="Open what this paid for"
      className={cn(box, "block transition-opacity hover:opacity-80")}
    >
      {media.type === "video" ? (
        <video src={media.url} muted playsInline preload="metadata" className="h-full w-full object-cover" />
      ) : media.type === "audio" ? (
        <span className="flex h-full w-full items-center justify-center text-[10px] text-white/50">Audio</span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={media.url} alt="" loading="lazy" className="h-full w-full object-cover" />
      )}
      {count && count > 1 ? (
        <span className="absolute bottom-0.5 right-0.5 rounded bg-black/70 px-1 text-[9px] font-semibold text-white">
          {count}
        </span>
      ) : null}
    </a>
  );
}
