"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

/** Calls /api/admin/billing/* (JSON in, JSON out). */
export async function billingApi<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/admin/billing${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error ?? "Request failed");
  return json as T;
}

export interface Paged<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TimelineEntry {
  at: string;
  status: string;
  note: string;
}

export const money = (cents: number | null | undefined, currency = "usd") =>
  cents == null
    ? "—"
    : new Intl.NumberFormat("en-US", { style: "currency", currency: (currency || "usd").toUpperCase() }).format(cents / 100);

export const when = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "—";

export const day = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { dateStyle: "medium" }) : "—";

/** A Stripe dashboard link for an id (by its prefix); null for unknown ids. */
export function stripeUrl(id: string | null | undefined): string | null {
  if (!id) return null;
  const base = "https://dashboard.stripe.com";
  const [prefix] = id.split("_");
  const path: Record<string, string> = {
    re: "refunds",
    ch: "payments",
    py: "payments",
    pi: "payments",
    in: "invoices",
    cus: "customers",
    sub: "subscriptions",
    dp: "disputes",
    du: "disputes",
    issfr: "radar/early-fraud-warnings",
    evt: "events",
  };
  return path[prefix] ? `${base}/${path[prefix]}/${id}` : null;
}

export function StripeId({ id }: { id: string | null | undefined }) {
  if (!id) return <span className="text-white/30">—</span>;
  const url = stripeUrl(id);
  return url ? (
    <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-mono text-[12px] text-sky-300 hover:underline">
      {id} <ExternalLink className="size-3" />
    </a>
  ) : (
    <span className="font-mono text-[12px] text-white/70">{id}</span>
  );
}

export function UserLink({ userId, email }: { userId: string | null | undefined; email: string | null | undefined }) {
  if (!userId) return <span className="text-white/60">{email ?? "Unknown"}</span>;
  return (
    <Link href={`/admin/users/${userId}`} className="text-white hover:underline" onClick={(e) => e.stopPropagation()}>
      {email ?? userId}
    </Link>
  );
}

const TONES = {
  green: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  amber: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  red: "bg-red-500/15 text-red-300 border-red-500/30",
  sky: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  violet: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  gray: "bg-white/[0.06] text-white/55 border-white/10",
} as const;
export type Tone = keyof typeof TONES;

export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap", TONES[tone])}>
      {children}
    </span>
  );
}

/** A label/value grid for detail views. */
export function Facts({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <dt className="text-[11px] font-medium tracking-wide text-white/40 uppercase">{label}</dt>
          <dd className="mt-0.5 text-[13px] break-words text-white/85">{value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Timeline({ items }: { items: TimelineEntry[] }) {
  if (!items?.length) return <p className="text-sm text-white/40">Nothing yet.</p>;
  return (
    <ol className="space-y-3 border-l border-white/10 pl-4">
      {items.map((t, i) => (
        <li key={i} className="relative">
          <span className="absolute top-1.5 -left-[21px] size-2.5 rounded-full border-2 border-[#111] bg-white/40" />
          <p className="text-[12px] text-white/40">
            {when(t.at)} · <span className="font-medium text-white/60">{t.status}</span>
          </p>
          <p className="text-[13px] text-white/85">{t.note}</p>
        </li>
      ))}
    </ol>
  );
}

export function Section({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#141414] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function Pager({ page, totalPages, total, onPage }: { page: number; totalPages: number; total: number; onPage: (p: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[13px] text-white/50">
      <span>{total.toLocaleString("en-US")} total</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="h-8 rounded-lg border border-white/10 px-3 text-white/70 hover:text-white disabled:opacity-40"
        >
          Previous
        </button>
        <span>
          {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
          className="h-8 rounded-lg border border-white/10 px-3 text-white/70 hover:text-white disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export const inputClass = "h-10 rounded-xl border border-white/[0.08] bg-[#161616] px-3 text-[13px] text-white placeholder:text-white/30";
