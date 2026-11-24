"use client";

import { useState } from "react";
import { Loader2, ScanSearch, Upload } from "lucide-react";

interface Result {
  verdict: "made_with_smpl" | "ai_marker" | "not_found";
  method: "fingerprint" | "marker" | null;
  model: string | null;
  createdOn: string | null;
  type: string | null;
}

async function sha256Hex(file: File): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** "Was this made with smpl?": by file fingerprint, then by the embedded AI marker. */
export function AiCheck() {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (go: () => Promise<Response>) => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await go();
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || json?.message || "Couldn't check this");
      setResult(json?.data ?? json);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const checkFile = async (file: File) => {
    await run(async () => {
      // The fingerprint first (nothing uploaded); the file only if that finds nothing.
      const byHash = await fetch("/api/ai-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sha256: await sha256Hex(file) }),
      });
      const j = await byHash.clone().json().catch(() => null);
      if ((j?.data ?? j)?.verdict === "made_with_smpl" || file.size > 30 * 1024 * 1024) return byHash;
      return fetch("/api/ai-check/file", { method: "POST", headers: { "Content-Type": file.type || "application/octet-stream" }, body: file });
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-white/15 p-8 text-center hover:border-white/30">
        <Upload className="size-6 text-white/50" />
        <span className="text-sm text-white">Choose an image, video or audio file</span>
        <span className="text-xs text-white/40">Checked by its fingerprint first; the file is only sent if needed (up to 30 MB) and never stored.</span>
        <input type="file" className="hidden" accept="image/*,video/*,audio/*" onChange={(e) => e.target.files?.[0] && checkFile(e.target.files[0])} />
      </label>
      <div className="flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="…or paste a link to smpl content"
          className="h-10 flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-white outline-none focus:border-white/30"
        />
        <button
          type="button"
          disabled={!url.trim() || busy}
          onClick={() =>
            run(() => fetch("/api/ai-check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: url.trim() }) }))
          }
          className="h-10 rounded-lg bg-white px-4 text-sm font-semibold text-black disabled:opacity-40"
        >
          Check
        </button>
      </div>

      {busy && <Loader2 className="size-5 animate-spin text-white/50" />}
      {error && <p className="text-sm text-red-400">{error}</p>}
      {result && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center gap-2">
            <ScanSearch className="size-5 text-white/70" />
            <p className="text-lg font-semibold text-white">
              {result.verdict === "made_with_smpl"
                ? "Made with AI on smpl"
                : result.verdict === "ai_marker"
                  ? "Marked as AI-generated (not by smpl)"
                  : "No smpl record found"}
            </p>
          </div>
          {result.verdict !== "not_found" ? (
            <p className="mt-2 text-sm text-white/60">
              {[result.type && `Type: ${result.type}`, result.model && `Model: ${result.model}`, result.createdOn && `Created: ${result.createdOn}`, result.method && `Found by: ${result.method === "fingerprint" ? "file fingerprint" : "embedded marker"}`]
                .filter(Boolean)
                .join(" · ")}
            </p>
          ) : (
            <p className="mt-2 text-sm text-white/60">
              We have no record of this exact file and it carries no smpl marker. That doesn&apos;t prove it isn&apos;t AI-made: it may
              have been edited, re-encoded or made elsewhere.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
