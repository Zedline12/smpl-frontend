"use client";

import { useState, useEffect, useCallback } from "react";
import { OtpInput } from "./OtpInput";

interface Props {
  email: string;
  onSuccess: () => void;
}

const COOLDOWN_SECONDS = 60;

export function VerifyOtpForm({ email, onSuccess }: Props) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setLoading(true);
    setError(null);
    setExpired(false);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      if (res.ok) {
        onSuccess();
        return;
      }
      if (res.status === 410) {
        setExpired(true);
        setError("Your code has expired. Request a new one below.");
      } else {
        setError("Invalid code. Please check and try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = useCallback(async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError(null);
    setExpired(false);
    setOtp("");
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setCooldown(COOLDOWN_SECONDS);
    } catch {
      setError("Failed to resend. Please try again.");
    } finally {
      setResending(false);
    }
  }, [email, cooldown, resending]);

  return (
    <div>
      <h1
        className="text-white mb-1.5"
        style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 900, letterSpacing: "-0.02em" }}
      >
        Check your email
      </h1>
      <p className="text-[13px] mb-[30px]" style={{ color: "rgba(255,255,255,0.4)" }}>
        We sent a 6-digit code to{" "}
        <span className="text-white/70 font-medium">{email}</span>
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <OtpInput value={otp} onChange={setOtp} />

        {error && (
          <div className="p-3.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm font-medium text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={otp.length !== 6 || loading}
          className="w-full cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 hover:opacity-90 hover:-translate-y-px active:scale-[0.98]"
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
          {loading ? "Verifying…" : "Verify Code"}
        </button>

        <div className="text-center text-[12px]" style={{ color: "rgba(255,255,255,0.35)" }}>
          {expired || cooldown === 0 ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="font-semibold hover:text-[#b89dff] transition-colors duration-150 disabled:opacity-50"
              style={{ color: "#9370ff" }}
            >
              {resending ? "Sending…" : "Resend code"}
            </button>
          ) : (
            <span>
              Resend available in{" "}
              <span className="font-semibold" style={{ color: "rgba(255,255,255,0.55)" }}>
                {cooldown}s
              </span>
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
