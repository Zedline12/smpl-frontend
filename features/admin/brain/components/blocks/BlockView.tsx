import { AlertTriangle, CheckCircle2, Info, OctagonAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BrainBlock, CalloutBlock, StructuredDataPayload, TableBlock } from "../../types";
import { ActionCard } from "./ActionCard";
import { ChartView } from "./ChartView";
import { DataTable } from "./DataTable";
import { KpiGrid } from "./KpiGrid";

const TONES: Record<CalloutBlock["tone"], { icon: typeof Info; className: string }> = {
  info: { icon: Info, className: "border-sky-400/20 bg-sky-400/[0.05] text-sky-100" },
  success: { icon: CheckCircle2, className: "border-emerald-400/20 bg-emerald-400/[0.05] text-emerald-100" },
  warning: { icon: AlertTriangle, className: "border-amber-400/25 bg-amber-400/[0.05] text-amber-100" },
  danger: { icon: OctagonAlert, className: "border-red-400/25 bg-red-400/[0.06] text-red-100" },
};

function Callout({ block }: { block: CalloutBlock }) {
  const tone = TONES[block.tone] ?? TONES.info;
  const Icon = tone.icon;
  return (
    <div className={cn("flex items-start gap-2.5 rounded-xl border px-4 py-3 text-[13px] leading-relaxed", tone.className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0 opacity-80" />
      <p className="min-w-0">{block.text}</p>
    </div>
  );
}

export function BlockView({ block }: { block: BrainBlock }) {
  switch (block.type) {
    case "kpis":
      return <KpiGrid block={block} />;
    case "chart":
      return <ChartView block={block} />;
    case "table":
      return <DataTable block={block} />;
    case "callout":
      return <Callout block={block} />;
    case "action":
      return <ActionCard block={block} />;
    default:
      return null;
  }
}

/** Brain v1 answers kept one list of rows: show it as a table. */
export function legacyTable(data: StructuredDataPayload): TableBlock | null {
  const rows = (data.items ?? []).filter((r) => r && typeof r === "object");
  if (!rows.length) return null;
  const keys = Object.keys(rows[0]).filter((k) => {
    const v = rows[0][k];
    return k !== "_id" && (v === null || typeof v !== "object");
  });
  return {
    type: "table",
    title: `${data.type ? data.type[0].toUpperCase() + data.type.slice(1) : "Results"}${data.count != null ? ` (${data.count})` : ""}`,
    columns: keys.slice(0, 10).map((k) => ({
      key: k,
      label: k.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^\w/, (c) => c.toUpperCase()),
      format: /At$|date/i.test(k) ? "datetime" : undefined,
      link: k === "email" && data.type === "users" && "id" in rows[0] ? "/admin/users/{id}" : undefined,
    })),
    rows,
    total: data.count,
  };
}
