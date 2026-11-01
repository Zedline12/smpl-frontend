"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";

interface SupportCategory {
  id: string;
  slug: string;
  label: string;
}

interface SupportModalProps {
  open: boolean;
  onClose: () => void;
}

export function SupportModal({ open, onClose }: SupportModalProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [categories, setCategories] = useState<SupportCategory[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supportCode, setSupportCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && categories.length === 0) {
      fetch("/api/support/categories")
        .then((r) => r.json())
        .then((data) => {
          const list = Array.isArray(data) ? data : data?.data ?? [];
          setCategories(list);
        })
        .catch(() => {});
    }
  }, [open]);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep("form");
      setCategoryId(null);
      setBody("");
      setError("");
      setSupportCode("");
    }, 300);
  };

  const handleSubmit = async () => {
    if (!categoryId || !body.trim()) return;
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, body: body.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to submit");
      setSupportCode(json.supportCode);
      setStep("success");
    } catch (e: any) {
      setError(e?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)" }}>
        {step === "form" ? (
          <>
            <DialogHeader className="px-6 pt-6 pb-0">
              <DialogTitle className="text-white text-lg font-bold">Contact Support</DialogTitle>
              <p className="text-[13px] mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                Choose a category and describe your issue. We'll get back to you within 24 hours.
              </p>
            </DialogHeader>

            <div className="px-6 py-5 space-y-4">
              {/* Category grid */}
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryId(cat.id)}
                    className="text-left p-3 rounded-xl transition-all duration-150"
                    style={{
                      background: categoryId === cat.id
                        ? "rgba(107,65,255,0.18)"
                        : "rgba(255,255,255,0.04)",
                      border: `1px solid ${categoryId === cat.id ? "rgba(107,65,255,0.4)" : "rgba(255,255,255,0.08)"}`,
                    }}
                  >
                    <p className="text-[13px] font-semibold text-white">{cat.label}</p>
                  </button>
                ))}
                {categories.length === 0 && (
                  <p className="col-span-2 text-[13px] text-center py-4" style={{ color: "rgba(255,255,255,0.3)" }}>
                    Loading categories…
                  </p>
                )}
              </div>

              {/* Body */}
              <div>
                <label className="block text-[12px] font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Describe your issue
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Please provide as much detail as possible..."
                  rows={5}
                  maxLength={5000}
                  className="w-full rounded-xl text-[13px] text-white resize-none p-3 focus:outline-none transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.85)",
                  }}
                />
                <p className="text-right text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                  {body.length}/5000
                </p>
              </div>

              {error && (
                <p className="text-[13px] text-red-400">{error}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleClose}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-medium transition-colors"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!categoryId || !body.trim() || isSubmitting}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all text-white disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #6b41ff 0%, #ea4bff 100%)" }}
                >
                  {isSubmitting ? "Submitting…" : "Submit Request"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="px-6 py-10 flex flex-col items-center text-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)" }}
            >
              <CheckCircle2 className="w-8 h-8" style={{ color: "#4ade80" }} />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg mb-1">Ticket submitted!</h2>
              <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                Our support team will resolve your issue within <strong className="text-white">24 hours</strong>. Your ticket code:
              </p>
            </div>
            <div
              className="px-6 py-3 rounded-xl"
              style={{ background: "rgba(107,65,255,0.12)", border: "1px solid rgba(107,65,255,0.25)" }}
            >
              <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>Support Code</p>
              <p className="text-2xl font-mono font-black" style={{ color: "#9370ff" }}>{supportCode}</p>
            </div>
            <button
              onClick={handleClose}
              className="mt-2 px-8 py-2.5 rounded-xl text-[13px] font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #6b41ff 0%, #ea4bff 100%)" }}
            >
              Done
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
