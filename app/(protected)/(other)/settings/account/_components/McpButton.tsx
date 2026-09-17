"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

const MCP_URL = `${process.env.NEXT_PUBLIC_API_URL}/mcp`;

export default function McpButton() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(MCP_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard permission denied — nothing more we can do here.
    }
  };

  return (
    <div
      className="rounded-2xl border p-5 flex flex-col gap-3"
      style={{
        background: "oklch(0.13 0 0)",
        borderColor: "rgba(255,255,255,0.07)",
      }}
    >
      <div>
        <p className="text-white font-semibold text-sm">MCP server</p>
        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
          Connect this account to Claude via MCP.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <code
          className="flex-1 min-w-0 truncate rounded-lg px-3 py-2 text-xs"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          {MCP_URL}
        </code>
        <button
          type="button"
          onClick={copyToClipboard}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium flex-shrink-0 transition-colors"
          style={{
            background: copied ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.06)",
            color: copied ? "#22c55e" : "white",
            border: `1px solid ${copied ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.1)"}`,
          }}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy URL"}
        </button>
      </div>

      <a
        href="https://claude.ai/settings/connectors"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-medium transition-colors hover:text-white"
        style={{ color: "rgba(255,255,255,0.45)" }}
      >
        Open Claude.ai connectors →
      </a>
    </div>
  );
}
