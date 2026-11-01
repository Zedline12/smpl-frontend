"use client";

import { Clock, Loader2, RotateCcw } from "lucide-react";
import { useRefundGenerationMutation } from "@/features/generation/hooks/generation";
import { GenerationQueue } from "@/features/generation/types/generation";
import { DjGeneratingTile } from "@/features/artist/components/DjGeneratingTile";
import { RemixGeneratingTile } from "@/features/remix/components/RemixGeneratingTile";
import { MediaDisplayVariant } from "../types/media";

export function QueuedGenerationTile({
  queue,
  height,
  variant = "default",
}: {
  queue: GenerationQueue;
  /** Pixel height of the media cards beside it; without it the tile is 16:9. */
  height?: number;
  /** "music" shows the DJ animation (Artist page); "remix" the film strip (Remix page). */
  variant?: MediaDisplayVariant;
}) {
  const sizeStyle = height ? { height } : undefined;
  const sizeClass = height ? "" : "aspect-video";
  const refund = useRefundGenerationMutation();
  const isProcessing = queue.status === "processing";
  const isEarlyPreview = queue.status === "success" && !!queue.providerUrl && !queue.mediaId;
  const isRefunding = refund.isPending && refund.variables === queue.id;

  // Provider is done but R2 upload is still in progress — show the actual media
  if (isEarlyPreview) {
    const isVideo = queue.type === "video";
    return (
      <div style={sizeStyle} className={`group relative w-full overflow-hidden rounded-xl ${sizeClass}`}>
        {queue.type === "audio" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/[0.04] px-4">
            <audio src={queue.providerUrl} controls className="w-full" />
          </div>
        ) : isVideo ? (
          <video
            src={queue.providerUrl}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <img
            src={queue.providerUrl}
            alt="Generated"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center">
          <span className="flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[10px] text-white/70 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/60" />
            Saving to library…
          </span>
        </div>
      </div>
    );
  }

  if (variant === "music") {
    return <DjGeneratingTile processing={isProcessing} style={sizeStyle} className={sizeClass} />;
  }
  if (variant === "remix") {
    return <RemixGeneratingTile processing={isProcessing} style={sizeStyle} className={sizeClass} />;
  }

  return (
    <div
      style={sizeStyle}
      className={`group relative w-full overflow-hidden rounded-xl border backdrop-blur-xl ${sizeClass} transition-colors duration-300 ${
        isProcessing
          ? "border-primary/25 bg-primary/[0.06]"
          : "border-white/10 bg-white/[0.04]"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent" />

      {/* Scanner: a fading trail whose bottom edge is the bright line. */}
      <div className="animate-scan-down pointer-events-none absolute inset-x-0 h-16">
        <div
          className={`absolute inset-0 bg-gradient-to-b from-transparent ${
            isProcessing ? "to-primary/30" : "to-white/10"
          }`}
        />
        <div
          className={`absolute inset-x-0 bottom-0 h-px ${
            isProcessing
              ? "bg-primary shadow-[0_0_14px_3px_var(--color-primary)]"
              : "bg-white/40"
          }`}
        />
      </div>

      <div className="relative flex h-full flex-col items-center justify-center gap-1.5 text-center">
        <span
          className={`flex items-center gap-2 text-sm font-semibold tracking-wide ${
            isProcessing ? "text-white" : "text-white/60"
          }`}
        >
          {isProcessing ? (
            <span className="bg-primary size-1.5 animate-pulse rounded-full shadow-[0_0_8px_var(--color-primary)]" />
          ) : (
            <Clock className="size-3.5" />
          )}
          {isProcessing ? "Generating" : "In queue"}
        </span>
        <span className="text-[11px] text-white/40">
          {isProcessing ? "Your media is being created…" : "Waiting for a free slot…"}
        </span>
      </div>

      {/* Caution notice — always visible, hidden while hovering so it doesn't
          compete with the refund button. */}
      {/* <div className="pointer-events-none absolute inset-x-2 bottom-2 flex items-start gap-1.5 rounded-lg bg-black/70 p-2 text-left backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-0">
        <AlertTriangle className="mt-px size-3 shrink-0 text-amber-400" />
        <span className="text-[10px] leading-tight text-white/80">
          Taking more than 2 minutes? You can refund this generation.
        </span>
      </div> */}

{/*       
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/65 group-hover:opacity-100">
        <button
          type="button"
          onClick={() => refund.mutate(queue.id)}
          disabled={isRefunding}
          className="flex cursor-pointer items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRefunding ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Refunding…
            </>
          ) : (
            <>
              <RotateCcw className="size-3.5" />
              Refund
            </>
          )}
        </button>
      </div> */}
    </div>
  );
}
