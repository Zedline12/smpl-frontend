"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Check,
  Download,
  Film,
  Image as ImageIcon,
  Loader2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { downloadFile } from "@/lib/handle-downloads";
import { cn } from "@/lib/utils";
import { useBrandThemesQuery } from "@/features/brand-themes/hooks/use-brand-themes";
import { MarketingStudioCreation } from "../types";
import { CreationPreviewDialog } from "./CreationPreviewDialog";

function relativeTime(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return formatDistanceToNow(date, { addSuffix: true });
}

const ASPECT_CLASS: Record<string, string> = {
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  "1:1": "aspect-square",
  "3:4": "aspect-[3/4]",
  "9:16": "aspect-[9/16]",
  "5:4": "aspect-[5/4]",
};

function IncludeChip({ label, on }: { label: string; on: boolean }) {
  return (
    <span
      className={cn(
        "flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        on
          ? "border-primary/40 bg-primary/15 text-foreground"
          : "border-border text-muted-foreground/60 line-through",
      )}
    >
      {on && <Check className="size-3" />}
      {label}
    </span>
  );
}

function InfoChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="border-border bg-background-light text-muted-foreground flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]">
      {children}
    </span>
  );
}

export function MyCreationCard({
  creation,
}: {
  creation: MarketingStudioCreation;
}) {
  const { data: themes } = useBrandThemesQuery();
  const [previewOpen, setPreviewOpen] = useState(false);

  const { media } = creation;
  const theme = themes?.find((t) => t.id === creation.brandThemeId);
  const isVideo = creation.mediaType === "video";
  const timestamp = relativeTime(creation.createdAt);

  const input = (media?.input ?? {}) as Record<string, unknown>;
  const duration =
    typeof input.durationSeconds === "number" ? input.durationSeconds : null;
  const audio =
    typeof input.generateAudio === "boolean" ? input.generateAudio : null;

  return (
    <>
      <div className="border-border bg-card group flex flex-col overflow-hidden rounded-2xl border">
        {/* Preview */}
        <div
          onClick={() => media && setPreviewOpen(true)}
          className={cn(
            "relative flex w-full items-center justify-center bg-black",
            media
              ? (ASPECT_CLASS[media.aspectRatio] ?? "aspect-square")
              : isVideo
                ? "aspect-video"
                : "aspect-square",
            media && "cursor-pointer",
          )}
        >
          {!media && (
            <div className="text-muted-foreground flex flex-col items-center gap-2">
              <Loader2 className="size-5 animate-spin" />
              <span className="text-xs">Generating…</span>
            </div>
          )}

          {media &&
            (isVideo ? (
              <video
                src={media.url}
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
                onMouseOver={(event) => {
                  void event.currentTarget.play().catch(() => {});
                }}
                onMouseOut={(event) => event.currentTarget.pause()}
              />
            ) : (
              <img
                src={media.url}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            ))}

          <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            {isVideo ? <Film className="size-3" /> : <ImageIcon className="size-3" />}
            {isVideo ? "Video" : "Photo"}
          </span>

          {media && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                downloadFile(media.url, media.id);
              }}
              className="absolute top-2 right-2 cursor-pointer rounded-lg bg-black/50 p-1.5 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/70"
              title="Download"
            >
              <Download className="size-3.5" />
            </button>
          )}
        </div>

        {/* Creation details */}
        <div className="flex flex-col gap-3 p-3.5">
          <p className="text-foreground line-clamp-2 text-sm font-medium">
            {creation.description}
          </p>

          {theme && (
            <div className="flex items-center gap-2">
              <span
                className="border-border size-4 shrink-0 rounded-full border"
                style={{ background: theme.primaryColor ?? "transparent" }}
              />
              <span className="text-muted-foreground truncate text-xs">
                {theme.name}
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            <IncludeChip label="Logo" on={creation.includeLogo} />
            <IncludeChip label="Colour" on={creation.includePrimaryColor} />
            <IncludeChip label="Fonts" on={creation.includeFonts} />
          </div>

          {(media || duration !== null || audio !== null) && (
            <div className="flex flex-wrap gap-1.5">
              {media && <InfoChip>{media.aspectRatio}</InfoChip>}
              {duration !== null && <InfoChip>{duration}s</InfoChip>}
              {audio !== null && (
                <InfoChip>
                  {audio ? (
                    <Volume2 className="size-3" />
                  ) : (
                    <VolumeX className="size-3" />
                  )}
                  {audio ? "Audio" : "No audio"}
                </InfoChip>
              )}
            </div>
          )}

          {timestamp && (
            <p className="text-muted-foreground text-[11px]">{timestamp}</p>
          )}
        </div>
      </div>

      <CreationPreviewDialog
        creation={creation}
        theme={theme}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  );
}
