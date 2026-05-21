"use client";

import { useState } from "react";

export function ReferralLinkCard({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="rounded-2xl border p-5 flex flex-col gap-3"
      style={{ background: "oklch(0.13 0 0)", borderColor: "rgba(255,255,255,0.07)" }}
    >
      <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
        Your Referral Link
      </p>
      <div className="flex items-center gap-2">
        <div
          className="flex-1 rounded-xl px-4 py-2.5 text-sm font-mono truncate"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {link}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex-shrink-0"
          style={{
            background: copied ? "rgba(34,197,94,0.15)" : "rgba(107,65,255,0.2)",
            color: copied ? "#22c55e" : "#b89dff",
            border: `1px solid ${copied ? "rgba(34,197,94,0.3)" : "rgba(107,65,255,0.3)"}`,
          }}
        >
          {copied ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4 h-4 flex-shrink-0">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 flex-shrink-0">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeLinecap="round" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}
