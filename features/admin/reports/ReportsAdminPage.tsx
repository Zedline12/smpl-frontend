"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Report {
  id: string;
  code: string;
  category: string;
  label: string;
  urls: string[];
  mediaIds: string[];
  description: string;
  reporter: { name: string; email: string; relation: string };
  statement: Record<string, unknown> | null;
  status: "open" | "removed" | "rejected" | "restored";
  deadlineAt: string;
  hiddenAt: string | null;
  createdAt: string;
  overdue?: boolean;
  decisionNote?: string;
  media?: { _id: string; url: string; thumbUrl?: string; type: string; isPublished: boolean; deletedAt: string | null }[];
  identicalCopies?: number;
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/admin/reports${path}`, { ...init, headers: { "Content-Type": "application/json" } });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error || json?.message || "Request failed");
  return (json?.data ?? json) as T;
}

function timeLeft(deadline: string) {
  const ms = new Date(deadline).getTime() - Date.now();
  const h = Math.round(Math.abs(ms) / 3600_000);
  return ms < 0 ? `${h} h overdue` : `${h} h left`;
}

const URGENT = new Set(["ncii", "child_safety"]);

function Detail({ id, onBack }: { id: string; onBack: () => void }) {
  const qc = useQueryClient();
  const { data: r } = useQuery({ queryKey: ["admin-report", id], queryFn: () => api<Report>(`/${id}`) });
  const [note, setNote] = useState("");
  const decide = useMutation({
    mutationFn: (action: "remove" | "reject" | "restore") => api<Report>(`/${id}/decide`, { method: "POST", body: JSON.stringify({ action, note }) }),
    onSuccess: () => {
      toast.success("Decided; the reporter and uploader were emailed");
      void qc.invalidateQueries({ queryKey: ["admin-reports"] });
      void qc.invalidateQueries({ queryKey: ["admin-report", id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  if (!r) return <Loader2 className="size-5 animate-spin text-white/40" />;

  return (
    <div className="flex flex-col gap-4">
      <button type="button" onClick={onBack} className="self-start text-sm text-white/50 hover:text-white">
        ← All reports
      </button>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold text-white">{r.code}</h2>
        <span className={cn("rounded-full px-2 py-0.5 text-xs", URGENT.has(r.category) ? "bg-red-500/20 text-red-200" : "bg-white/10 text-white/70")}>{r.label}</span>
        <span className="text-xs text-white/50">{r.status === "open" ? timeLeft(r.deadlineAt) : r.status}</span>
        {r.hiddenAt && <span className="text-xs text-amber-300">hidden pending review</span>}
      </div>
      {r.category === "child_safety" && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-[13px] text-red-100">
          Child safety: remove, keep the evidence, and report to NCMEC (CyberTipline) or the relevant authority as the law requires.
        </p>
      )}
      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-lg border border-white/10 p-3">
          <p className="text-xs text-white/40">Reporter</p>
          <p className="text-white">{r.reporter.name} · {r.reporter.email}</p>
          <p className="text-xs text-white/50">{r.reporter.relation}</p>
        </div>
        <div className="rounded-lg border border-white/10 p-3">
          <p className="text-xs text-white/40">Links</p>
          {r.urls.map((u) => (
            <a key={u} href={u} target="_blank" rel="noreferrer" className="block truncate text-white underline">{u}</a>
          ))}
        </div>
      </div>
      {r.description && <p className="rounded-lg border border-white/10 p-3 text-sm text-white/75">{r.description}</p>}
      {r.statement && <pre className="overflow-x-auto rounded-lg border border-white/10 p-3 text-xs text-white/60">{JSON.stringify(r.statement, null, 2)}</pre>}
      <div>
        <p className="mb-2 text-xs text-white/40">
          Items found: {r.media?.length ?? 0}
          {r.identicalCopies ? ` · ${r.identicalCopies} identical copies elsewhere (removed too)` : ""}
        </p>
        <div className="flex flex-wrap gap-2">
          {r.media?.map((m) => (
            <a key={m._id} href={m.url} target="_blank" rel="noreferrer" className="relative size-28 overflow-hidden rounded-lg border border-white/10 bg-black">
              {/* Blurred: reviewers open the full item on purpose. */}
              {m.type === "video" ? (
                <video src={m.url} preload="metadata" muted className="size-full object-cover blur-md" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.thumbUrl || m.url} alt="" loading="lazy" className="size-full object-cover blur-md" />
              )}
              {m.deletedAt && <span className="absolute inset-x-0 bottom-0 bg-black/70 text-center text-[10px] text-white">removed</span>}
            </a>
          ))}
        </div>
      </div>
      {r.status === "open" || r.status === "rejected" || r.status === "restored" ? (
        <div className="flex flex-col gap-2">
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Reason (sent to the uploader and the reporter)" className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-sm text-white" />
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={decide.isPending} onClick={() => confirm("Remove the content and every identical copy?") && decide.mutate("remove")} className="h-9 rounded-lg bg-red-500 px-4 text-sm font-semibold text-white">
              Remove
            </button>
            <button type="button" disabled={decide.isPending} onClick={() => decide.mutate("reject")} className="h-9 rounded-lg border border-white/15 px-4 text-sm text-white">
              Not a violation (restore)
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-white/55">Decided: {r.status}{r.decisionNote ? ` · ${r.decisionNote}` : ""}</p>
      )}
    </div>
  );
}

/** Admin → Reports: the takedown queue (intimate images and child safety: 48 h / 24 h). */
export function ReportsAdminPage() {
  const [status, setStatus] = useState("open");
  const [open, setOpen] = useState<string | null>(null);
  const { data, isLoading } = useQuery({ queryKey: ["admin-reports", status], queryFn: () => api<Report[]>(`?status=${status}`), refetchInterval: 60_000 });

  return (
    <div className="flex flex-col gap-5 p-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Reports</h1>
        <p className="text-sm text-white/50">Content reports from /report. Intimate-image reports must be decided within 48 hours (TAKE IT DOWN Act).</p>
      </div>
      {open ? (
        <Detail id={open} onBack={() => setOpen(null)} />
      ) : (
        <>
          <div className="flex gap-1 self-start rounded-lg border border-white/10 p-1 text-sm">
            {["open", "removed", "rejected", "all"].map((s) => (
              <button key={s} type="button" onClick={() => setStatus(s)} className={`rounded-md px-3 py-1 capitalize ${status === s ? "bg-white text-black" : "text-white/60"}`}>
                {s}
              </button>
            ))}
          </div>
          {isLoading && <Loader2 className="size-5 animate-spin text-white/40" />}
          {data && !data.length && <p className="text-sm text-white/45">Nothing here.</p>}
          <div className="divide-y divide-white/5 rounded-xl border border-white/10">
            {data?.map((r) => (
              <button key={r.id} type="button" onClick={() => setOpen(r.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.03]">
                <span className={cn("size-2 rounded-full", URGENT.has(r.category) ? "bg-red-400" : "bg-white/30")} />
                <span className="w-28 text-sm font-medium text-white">{r.code}</span>
                <span className="flex-1 truncate text-sm text-white/70">{r.label}</span>
                <span className={cn("text-xs", r.overdue ? "text-red-300" : "text-white/50")}>{r.status === "open" ? timeLeft(r.deadlineAt) : r.status}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
