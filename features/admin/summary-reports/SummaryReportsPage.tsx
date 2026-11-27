"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Download, FileSpreadsheet, Loader2, Mail, Presentation, Send, XCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Frequency = "daily" | "weekly";

interface Settings {
  enabled: boolean;
  frequency: Frequency;
  weekday: number;
  hour: number;
  timezone: string;
  includeAdmins: boolean;
  extraEmails: string[];
  updatedBy: string;
  admins: string[];
  recipients: string[];
  nextSendAt: string | null;
  nextPeriod: string | null;
}
interface Run {
  id: string;
  periodKey: string;
  label: string;
  status: "sending" | "sent" | "failed";
  manual: boolean;
  recipients: string[];
  error: string | null;
  createdAt: string;
  updatedAt: string;
}
type Form = Pick<Settings, "enabled" | "frequency" | "weekday" | "hour" | "timezone" | "includeAdmins"> & { extraEmails: string };

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const HOURS = Array.from({ length: 24 }, (_, h) => h);
const hourLabel = (h: number) => `${String(h).padStart(2, "0")}:00`;

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/admin/summary-reports${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error || json?.message || "Request failed");
  return (json?.data ?? json) as T;
}

function browserZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
function allZones(): string[] {
  try {
    const list = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf?.("timeZone");
    if (list?.length) return list.includes("UTC") ? list : ["UTC", ...list];
  } catch {
    /* older browsers */
  }
  return ["UTC", "Africa/Cairo", "Europe/London", "Europe/Berlin", "Asia/Dubai", "America/New_York", "America/Los_Angeles"];
}
const isoDay = (d: Date) => d.toISOString().slice(0, 10);
function defaultRange() {
  const to = new Date();
  const from = new Date(to.getTime() - 7 * 86_400_000);
  return { from: isoDay(from), to: isoDay(to) };
}

/** What the emailed slides show. */
const SLIDES = ["New free & paid users", "Generation cost & profit (paid vs free)", "Revenue by source and plan", "Failed, stuck & system errors"];

const TABS = [
  "Summary (vs previous period)",
  "New subscriptions",
  "Renewals",
  "Credit packs",
  "Refunds & disputes",
  "Generations per model (paid / free users)",
  "Free vs paid users",
  "New users (with gift status)",
  "Support tickets",
  "Top users",
];

