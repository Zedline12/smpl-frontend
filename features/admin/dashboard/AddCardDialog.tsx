"use client";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { CHART_LABELS, type DashboardCard, type MetricCategory, type MetricDef } from "./types";

const CATEGORIES: MetricCategory[] = ["Users", "Generations", "Credits", "Revenue", "Support", "Gifts"];

/** Pick metrics to add, by category, with search. Metrics already on the board are marked. */
export function AddCardDialog({
  open,
  onClose,
  metrics,
  cards,
  full,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  metrics: MetricDef[];
  cards: DashboardCard[];
  /** The board can't take more cards. */
  full: boolean;
  onAdd: (metric: MetricDef) => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<MetricCategory | "All">("All");
  const onBoard = useMemo(() => new Set(cards.map((c) => c.metric)), [cards]);

  const shown = metrics.filter((m) => {
    if (category !== "All" && m.category !== category) return false;
    const q = query.trim().toLowerCase();
    return !q || `${m.title} ${m.description} ${m.category}`.toLowerCase().includes(q);
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-4 overflow-hidden rounded-3xl border border-white/10 bg-neutral-950 p-6 sm:max-w-3xl">
        <div className="pr-10">
          <DialogTitle className="text-xl font-bold text-white">Add a card</DialogTitle>
          <DialogDescription className="text-sm text-white/50">
            Pick what to see. You can change its chart, range and size on the board.
          </DialogDescription>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-48 flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/35" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search metrics"
              autoFocus
              className="focus:border-primary/50 h-10 w-full rounded-xl border border-white/10 bg-black/40 pr-3 pl-9 text-sm text-white placeholder:text-white/30 focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-1 rounded-xl border border-white/[0.08] bg-[#161616] p-1">
            {(["All", ...CATEGORIES] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  "h-8 rounded-lg px-3 text-[12.5px] font-semibold transition-colors",
                  category === c ? "bg-white/[0.1] text-white" : "text-white/50 hover:text-white",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {full && <p className="text-xs text-amber-300">The board is full. Remove a card to add another.</p>}

        <div className="-mx-1 grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-y-auto px-1 sm:grid-cols-2 [scrollbar-width:thin]">
          {shown.map((m) => (
            <button
              key={m.id}
              type="button"
              disabled={full}
              onClick={() => onAdd(m)}
              className="group flex items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3.5 text-left transition-colors hover:border-white/20 hover:bg-white/[0.06] disabled:opacity-40"
            >
              <span className="bg-primary/15 text-primary group-hover:bg-primary flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors group-hover:text-white">
                <Plus className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-white">{m.title}</span>
                  {onBoard.has(m.id) && (
                    <span className="rounded-full bg-white/[0.08] px-1.5 py-0.5 text-[10px] text-white/50">On board</span>
                  )}
                </span>
                <span className="mt-0.5 block text-[12px] leading-snug text-white/45">{m.description}</span>
                <span className="mt-1.5 block text-[11px] text-white/30">
                  {m.category} · {m.charts.map((c) => CHART_LABELS[c]).join(", ")}
                </span>
              </span>
            </button>
          ))}
          {!shown.length && <p className="col-span-full py-8 text-center text-sm text-white/40">No metric matches.</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
