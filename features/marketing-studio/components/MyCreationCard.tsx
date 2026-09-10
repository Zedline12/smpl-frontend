"use client";

import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";
import { MediaCard } from "@/features/media/components/MediaCard";
import { MarketingStudioCreation } from "../types";

function relativeTime(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return formatDistanceToNow(date, { addSuffix: true });
}

export function MyCreationCard({
  creation,
}: {
  creation: MarketingStudioCreation;
}) {
  const timestamp = relativeTime(creation.createdAt);

  return (
    <div className="border-border bg-card flex flex-col overflow-hidden rounded-2xl border">
      {creation.media ? (
        <MediaCard media={creation.media} width={300} height={300} />
      ) : (
        <div className="text-muted-foreground bg-black flex aspect-square flex-col items-center justify-center gap-2">
          <Loader2 className="size-5 animate-spin" />
          <span className="text-xs">Generating…</span>
        </div>
      )}

      <div className="flex flex-col gap-1 p-3">
        <p className="text-foreground line-clamp-2 text-xs font-medium">
          {creation.description}
        </p>
        {timestamp && (
          <p className="text-muted-foreground text-[11px]">{timestamp}</p>
        )}
      </div>
    </div>
  );
}
