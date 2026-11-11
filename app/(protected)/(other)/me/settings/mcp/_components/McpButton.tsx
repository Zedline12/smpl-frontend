"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export const MCP_URL = `${process.env.NEXT_PUBLIC_API_URL?.replace("/v1", "")}/mcp`;

type ClientKey = "chatgpt" | "claude";

const GUIDES: Record<
  ClientKey,
  { label: string; openUrl: string; openLabel: string; steps: React.ReactNode[]; note?: string }
> = {
  chatgpt: {
    label: "ChatGPT",
    openUrl: "https://chatgpt.com/#settings/Connectors",
    openLabel: "Open ChatGPT settings",
    steps: [
      <>
        In ChatGPT on the web, open <b>Settings → Apps &amp; Connectors → Advanced settings</b> and
        turn on <b>Developer mode</b>.
      </>,
      <>
        Click <b>Create</b>, name it <b>SMPL</b>, paste the server URL above and set authentication
        to <b>OAuth</b>. Confirm you trust the app, then create it.
      </>,
      <>
        Sign in to SMPL in the window that opens and click <b>Allow</b>.
      </>,
      <>
        In a new chat, turn on SMPL from the <b>+</b> menu and try &ldquo;How many credits do I
        have?&rdquo; or &ldquo;Generate an image of…&rdquo;.
      </>,
    ],
    note:
      "Developer mode is for paid ChatGPT plans on the web. In Business and Enterprise workspaces an admin may need to allow custom apps, and ChatGPT asks you before any action that spends credits.",
  },
  claude: {
    label: "Claude",
    openUrl: "https://claude.ai/new?modal=add-custom-connector#customize/connectors",
    openLabel: "Open Claude connectors",
    steps: [
      <>
        In Claude, open <b>Settings → Connectors</b> and click <b>Add custom connector</b>.
      </>,
      <>
        Name it <b>SMPL</b>, paste the server URL above and click <b>Add</b>.
      </>,
      <>
        Click <b>Connect</b>, sign in to SMPL and click <b>Allow</b>.
      </>,
      <>
        In a chat, ask &ldquo;How many credits do I have?&rdquo; or &ldquo;Generate an image
        of…&rdquo;.
      </>,
    ],
  },
};

export default function McpButton() {
  const [copied, setCopied] = useState(false);
  const [client, setClient] = useState<ClientKey>("chatgpt");
  const guide = GUIDES[client];

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
      className="flex flex-col gap-4 rounded-2xl border p-5"
      style={{
        background: "rgba(255,255,255,0.045)",
        borderColor: "rgba(255,255,255,0.07)",
      }}
    >
      <div>
        <p className="text-sm font-semibold text-white">Connect SMPL to ChatGPT or Claude</p>
        <p className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
          Check credits, browse your generations and create images, videos and audio from a chat.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <code
          className="min-w-0 flex-1 truncate rounded-lg px-3 py-2 text-xs"
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
          className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
          style={{
            background: copied ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.06)",
            color: copied ? "#22c55e" : "white",
            border: `1px solid ${copied ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.1)"}`,
          }}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy URL"}
        </button>
      </div>

      <div
        role="tablist"
        aria-label="Choose an app"
        className="flex w-fit gap-1 rounded-xl p-1"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {(Object.keys(GUIDES) as ClientKey[]).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={client === key}
            onClick={() => setClient(key)}
            className={cn(
              "cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors",
              client === key ? "bg-primary text-white" : "text-white/50 hover:text-white",
            )}
          >
            {GUIDES[key].label}
          </button>
        ))}
      </div>

      <ol role="tabpanel" className="flex flex-col gap-3">
        {guide.steps.map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="bg-primary/15 text-primary flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold">
              {i + 1}
            </span>
            <p
              className="text-xs leading-relaxed [&_b]:font-semibold [&_b]:text-white/85"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              {step}
            </p>
          </li>
        ))}
      </ol>

      {guide.note && (
        <p
          className="flex gap-2 rounded-lg px-3 py-2 text-[11px] leading-relaxed"
          style={{ background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.45)" }}
        >
          <Info className="mt-px size-3.5 shrink-0" />
          {guide.note}
        </p>
      )}

      <button
        type="button"
        onClick={async () => {
          await copyToClipboard();
          window.open(guide.openUrl, "_blank", "noopener,noreferrer");
        }}
        className="bg-primary inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
      >
        Copy URL &amp; {guide.openLabel.charAt(0).toLowerCase() + guide.openLabel.slice(1)}
        <ExternalLink className="size-3.5" />
      </button>
    </div>
  );
}
