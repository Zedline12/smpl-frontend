"use client";

import { useEffect, useState } from "react";
import { Check, Copy, RotateCcw } from "lucide-react";
import { newErrorId, reportClientError } from "@/lib/error-reporting";

/** Shown when a page crashes: reports it and gives the user an Error ID for support. */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [errorId] = useState(() => newErrorId());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    reportClientError(error, { kind: "react", digest: error.digest, errorId });
  }, [error, errorId]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold tracking-tight text-white">Something went wrong</h2>
        <p className="mx-auto max-w-md text-sm text-white/55">
          We&apos;ve been told about it. Try again, and if it keeps happening, contact support
          with the Error ID below.
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard?.writeText(errorId).then(() => setCopied(true), () => undefined);
        }}
        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-xs text-white/60 hover:text-white"
        title="Copy Error ID"
      >
        Error ID: {errorId}
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      </button>
      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
      >
        <RotateCcw className="size-4" /> Try again
      </button>
    </div>
  );
}
