"use client";

import { useEffect, useState } from "react";
import { newErrorId, reportClientError } from "@/lib/error-reporting";

/**
 * Shown when the root layout itself crashes (it replaces the whole page, so the app's
 * styles aren't loaded: inline styles only).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [errorId] = useState(() => newErrorId());

  useEffect(() => {
    reportClientError(error, { kind: "react-root", digest: error.digest, errorId });
  }, [error, errorId]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#141414",
          color: "#fff",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          textAlign: "center",
          padding: 24,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Something went wrong</h2>
          <p style={{ margin: 0, maxWidth: 420, fontSize: 14, color: "rgba(255,255,255,0.55)" }}>
            We&apos;ve been told about it. Reload the page, and if it keeps happening, contact
            support with this Error ID:
          </p>
          <code
            style={{
              fontSize: 12,
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            {errorId}
          </code>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "8px 16px",
              borderRadius: 12,
              border: 0,
              background: "#fff",
              color: "#000",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
