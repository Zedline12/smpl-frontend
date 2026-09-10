"use client";

import { Download, Loader2 } from "lucide-react";
import { downloadFile } from "@/lib/handle-downloads";
import { MarketingStudioCreation, MarketingStudioMediaType } from "../types";

interface CreationResultProps {
  mediaType: MarketingStudioMediaType;
  creation: MarketingStudioCreation | undefined;
}

export function CreationResult({ mediaType, creation }: CreationResultProps) {
  if (!creation) return null;

  const isActive = !creation.media;

  return (
    <div className="border-border bg-card overflow-hidden rounded-2xl border">
      <div className="relative flex min-h-[240px] items-center justify-center bg-black">
        {isActive && (
          <div className="text-muted-foreground flex flex-col items-center gap-2 p-10">
            <Loader2 className="size-6 animate-spin" />
            <span className="text-sm">Generating…</span>
          </div>
        )}

        {creation.media && (
          <>
            {mediaType === "video" ? (
              <video
                src={creation.media.url}
                controls
                autoPlay
                loop
                className="max-h-[55vh] w-full object-contain"
              />
            ) : (
              <img
                src={creation.media.url}
                alt=""
                className="max-h-[55vh] w-full object-contain"
              />
            )}

            <button
              type="button"
              onClick={() =>
                downloadFile(
                  creation.media!.url,
                  `marketing-${mediaType}-${creation.id}`,
                )
              }
              className="absolute top-3 right-3 cursor-pointer rounded-lg bg-black/40 p-2 text-white backdrop-blur-md transition-colors hover:bg-black/60"
              title="Download"
            >
              <Download className="size-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