/** App Settings → Summary Reports: summary slides emailed to the admins daily or weekly. */
export function SummaryReportsPage() {
  const qc = useQueryClient();
  const settings = useQuery({ queryKey: ["admin-summary-reports"], queryFn: () => api<Settings>("/settings") });
  const runs = useQuery({ queryKey: ["admin-summary-report-runs"], queryFn: () => api<Run[]>("/runs") });
  const zones = useMemo(allZones, []);
  const [draft, setDraft] = useState<Form | null>(null);
  const [range, setRange] = useState(defaultRange);
  const [downloading, setDownloading] = useState<"pdf" | "xlsx" | null>(null);

  const s = settings.data;
  const neverSaved = !!s && !s.updatedBy;
  const form: Form | null =
    draft ??
    (s
      ? {
          enabled: s.enabled,
          frequency: s.frequency,
          weekday: s.weekday,
          hour: s.hour,
          // First setup: suggest this browser's zone.
          timezone: neverSaved && s.timezone === "UTC" ? browserZone() : s.timezone,
          includeAdmins: s.includeAdmins,
          extraEmails: s.extraEmails.join(", "),
        }
      : null);
  const set = (patch: Partial<Form>) => form && setDraft({ ...form, ...patch });

  const save = useMutation({
    mutationFn: (f: Form) =>
      api<Settings>("/settings", {
        method: "PUT",
        body: JSON.stringify({
          ...f,
          extraEmails: f.extraEmails
            .split(/[\s,;]+/)
            .map((e) => e.trim())
            .filter(Boolean),
        }),
      }),
    onSuccess: (next) => {
      qc.setQueryData(["admin-summary-reports"], next);
      setDraft(null);
      toast.success(next.enabled ? "Saved: reports are on" : "Saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const sendNow = useMutation({
    mutationFn: () => api<{ result: string }>("/send-now", { method: "POST" }),
    onSuccess: (r) => {
      void qc.invalidateQueries({ queryKey: ["admin-summary-report-runs"] });
      if (r.result === "sent") toast.success("Report sent");
      else if (r.result === "no-recipients") toast.error("No one to send to: add an email or include admins");
      else toast.error("Sending failed: see the history below");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const download = async (format: "pdf" | "xlsx") => {
    if (!range.from || !range.to) return;
    setDownloading(format);
    try {
      const from = new Date(`${range.from}T00:00:00`);
      const to = new Date(new Date(`${range.to}T00:00:00`).getTime() + 86_400_000);
      const res = await fetch(`/api/admin/summary-reports/download?from=${from.toISOString()}&to=${to.toISOString()}&format=${format}`);
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || "Couldn't build the report");
      }
      const blob = await res.blob();
      const name = /filename="([^"]+)"/.exec(res.headers.get("Content-Disposition") ?? "")?.[1] ?? `smpl-summary.${format}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setDownloading(null);
    }
  };

  const dirty = draft !== null || (neverSaved && form?.timezone !== s?.timezone);
  const card = "rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5";
  const input = "h-9 rounded-lg border border-white/10 bg-[#111] px-2.5 text-sm text-white outline-none focus:border-white/30";

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Summary Reports</h1>
        <p className="text-sm text-white/50">
          A 4-slide SMPL summary (new users, generation cost &amp; profit, revenue, system health) emailed to the admins every day or week: the slides
          show in the email, with the PDF attached.
        </p>
      </div>

      {settings.isLoading || !form || !s ? (
        <Loader2 className="size-5 animate-spin text-white/40" />
      ) : (
        <>
          <section className={cn(card, "flex flex-col gap-4")}>
            <label className="flex items-center justify-between gap-3">
              <span>
                <span className="block text-sm font-medium text-white">Send scheduled reports</span>
                <span className="block text-xs text-white/45">
                  {s.enabled && s.nextSendAt
                    ? `Next: ${new Date(s.nextSendAt).toLocaleString()} (covers ${s.nextPeriod})`
                    : "Off: nothing is sent until you turn this on."}
                </span>
              </span>
              <input type="checkbox" className="size-5 accent-[#6b41ff]" checked={form.enabled} onChange={(e) => set({ enabled: e.target.checked })} />
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs text-white/50">How often</span>
                <div className="flex gap-1 rounded-lg border border-white/10 p-1 text-[13px]">
                  {(["daily", "weekly"] as Frequency[]).map((f) => (
                    <button key={f} type="button" onClick={() => set({ frequency: f })} className={cn("flex-1 rounded-md py-1 capitalize", form.frequency === f ? "bg-white text-black" : "text-white/60")}>
                      {f}
                    </button>
                  ))}
                </div>
              </label>
              {form.frequency === "weekly" && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs text-white/50">On</span>
                  <select value={form.weekday} onChange={(e) => set({ weekday: Number(e.target.value) })} className={input}>
                    {WEEKDAYS.map((d, i) => (
                      <option key={d} value={i}>
                        {d}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label className="flex flex-col gap-1.5">
                <span className="text-xs text-white/50">At</span>
                <select value={form.hour} onChange={(e) => set({ hour: Number(e.target.value) })} className={input}>
                  {HOURS.map((h) => (
                    <option key={h} value={h}>
                      {hourLabel(h)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs text-white/50">Time zone</span>
                <input list="report-zones" value={form.timezone} onChange={(e) => set({ timezone: e.target.value })} className={input} />
                <datalist id="report-zones">
                  {zones.map((z) => (
                    <option key={z} value={z} />
                  ))}
                </datalist>
              </label>
            </div>
            <p className="text-xs text-white/40">
              {form.frequency === "daily"
                ? `Each day at ${hourLabel(form.hour)} (${form.timezone}), covering the day before.`
                : `Every ${WEEKDAYS[form.weekday]} at ${hourLabel(form.hour)} (${form.timezone}), covering the last full Monday–Sunday week.`}
            </p>

            <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
              <span className="flex items-center gap-1.5 text-sm font-medium text-white">
                <Mail className="size-4 text-white/50" /> Recipients
              </span>
              <label className="flex items-start gap-2 text-sm text-white/75">
                <input type="checkbox" className="mt-0.5" checked={form.includeAdmins} onChange={(e) => set({ includeAdmins: e.target.checked })} />
                <span>
                  All admin accounts
                  <span className="block text-xs break-all text-white/40">{s.admins.length ? s.admins.join(", ") : "No admin accounts with an email"}</span>
                </span>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs text-white/50">Also send to (comma separated, up to 20)</span>
                <textarea
                  value={form.extraEmails}
                  onChange={(e) => set({ extraEmails: e.target.value })}
                  rows={2}
                  placeholder="finance@company.com, partner@company.com"
                  className="rounded-lg border border-white/10 bg-[#111] p-2.5 text-sm text-white outline-none focus:border-white/30"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={save.isPending || !dirty}
                onClick={() => save.mutate(form)}
                className="bg-primary hover:bg-primary/90 h-10 rounded-lg px-4 text-sm font-semibold text-white disabled:opacity-50"
              >
                {save.isPending ? <Loader2 className="size-4 animate-spin" /> : "Save"}
              </button>
              {draft && (
                <button type="button" onClick={() => setDraft(null)} className="h-10 rounded-lg px-3 text-sm text-white/60 hover:text-white">
                  Discard changes
                </button>
              )}
              <span className="flex-1" />
              <button
                type="button"
                disabled={sendNow.isPending || dirty}
                title={dirty ? "Save your changes first" : `Sends the last ${s.frequency === "daily" ? "day" : "week"} to: ${s.recipients.join(", ")}`}
                onClick={() => {
                  if (confirm(`Email the last ${s.frequency === "daily" ? "day's" : "week's"} report now to ${s.recipients.length} recipient(s)?`)) sendNow.mutate();
                }}
                className="flex h-10 items-center gap-1.5 rounded-lg border border-white/15 px-4 text-sm text-white hover:bg-white/5 disabled:opacity-50"
              >
                {sendNow.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                Send now
              </button>
            </div>
          </section>

          <section className={cn(card, "flex flex-col gap-3")}>
            <span className="flex items-center gap-1.5 text-sm font-medium text-white">
              <FileSpreadsheet className="size-4 text-white/50" /> Download a report
            </span>
            <div className="flex flex-wrap items-center gap-2 text-[13px]">
              <input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} className={cn(input, "[color-scheme:dark]")} />
              <span className="text-white/40">to</span>
              <input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} className={cn(input, "[color-scheme:dark]")} />
              <button
                type="button"
                onClick={() => void download("pdf")}
                disabled={!!downloading}
                className="bg-primary hover:bg-primary/90 flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {downloading === "pdf" ? <Loader2 className="size-4 animate-spin" /> : <Presentation className="size-4" />}
                Slides (PDF)
              </button>
              <button
                type="button"
                onClick={() => void download("xlsx")}
                disabled={!!downloading}
                className="flex h-9 items-center gap-1.5 rounded-lg border border-white/15 px-3 text-sm text-white hover:bg-white/5 disabled:opacity-50"
              >
                {downloading === "xlsx" ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                Detailed .xlsx
              </button>
            </div>
            <p className="text-xs text-white/40">
              Slides: {SLIDES.join(" · ")}. The spreadsheet has every row: {TABS.join(" · ")}. Up to 366 days.
            </p>
          </section>

          <section className={cn(card, "flex flex-col gap-3")}>
            <span className="text-sm font-medium text-white">Recent sends</span>
            {runs.isLoading ? (
              <Loader2 className="size-4 animate-spin text-white/40" />
            ) : !runs.data?.length ? (
              <p className="text-sm text-white/40">Nothing sent yet.</p>
            ) : (
              <div className="divide-y divide-white/5">
                {runs.data.map((r) => (
                  <div key={r.id} className="flex flex-wrap items-start gap-x-3 gap-y-1 py-2.5 text-sm">
                    {r.status === "sent" ? (
                      <CheckCircle2 className="mt-0.5 size-4 text-emerald-400" />
                    ) : r.status === "failed" ? (
                      <XCircle className="mt-0.5 size-4 text-red-400" />
                    ) : (
                      <Loader2 className="mt-0.5 size-4 animate-spin text-white/40" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="text-white">
                        {r.label}
                        <span className="text-white/40"> · {r.periodKey.startsWith("weekly") ? "weekly" : r.manual ? "sent manually" : "daily"}</span>
                      </span>
                      <span className="block text-xs break-all text-white/40">
                        {r.status === "failed" && r.error ? <span className="text-red-300">{r.error}</span> : r.recipients.join(", ")}
                      </span>
                    </span>
                    <span className="text-xs text-white/45">{new Date(r.updatedAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
