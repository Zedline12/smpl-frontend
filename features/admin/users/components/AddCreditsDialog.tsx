"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

type TransactionType = "BONUS" | "REFUND";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSuccess: (newBalance: number) => void;
}

export function AddCreditsDialog({ open, onOpenChange, userId, onSuccess }: Props) {
  const [type, setType] = useState<TransactionType>("BONUS");
  const [credits, setCredits] = useState("");
  const [note, setNote] = useState("");
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = Number(credits);
  const isValid = Number.isInteger(amount) && amount > 0 && note.trim().length >= 3;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/credits/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, credits: amount, note: note.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Something went wrong.");
        return;
      }
      const result = json.data ?? json;
      onSuccess(result.creditsBalance);
      toast.success(`Added ${amount.toLocaleString()} credits`);
      void queryClient.invalidateQueries({ queryKey: ["admin", "credit-ledger", userId] });
      onOpenChange(false);
      setCredits("");
      setNote("");
      setType("BONUS");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm w-full p-0 bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden">
        <DialogTitle className="px-6 py-4 border-b border-white/10 text-base font-semibold text-white">
          Add Credits
        </DialogTitle>

        <div className="px-6 py-5 space-y-5">
          {/* Type selector */}
          <div className="space-y-2">
            <label className="text-xs text-white/40 uppercase tracking-wider">Transaction Type</label>
            <div className="flex gap-2">
              {(["BONUS", "REFUND"] as TransactionType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                    type === t
                      ? t === "BONUS"
                        ? "bg-green-500/15 border-green-500/40 text-green-400"
                        : "bg-blue-500/15 border-blue-500/40 text-blue-400"
                      : "bg-neutral-800 border-white/10 text-white/40 hover:text-white/70 hover:border-white/20"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Credits amount */}
          <div className="space-y-2">
            <label className="text-xs text-white/40 uppercase tracking-wider">Amount</label>
            <input
              type="number"
              min={1}
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              placeholder="e.g. 500"
              className="w-full rounded-xl border border-white/10 bg-neutral-800 px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
            {credits !== "" && !(Number.isInteger(amount) && amount > 0) && (
              <p className="text-xs text-red-400">Use a whole number above 0.</p>
            )}
          </div>

          {/* Reason: kept on the ledger row and shown to the user next to it */}
          <div className="space-y-2">
            <label className="text-xs text-white/40 uppercase tracking-wider">Reason</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              rows={2}
              placeholder="e.g. Make-good for the outage on May 3"
              className="w-full resize-none rounded-xl border border-white/10 bg-neutral-800 px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
            <p className="text-[11px] text-white/30">Saved on the credit history and shown to the user.</p>
          </div>

          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSubmit}
              disabled={!isValid || loading}
              className="flex-1 py-2.5 rounded-xl bg-white text-black text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/90 transition-colors"
            >
              {loading ? "Adding…" : "Confirm"}
            </button>
            <button
              onClick={() => onOpenChange(false)}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
