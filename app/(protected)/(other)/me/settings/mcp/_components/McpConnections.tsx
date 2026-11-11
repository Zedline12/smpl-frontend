"use client";

import { useEffect, useState } from "react";
import { Plug, Trash2 } from "lucide-react";

interface McpConnection {
  id: string;
  clientName: string;
  /** Set for apps that identify by URL (e.g. ChatGPT: https://chatgpt.com/...). */
  clientId?: string;
  scope: string;
  lastUsedAt: string | null;
  createdAt: string;
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Logo file for apps we know; others fall back to their initial. */
function logoFor(clientName: string): string | null {
  if (/claude/i.test(clientName)) return "/mcp-clients/Claude.png";
  return null;
}

function ClientLogo({ clientName }: { clientName: string }) {
  const [failed, setFailed] = useState(false);
  const src = logoFor(clientName) ?? `/mcp-clients/${clientName}.png`;

  if (/chatgpt|openai/i.test(clientName)) {
    return (
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold tracking-tight text-white"
        style={{ background: "#10a37f" }}
      >
        GPT
      </div>
    );
  }

  if (failed) {
    return (
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold uppercase"
        style={{
          background: "rgba(255,255,255,0.06)",
          color: "rgba(255,255,255,0.4)",
        }}
      >
        {clientName.charAt(0)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      onError={() => setFailed(true)}
      className="size-9 shrink-0 rounded-lg object-contain"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    />
  );
}

function EmptyState() {
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <Plug className="size-4 shrink-0" style={{ color: "rgba(255,255,255,0.35)" }} />
      <p className="text-xs leading-snug" style={{ color: "rgba(255,255,255,0.55)" }}>
        Nothing connected yet. Follow the steps above to add SMPL to ChatGPT or Claude.
      </p>
    </div>
  );
}

export default function McpConnections() {
  const [connections, setConnections] = useState<McpConnection[] | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    setError(null);
    setConnections(null);
    try {
      const res = await fetch("/api/mcp-oauth/connections");
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || "Failed to load connections.");
        return;
      }
      setConnections(Array.isArray(data?.data ?? data) ? (data?.data ?? data) : []);
    } catch {
      setError("Failed to load connections.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/mcp-oauth/connections/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Failed to delete connection.");
        return;
      }
      setConnections((prev) => prev?.filter((c) => c.id !== id) ?? prev);
      setConfirmingId(null);
    } catch {
      setError("Failed to delete connection.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div
      className="rounded-2xl border p-5 flex flex-col gap-3"
      style={{
        background: "rgba(255,255,255,0.045)",
        borderColor: "rgba(255,255,255,0.07)",
      }}
    >
      <div>
        <p className="text-white font-semibold text-sm">Connected MCP clients</p>
        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
          Apps and agents that have connected to your MCP server.
        </p>
      </div>

      {connections === null && !error && (
        <div className="flex flex-col gap-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-14 rounded-xl animate-pulse"
              style={{ background: "rgba(255,255,255,0.04)" }}
            />
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs" style={{ color: "#ef4444" }}>
            {error}
          </p>
          <button
            type="button"
            onClick={load}
            className="text-xs font-medium flex-shrink-0"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            Try again
          </button>
        </div>
      )}

      {connections?.length === 0 && <EmptyState />}

      {connections?.map((connection) => (
        <div
          key={connection.id}
          className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <ClientLogo clientName={connection.clientName} />
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {connection.clientName}
              </p>
              <p
                className="text-xs mt-0.5 truncate"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                {connection.clientId ? `${hostOf(connection.clientId)} · ` : ""}
                Connected{" "}
                {formatDate(connection.createdAt)}
                {" · "}
                {connection.lastUsedAt
                  ? `Last used ${formatDate(connection.lastUsedAt)}`
                  : "Never used"}
              </p>
            </div>
          </div>

          {confirmingId === connection.id ? (
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setConfirmingId(null)}
                className="text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors hover:bg-white/5"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingId === connection.id}
                onClick={() => handleDelete(connection.id)}
                className="text-xs font-medium px-2.5 py-1.5 rounded-lg disabled:opacity-50"
                style={{
                  background: "rgba(239,68,68,0.15)",
                  color: "#ef4444",
                  border: "1px solid rgba(239,68,68,0.25)",
                }}
              >
                {deletingId === connection.id ? "Deleting…" : "Delete"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              aria-label="Delete connection"
              onClick={() => setConfirmingId(connection.id)}
              className="flex-shrink-0 p-2 rounded-lg transition-colors hover:bg-red-500/10"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
