"use client";

import { useState } from "react";

interface Props {
  onSuccess: (email: string) => void;
}

export function RequestOtpForm({ onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      console.log(result);
      if (!result.ok) {
        const json = await result.json().catch(() => ({}));
        setError(json.message ?? "Something went wrong. Please try again.");
        return;
      }
      setSent(true);
      setTimeout(() => onSuccess(email), 1200);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1
        className="text-white mb-1.5"
        style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 900, letterSpacing: "-0.02em" }}
      >
        Forgot password
      </h1>
      <p className="text-[13px] mb-[30px]" style={{ color: "rgba(255,255,255,0.4)" }}>
        Enter your email and we'll send you a verification code.
      </p>

      {error && (
        <div className="mb-5 p-3.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {sent ? (
        <div className="p-3.5 rounded-xl border border-white/10 text-sm text-center" style={{ color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.04)" }}>
          If that address exists, a code has been sent.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "0.03em" }}>
              Email address
            </label>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ width: 15, height: 15, color: "rgba(255,255,255,0.3)" }}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full rounded-xl border border-white/10 bg-neutral-800/50 pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#9370ff] focus:ring-1 focus:ring-[#9370ff]/40 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!isValid || loading}
            className="w-full mt-1 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 hover:opacity-90 hover:-translate-y-px active:scale-[0.98]"
            style={{
              padding: "12px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, #6b41ff, #ea4bff)",
              color: "#fff",
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.01em",
              boxShadow: "0 0 24px rgba(107,65,255,0.45)",
            }}
          >
            {loading ? "Sending…" : "Send Code"}
          </button>
        </form>
      )}
    </div>
  );
}
