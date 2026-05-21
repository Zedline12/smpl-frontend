"use client";

import { useState } from "react";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = Number(credits) > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/credits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, credits: Number(credits) }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Something went wrong.");
        return;
      }
      onSuccess(json.data?.creditsBalance ?? json.creditsBalance);
      onOpenChange(false);
      setCredits("");
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
            {credits !== "" && Number(credits) <= 0 && (
              <p className="text-xs text-red-400">Amount must be greater than 0.</p>
            )}
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
