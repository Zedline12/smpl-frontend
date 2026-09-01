"use client";

import { AlertTriangle, Clock, Loader2, RotateCcw } from "lucide-react";
import { useRefundGenerationMutation } from "@/features/generation/hooks/generation";
import { GenerationQueue } from "@/features/generation/types/generation";

export function QueuedGenerationTile({ queue }: { queue: GenerationQueue }) {
  const refund = useRefundGenerationMutation();
  const isProcessing = queue.status === "processing";
  const isRefunding = refund.isPending && refund.variables === queue.id;

  return (
    <div
      className={`group relative aspect-square overflow-hidden rounded-xl flex flex-col items-center justify-center text-center transition-all duration-300 ${
        isProcessing
          ? "bg-black"
          : "bg-neutral-900 border border-neutral-800 text-neutral-400 p-4"
      }`}
    >
      {isProcessing ? (
        <img
          src="/smpl-loading.gif"
          alt="Generating..."
          className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] object-cover rounded-lg"
        />
      ) : (
        <>
          <Clock className="w-8 h-8 mb-3 opacity-50" />
          <span className="text-xs font-medium uppercase tracking-wide">
            Generation is in queue
          </span>
        </>
      )}

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
