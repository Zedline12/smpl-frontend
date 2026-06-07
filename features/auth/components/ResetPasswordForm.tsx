"use client";

import { useState } from "react";
import { PasswordInput } from "./PasswordInput";

interface Props {
  email: string;
  onSuccess: () => void;
  onOtpExpired: () => void;
}

export function ResetPasswordForm({ email, onSuccess, onOtpExpired }: Props) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmMismatch = confirm.length > 0 && confirm !== password;
  const canSubmit = isPasswordValid && confirm === password && confirm.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        onSuccess();
        return;
      }
      const json = await res.json().catch(() => ({}));
      if (res.status === 400) {
        setError("Please verify your code first.");
        setTimeout(onOtpExpired, 2000);
      } else {
        setError(json.message ?? "Something went wrong. Please try again.");
      }
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
        New password
      </h1>
      <p className="text-[13px] mb-[30px]" style={{ color: "rgba(255,255,255,0.4)" }}>
        Choose a strong password for your account.
      </p>

      {error && (
        <div className="mb-5 p-3.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <PasswordInput
          value={password}
          onChange={setPassword}
          onValidationChange={setIsPasswordValid}
        />

        <div className="flex flex-col gap-1.5">
          <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "0.03em" }}>
            Confirm password
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border bg-neutral-800/50 px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 transition-colors"
            style={{
              borderColor: confirmMismatch ? "var(--destructive)" : "rgba(255,255,255,0.1)",
              ...(confirmMismatch ? {} : { ["--tw-ring-color" as any]: "rgba(147,112,255,0.4)" }),
            }}
          />
          {confirmMismatch && (
            <p className="text-xs text-destructive">Passwords don&apos;t match.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={!canSubmit || loading}
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
          {loading ? "Resetting…" : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
