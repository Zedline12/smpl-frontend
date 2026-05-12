"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface Props {
  userId: string;
  userEmail: string;
}

export function DeleteAccountDialog({ userId, userEmail }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const confirmed = input.trim().toLowerCase() === userEmail.toLowerCase();

  async function handleDelete() {
    if (!confirmed) return;
    setIsDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to delete account. Please try again.");
        return;
      }
      router.push("/login");
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsDeleting(false);
    }
  }

  function openDialog() {
    setInput("");
    setError(null);
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={openDialog}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 border hover:bg-red-500/10"
        style={{ color: "#ef4444", borderColor: "rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.06)" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 11v6M14 11v6" strokeLinecap="round" />
        </svg>
        Delete Account
      </button>

      {/* Backdrop + Dialog */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="w-full max-w-md rounded-2xl border p-6 shadow-2xl"
            style={{ background: "oklch(0.13 0 0)", borderColor: "rgba(255,255,255,0.08)" }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold text-base">Delete your account</h3>
                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                  This action is permanent and cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/30 hover:text-white/70 transition-colors ml-4 mt-0.5"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Warning box */}
            <div
              className="rounded-lg p-3 mb-5 text-xs leading-relaxed"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "rgba(255,255,255,0.6)" }}
            >
              All your generations, projects, and data will be permanently deleted.
              Your subscription will be cancelled immediately with no refund.
            </div>

            {/* Email confirmation */}
            <label
              className="block text-xs font-semibold mb-1.5"
              style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.03em" }}
            >
              Type <span className="text-white/80">{userEmail}</span> to confirm
            </label>
            <input
              ref={inputRef}
              type="email"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={userEmail}
              className="w-full mb-4"
              style={{
                background: "oklch(0.18 0 0)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                padding: "10px 12px",
                color: "#fff",
                fontSize: 13,
                outline: "none",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(239,68,68,0.5)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
            />

            {error && (
              <p className="text-xs text-red-400 mb-3 -mt-2">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors hover:bg-white/5"
                style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.55)" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!confirmed || isDeleting}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: confirmed ? "#ef4444" : "rgba(239,68,68,0.3)",
                  color: "#fff",
                  boxShadow: confirmed ? "0 0 16px rgba(239,68,68,0.3)" : "none",
                }}
              >
                {isDeleting ? "Deleting…" : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
