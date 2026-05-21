"use client";

import { useState } from "react";
import { AddCreditsDialog } from "./AddCreditsDialog";

interface Props {
  userId: string;
  initialBalance: number;
}

export function CreditsCard({ userId, initialBalance }: Props) {
  const [balance, setBalance] = useState(initialBalance);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div className="flex-shrink-0 rounded-xl border border-white/10 bg-neutral-800/50 px-6 py-4 text-center min-w-[140px]">
        <div className="flex items-center justify-center gap-2">
          <p className="text-3xl font-bold tabular-nums">{balance}</p>
          <button
            onClick={() => setDialogOpen(true)}
            className="cursor-pointer flex items-center justify-center w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white/60 hover:text-white flex-shrink-0"
            title="Add credits"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-3.5 h-3.5">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Credits</p>
      </div>

      <AddCreditsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        userId={userId}
        onSuccess={(newBalance) => setBalance(newBalance)}
      />
    </>
  );
}
