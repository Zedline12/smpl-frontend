"use client";

import { useEffect, useState } from "react";
import { Check, CircleAlert, Clock, Loader2, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { decideAction } from "../../api";
import type { ActionBlock } from "../../types";

const STATUS: Record<ActionBlock["status"], { label: string; className: string }> = {
  pending: { label: "Waiting for you", className: "bg-amber-500/15 text-amber-300" },
  done: { label: "Done", className: "bg-emerald-500/15 text-emerald-300" },
  cancelled: { label: "Cancelled", className: "bg-white/10 text-white/60" },
  failed: { label: "Failed", className: "bg-red-500/15 text-red-300" },
  expired: { label: "Expired", className: "bg-white/10 text-white/50" },
};

/** Something Brain proposed. Nothing happens until the admin presses Confirm. */
export function ActionCard({ block, onDecided }: { block: ActionBlock; onDecided?: (b: ActionBlock) => void }) {
  const [state, setState] = useState(block);
  const [busy, setBusy] = useState<"confirm" | "cancel" | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // The card's own state wins once the admin decides (the saved message is updated too).
  useEffect(() => {
    if (state.status !== "pending") return;
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, [state.status]);

  const expired = state.status === "pending" && new Date(state.expiresAt).getTime() <= now;
  const status = expired ? "expired" : state.status;
  const minutesLeft = Math.max(0, Math.round((new Date(state.expiresAt).getTime() - now) / 60000));

  const decide = async (decision: "confirm" | "cancel") => {
    setBusy(decision);
    try {
      const next = await decideAction(state.actionId, decision);
      setState(next);
      onDecided?.(next);
      if (next.status === "done") toast.success(next.result || "Done");
      if (next.status === "failed") toast.error(next.result || "It failed");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        status === "pending" ? "border-amber-400/25 bg-amber-400/[0.04]" : "border-white/[0.08] bg-white/[0.02]",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06]">
          <ShieldCheck className="h-4 w-4 text-[#b9a4ff]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[13.5px] font-semibold text-white">{state.title}</p>
            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", STATUS[status].className)}>{STATUS[status].label}</span>
          </div>
          <dl className="mt-3 space-y-1.5">
            {state.details.map((d) => (
              <div key={d.label} className="grid grid-cols-[88px_1fr] gap-3 text-[12.5px]">
                <dt className="text-white/40">{d.label}</dt>
                <dd className={cn("min-w-0 break-words text-white/85", d.label === "Reply" && "whitespace-pre-wrap rounded-lg bg-black/25 px-3 py-2")}>{d.value}</dd>
              </div>
            ))}
          </dl>
          {state.result && status !== "pending" && (
            <p className={cn("mt-3 flex items-start gap-1.5 text-[12.5px]", status === "failed" ? "text-red-300" : "text-white/60")}>
              {status === "failed" ? <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
              {state.result}
            </p>
          )}
          {status === "pending" && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => decide("confirm")}
                disabled={!!busy}
                className="bg-gradient-primary flex h-9 items-center gap-1.5 rounded-lg px-4 text-[13px] font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {busy === "confirm" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Confirm
              </button>
              <button
                type="button"
                onClick={() => decide("cancel")}
                disabled={!!busy}
                className="flex h-9 items-center gap-1.5 rounded-lg border border-white/10 px-4 text-[13px] font-medium text-white/70 hover:bg-white/[0.05] hover:text-white disabled:opacity-60"
              >
                {busy === "cancel" ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                Cancel
              </button>
              <span className="flex items-center gap-1 text-[11.5px] text-white/35">
                <Clock className="h-3 w-3" /> {minutesLeft > 0 ? `Expires in ${minutesLeft} min` : "Expires soon"}
              </span>
            </div>
          )}
          {status === "expired" && state.status === "pending" && (
            <p className="mt-3 text-[12px] text-white/45">This proposal expired. Ask Brain again if you still want it.</p>
          )}
        </div>
      </div>
    </div>
  );
}
