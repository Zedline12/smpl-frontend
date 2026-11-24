"use client";

import { useState } from "react";
import { Check, Copy, Plug } from "lucide-react";

/** The admin connector: the API's origin + /api/mcp/admin (NEXT_PUBLIC_API_URL ends in /api/v1). */
function connectorUrl(): string {
  const api = process.env.NEXT_PUBLIC_API_URL ?? "";
  try {
    return `${new URL(api).origin}/api/mcp/admin`;
  } catch {
    return "/api/mcp/admin";
  }
}

/** How to use Smpl Brain (and the create/edit tools) from Claude. */
export function ClaudeConnectorCard() {
  const url = connectorUrl();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked: the URL is selectable */
    }
  };

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
          <Plug className="size-4 text-white/70" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-white">Use Smpl Admin in Claude</p>
          <p className="mt-0.5 text-[12.5px] leading-relaxed text-white/50">
            Everything Brain sees, plus tools to design announcements and home page sections, make templates, and change
            pricing, discounts and gifts. Designs are created as drafts; money changes show a preview you approve first.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-[12px] text-white/80 select-all">
              {url}
            </code>
            <button
              type="button"
              onClick={copy}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-[12px] text-white/75 hover:bg-white/[0.05]"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <ol className="mt-3 list-decimal space-y-0.5 pl-4 text-[12px] text-white/45">
            <li>In Claude: Settings → Connectors → Add custom connector.</li>
            <li>Name it &quot;Smpl Admin&quot; and paste the URL above.</li>
            <li>Connect, and sign in with this admin account.</li>
          </ol>
          <p className="mt-2 text-[11.5px] text-white/35">
            Only admin accounts can use it. It is separate from the regular Smpl connector users add.
          </p>
        </div>
      </div>
    </section>
  );
}
