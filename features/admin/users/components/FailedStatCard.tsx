"use client";

import { useState } from "react";
import { FailedGeneration } from "../types/types";
import { FailedGenerationsDialog } from "./FailedGenerationsDialog";

interface Props {
  count: number;
  failedGenerations: FailedGeneration[];
}

export function FailedStatCard({ count, failedGenerations }: Props) {
  const [open, setOpen] = useState(false);
  const clickable = failedGenerations.length > 0;

  return (
    <>
      <div
        onClick={() => clickable && setOpen(true)}
        className={`rounded-xl border border-white/10 px-5 py-4 flex items-center gap-4 bg-red-900/20 transition-all duration-200 ${
          clickable
            ? "cursor-pointer hover:border-red-500/40 hover:bg-red-900/30 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]"
            : ""
        }`}
      >
        <span className="text-red-400">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-2xl font-bold tabular-nums text-red-400">{count.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Failed</p>
        </div>
        {clickable && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4 text-red-400/50 flex-shrink-0">
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {clickable && (
        <FailedGenerationsDialog
          open={open}
          onOpenChange={setOpen}
          failedGenerations={failedGenerations}
        />
      )}
    </>
  );
}
