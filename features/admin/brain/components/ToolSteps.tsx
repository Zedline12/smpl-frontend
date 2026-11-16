"use client";

import { useState } from "react";
import { Check, ChevronDown, Loader2, Wrench, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { dayLabel, duration } from "@/features/admin/components/data-viz/format";
import type { BrainToolCall, ToolStep } from "../types";

const HIDDEN = new Set(["limit", "rowsJson", "items", "series", "x", "format", "chartKind", "tone", "text", "body"]);
const isId = (v: unknown) => typeof v === "string" && /^[a-f0-9]{24}$/i.test(v);

/** "Mar 1 – Mar 31 · by model" from a tool's arguments. */
export function describeArgs(args: Record<string, unknown>): string {
  const parts: string[] = [];
  const from = typeof args.from === "string" ? args.from : null;
  const to = typeof args.to === "string" ? args.to : null;
  if (from || to) parts.push(`${from ? dayLabel(from) : "…"} – ${to ? dayLabel(to) : "today"}`);
  for (const [k, v] of Object.entries(args)) {
    if (k === "from" || k === "to" || HIDDEN.has(k) || v === null || v === undefined || v === "" || isId(v)) continue;
    if (k === "groupBy") parts.push(`by ${v}`);
    else if (k === "period") parts.push(`per ${v}`);
    else if (k === "split") parts.push(`split by ${v}`);
    else if (k === "by") parts.push(`by ${v}`);
    else if (k === "search") parts.push(`“${String(v).slice(0, 30)}”`);
    else if (typeof v === "boolean") parts.push(v ? k : `not ${k}`);
    else parts.push(String(v).slice(0, 30));
  }
  return parts.join(" · ");
}

function StepRow({ label, args, status, ms, error }: { label: string; args: Record<string, unknown>; status: ToolStep["status"]; ms?: number; error?: string | null }) {
  const detail = describeArgs(args);
  return (
    <li className="flex items-start gap-2.5 py-1">
      <span className="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center">
        {status === "running" && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#b9a4ff]" />}
        {status === "ok" && <Check className="h-3.5 w-3.5 text-emerald-400" />}
        {status === "error" && <X className="h-3.5 w-3.5 text-red-400" />}
      </span>
      <span className="min-w-0 flex-1 text-[12.5px]">
        <span className={cn("font-medium", status === "running" ? "text-white/85" : "text-white/65")}>{label}</span>
        {detail && <span className="text-white/35"> · {detail}</span>}
        {error && <span className="block text-[11.5px] text-red-300/80">{error}</span>}
      </span>
      {ms != null && <span className="shrink-0 text-[11px] tabular-nums text-white/30">{duration(ms)}</span>}
    </li>
  );
}

/** Live while Brain works; afterwards a "Used N tools" chip that opens the same list. */
export function ToolSteps({ steps, saved, live }: { steps?: ToolStep[]; saved?: BrainToolCall[]; live: boolean }) {
  const [open, setOpen] = useState(false);
  const rows = steps?.length
    ? steps
    : (saved ?? []).map((t, i) => ({ id: String(i), name: t.name, label: t.label || t.name, args: t.args ?? {}, status: t.ok ? ("ok" as const) : ("error" as const), ms: t.ms, error: t.error ?? undefined }));
  if (!rows.length) return null;

  if (live) {
    return (
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2">
        <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-white/35">Working</p>
        <ul>
          {rows.map((s) => (
            <StepRow key={s.id} {...s} />
          ))}
        </ul>
      </div>
    );
  }

  const failed = rows.filter((r) => r.status === "error").length;
  const total = rows.reduce((n, r) => n + (r.ms ?? 0), 0);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11.5px] font-medium text-white/50 hover:text-white/80"
        aria-expanded={open}
      >
        <Wrench className="h-3 w-3" />
        Used {rows.length} tool{rows.length === 1 ? "" : "s"}
        {failed > 0 && <span className="text-red-300/80">· {failed} failed</span>}
        {total > 0 && <span className="text-white/30">· {duration(total)}</span>}
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <ul className="mt-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-1.5">
          {rows.map((s) => (
            <StepRow key={s.id} {...s} />
          ))}
        </ul>
      )}
    </div>
  );
}
