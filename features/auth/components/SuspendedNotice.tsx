"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { LifeBuoy, LogOut, ShieldOff } from "lucide-react";
import { SupportModal } from "@/features/support/components/SupportModal";
import { logout } from "@/features/auth/actions/auth";

export function SuspendedNotice({ email }: { email?: string | null }) {
  const [supportOpen, setSupportOpen] = useState(false);
  const [signingOut, startSignOut] = useTransition();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-12">
      <SupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />

      {/* Soft brand glow behind the card */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-[120px]"
        style={{ background: "radial-gradient(circle, #6b41ff 0%, #ea4bff 45%, transparent 70%)" }}
      />

      <div
        className="relative w-full max-w-[440px] rounded-3xl p-8 text-center"
        style={{
          background: "#0d0d0d",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Image src="/logo.png" alt="Logo" width={200} height={100} className="mx-auto mb-8 h-10 w-25" />

        <div
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}
        >
          <ShieldOff className="h-8 w-8 text-red-400" />
        </div>

        <h1
          className="mb-2 text-white"
          style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 900, letterSpacing: "-0.02em" }}
        >
          Your account has been suspended
        </h1>
        <p className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
          {email ? (
            <>
              Access for <span className="text-white/80">{email}</span> has been paused because of
              activity that goes against our terms.
            </>
          ) : (
            <>Access to this account has been paused because of activity that goes against our terms.</>
          )}{" "}
          If you think this is a mistake, contact our support team and we&apos;ll review it within 24 hours.
        </p>

        <button
          type="button"
          onClick={() => setSupportOpen(true)}
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #6b41ff 0%, #ea4bff 100%)" }}
        >
          <LifeBuoy className="h-4 w-4" />
          Contact Support
        </button>

        <button
          type="button"
          onClick={() => startSignOut(() => logout())}
          disabled={signingOut}
          className="mt-3 inline-flex items-center gap-1.5 text-[13px] transition-colors disabled:opacity-50"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          <LogOut className="h-3.5 w-3.5" />
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </main>
  );
}
