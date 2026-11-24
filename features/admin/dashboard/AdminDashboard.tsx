"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, LayoutDashboard, Pencil, Plus, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddCardDialog } from "./AddCardDialog";
import { DashboardCardView } from "./DashboardCardView";
import { fetchCatalog, fetchLayout, resetLayout, saveLayout } from "./api";
import type { DashboardCard, DashboardLayout, MetricDef } from "./types";

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

/**
 * The admin home dashboard. Each admin builds their own board: add cards from the
 * metric catalog, choose each card's chart, range and size, drag to reorder, remove.
 * Changes save on their own.
 */
export function AdminDashboard() {
  const qc = useQueryClient();
  const catalog = useQuery({ queryKey: ["admin-dashboard-catalog"], queryFn: fetchCatalog, staleTime: 10 * 60_000 });
  const layout = useQuery({ queryKey: ["admin-dashboard-layout"], queryFn: fetchLayout });

  const [cards, setCards] = useState<DashboardCard[] | null>(null);
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // The board shown: local edits, else what was loaded.
  const board = cards ?? layout.data?.cards ?? [];
  const defs = useMemo(() => new Map((catalog.data?.metrics ?? []).map((m) => [m.id, m])), [catalog.data]);
  const maxCards = catalog.data?.maxCards ?? 40;

  // Save a moment after the last change (one request for a burst of edits).
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const update = (next: DashboardCard[]) => {
    setCards(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSaving(true);
      try {
        const saved = await saveLayout(next);
        qc.setQueryData<DashboardLayout>(["admin-dashboard-layout"], saved);
      } catch (e) {
        toast.error(`Couldn't save the dashboard: ${(e as Error).message}`);
      } finally {
        setSaving(false);
      }
    }, 600);
  };
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const change = (id: string, patch: Partial<DashboardCard>) =>
    update(board.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const remove = (id: string) => update(board.filter((c) => c.id !== id));
  const move = (from: number, to: number) => {
    if (to < 0 || to >= board.length || from === to) return;
    const next = [...board];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    update(next);
  };
  const add = (m: MetricDef) => {
    if (board.length >= maxCards) return;
    update([
      ...board,
      { id: newId(), metric: m.id, chart: m.defaultChart, range: "30d", size: m.kind === "kpi" ? "sm" : "md" },
    ]);
    toast.success(`Added "${m.title}"`);
  };
  const reset = async () => {
    if (!confirm("Reset the dashboard to the default cards?")) return;
    try {
      const fresh = await resetLayout();
      qc.setQueryData(["admin-dashboard-layout"], fresh);
      setCards(null);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const loading = layout.isLoading || catalog.isLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
            <LayoutDashboard className="size-6 text-blue-400" /> Dashboard
          </h1>
          <p className="mt-1 text-sm text-white/50">
            {editing
              ? "Drag cards (or use the arrows) to reorder; pick each card's chart, range and size."
              : "Your board. Edit it to add, remove or rearrange cards."}
            {saving && <span className="ml-2 text-white/35">Saving…</span>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {editing && (
            <>
              <button
                type="button"
                onClick={reset}
                className="flex h-10 items-center gap-1.5 rounded-xl border border-white/10 px-3.5 text-sm text-white/65 hover:text-white"
              >
                <RotateCcw className="size-4" /> Reset
              </button>
              <button
                type="button"
                onClick={() => setAdding(true)}
                disabled={board.length >= maxCards}
                className="flex h-10 items-center gap-1.5 rounded-xl border border-white/10 px-3.5 text-sm font-semibold text-white hover:bg-white/[0.06] disabled:opacity-40"
              >
                <Plus className="size-4" /> Add card
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setEditing((e) => !e)}
            className={cn(
              "flex h-10 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold text-white",
              editing ? "bg-primary hover:bg-primary/90" : "border border-white/10 hover:bg-white/[0.06]",
            )}
          >
            {editing ? (
              <>
                <Check className="size-4" /> Done
              </>
            ) : (
              <>
                <Pencil className="size-4" /> Edit dashboard
              </>
            )}
          </button>
        </div>
      </div>

      {layout.isError ? (
        <p className="text-sm text-red-300">{(layout.error as Error).message}</p>
      ) : loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className={cn("h-36 animate-pulse rounded-2xl bg-white/[0.04]", i >= 4 && "md:col-span-2 h-72")} />
          ))}
        </div>
      ) : !board.length ? (
        <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
          <p className="text-sm text-white/50">Your dashboard is empty.</p>
          <button
            type="button"
            onClick={() => {
              setEditing(true);
              setAdding(true);
            }}
            className="bg-primary hover:bg-primary/90 mt-4 inline-flex h-10 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold text-white"
          >
            <Plus className="size-4" /> Add a card
          </button>
        </div>
      ) : (
        <div className="grid grid-flow-row-dense grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {board.map((card, i) => (
            <DashboardCardView
              key={card.id}
              card={card}
              def={defs.get(card.metric)}
              editing={editing}
              index={i}
              count={board.length}
              onChange={(patch) => change(card.id, patch)}
              onMove={(dir) => move(i, i + dir)}
              onRemove={() => remove(card.id)}
              drag={{
                dragging: dragId === card.id,
                over: overId === card.id && dragId !== card.id,
                onDragStart: () => setDragId(card.id),
                onDragOver: (e) => {
                  e.preventDefault();
                  if (overId !== card.id) setOverId(card.id);
                },
                onDrop: () => {
                  const from = board.findIndex((c) => c.id === dragId);
                  if (from >= 0) move(from, i);
                  setDragId(null);
                  setOverId(null);
                },
                onDragEnd: () => {
                  setDragId(null);
                  setOverId(null);
                },
              }}
            />
          ))}
        </div>
      )}

      <AddCardDialog
        open={adding}
        onClose={() => setAdding(false)}
        metrics={catalog.data?.metrics ?? []}
        cards={board}
        full={board.length >= maxCards}
        onAdd={add}
      />
    </div>
  );
}
