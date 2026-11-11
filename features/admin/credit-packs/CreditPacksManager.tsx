"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreditPack, CreditPackInput, formatPackPrice } from "@/lib/types/credit-pack.type";
import {
  createCreditPack,
  deleteCreditPack,
  fetchAllCreditPacks,
  updateCreditPack,
} from "@/features/credit-packs/api";

const EMPTY: CreditPackInput = {
  name: "",
  description: "",
  credits: 500,
  priceAmount: 9.99,
  currency: "usd",
  stripePriceId: "",
  active: true,
  isMostPopular: false,
  sortOrder: 0,
};

const input =
  "w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-white/70">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-white/35">{hint}</span>}
    </label>
  );
}

function PackDialog({
  pack,
  onClose,
  onSaved,
}: {
  pack: CreditPack | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<CreditPackInput>(pack ? { ...pack } : EMPTY);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof CreditPackInput>(key: K, value: CreditPackInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const valid =
    form.name.trim() && form.credits > 0 && form.priceAmount >= 0 && form.stripePriceId.trim().startsWith("price_");

  const save = async () => {
    setSaving(true);
    try {
      const data: CreditPackInput = {
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
        stripePriceId: form.stripePriceId.trim(),
        currency: form.currency.trim().toLowerCase() || "usd",
      };
      if (pack) await updateCreditPack(pack.id, data);
      else await createCreditPack(data);
      toast.success(pack ? "Pack saved" : "Pack created");
      onSaved();
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && !saving && onClose()}>
      <DialogContent className="bg-card border-border w-[calc(100%-2rem)] max-w-lg rounded-2xl border">
        <DialogHeader>
          <DialogTitle>{pack ? `Edit ${pack.name}` : "New credit pack"}</DialogTitle>
          <DialogDescription>
            Users are charged the Stripe price; the price here is what the app shows. Credit changes apply to new
            purchases.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <Field label="Name">
            <input className={input} value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={60} />
          </Field>
          <Field label="Description">
            <textarea
              className={`${input} resize-none`}
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              maxLength={500}
            />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Credits">
              <input
                type="number"
                min={1}
                className={input}
                value={form.credits}
                onChange={(e) => set("credits", Number(e.target.value))}
              />
            </Field>
            <Field label="Price">
              <input
                type="number"
                min={0}
                step="0.01"
                className={input}
                value={form.priceAmount}
                onChange={(e) => set("priceAmount", Number(e.target.value))}
              />
            </Field>
            <Field label="Currency">
              <input className={input} value={form.currency} onChange={(e) => set("currency", e.target.value)} />
            </Field>
          </div>
          <Field label="Stripe price id" hint="A one-time price from your Stripe dashboard (price_…)">
            <input
              className={`${input} font-mono text-xs`}
              value={form.stripePriceId}
              onChange={(e) => set("stripePriceId", e.target.value)}
              placeholder="price_…"
            />
          </Field>
          <div className="grid grid-cols-3 items-end gap-3">
            <Field label="Order" hint="Lower shows first">
              <input
                type="number"
                className={input}
                value={form.sortOrder}
                onChange={(e) => set("sortOrder", Number(e.target.value))}
              />
            </Field>
            <label className="flex items-center gap-2 pb-2 text-sm text-white/80">
              <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} />
              Buyable
            </label>
            <label className="flex items-center gap-2 pb-2 text-sm text-white/80">
              <input
                type="checkbox"
                checked={form.isMostPopular}
                onChange={(e) => set("isMostPopular", e.target.checked)}
              />
              Most popular
            </label>
          </div>
        </div>
        <div className="mt-2 flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={saving} className="rounded-lg border border-white/15 px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving || !valid}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            {pack ? "Save" : "Create"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Admin: one-time credit packs (sold to active subscribers). */
export function CreditPacksManager() {
  const queryClient = useQueryClient();
  const { data: packs, isLoading } = useQuery({ queryKey: ["credit-packs", "admin"], queryFn: fetchAllCreditPacks });
  const [editing, setEditing] = useState<CreditPack | null | "new">(null);
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["credit-packs"] });

  const remove = async (pack: CreditPack) => {
    if (!confirm(`Delete "${pack.name}"? Past purchases stay in billing history.`)) return;
    try {
      await deleteCreditPack(pack.id);
      toast.success("Pack deleted");
      refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Credit Packs</h1>
          <p className="text-sm text-white/50">
            One-time top-ups for active subscribers. Pack credits don&apos;t reset at renewal.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black"
        >
          <Plus className="size-4" /> New pack
        </button>
      </div>

      {isLoading ? (
        <div className="h-40 animate-pulse rounded-xl bg-white/5" />
      ) : !packs?.length ? (
        <p className="text-sm text-white/40">No credit packs yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-left text-xs text-white/50">
              <tr>
                <th className="px-4 py-3 font-medium">Pack</th>
                <th className="px-4 py-3 font-medium">Credits</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stripe price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {packs.map((pack) => (
                <tr key={pack.id} className="border-t border-white/5 align-top">
                  <td className="max-w-xs px-4 py-3">
                    <div className="flex items-center gap-1.5 font-medium text-white">
                      {pack.name}
                      {pack.isMostPopular && <Star className="size-3.5 fill-amber-400 text-amber-400" />}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-white/40">{pack.description}</p>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{pack.credits.toLocaleString("en-US")}</td>
                  <td className="px-4 py-3 tabular-nums">{formatPackPrice(pack)}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-white/50">{pack.stripePriceId}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] ${
                        pack.active ? "bg-green-900/40 text-green-300" : "bg-neutral-800 text-neutral-400"
                      }`}
                    >
                      {pack.active ? "Buyable" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-white/60">{pack.sortOrder}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button type="button" title="Edit" onClick={() => setEditing(pack)} className="rounded-md p-1.5 text-white/60 hover:bg-white/10">
                        <Pencil className="size-4" />
                      </button>
                      <button type="button" title="Delete" onClick={() => remove(pack)} className="rounded-md p-1.5 text-red-400 hover:bg-white/10">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <PackDialog pack={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSaved={refresh} />
      )}
    </div>
  );
}
