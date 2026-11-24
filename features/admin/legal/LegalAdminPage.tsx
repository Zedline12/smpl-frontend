"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { LegalMarkdown } from "@/features/legal/LegalMarkdown";

interface Row {
  slug: string;
  title: string;
  liveVersion: number | null;
  livePublishedAt: string | null;
  draftVersion: number | null;
  acceptances: number;
}
interface Version {
  _id: string;
  slug: string;
  version: number;
  title: string;
  body: string;
  summaryOfChanges: string;
  requiresReaccept: boolean;
  published: boolean;
  publishedAt: string | null;
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/admin/legal${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error || json?.message || "Request failed");
  return (json?.data ?? json) as T;
}

function Editor({ slug, onDone }: { slug: string; onDone: () => void }) {
  const qc = useQueryClient();
  const { data: versions } = useQuery({ queryKey: ["admin-legal", slug], queryFn: () => api<Version[]>(`/${slug}`) });
  const latest = versions?.[0];
  const [title, setTitle] = useState<string | null>(null);
  const [body, setBody] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [reaccept, setReaccept] = useState(false);
  const [tab, setTab] = useState<"edit" | "preview">("edit");

  const t = title ?? latest?.title ?? "";
  const b = body ?? latest?.body ?? "";
  const s = summary ?? (latest && !latest.published ? latest.summaryOfChanges : "");

  const save = useMutation({
    mutationFn: () => api<Version>(`/${slug}/draft`, { method: "PUT", body: JSON.stringify({ title: t, body: b, summaryOfChanges: s }) }),
    onSuccess: () => {
      toast.success("Draft saved");
      void qc.invalidateQueries({ queryKey: ["admin-legal"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const publish = useMutation({
    mutationFn: async () => {
      await api<Version>(`/${slug}/draft`, { method: "PUT", body: JSON.stringify({ title: t, body: b, summaryOfChanges: s }) });
      return api<Version>(`/${slug}/publish`, { method: "POST", body: JSON.stringify({ requiresReaccept: reaccept }) });
    },
    onSuccess: () => {
      toast.success("Published");
      void qc.invalidateQueries({ queryKey: ["admin-legal"] });
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!latest) return <Loader2 className="size-5 animate-spin text-white/40" />;
  const placeholders = (b.match(/\[[^\]\n]{3,80}\]/g) ?? []).filter((m) => !m.startsWith("[") || !/\]\(/.test(m)).length;

  return (
    <div className="flex flex-col gap-4">
      <button type="button" onClick={onDone} className="self-start text-sm text-white/50 hover:text-white">
        ← All documents
      </button>
      <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-[13px] text-amber-100">
        <AlertTriangle className="mr-1.5 inline size-4" />
        Drafts are a starting point, not legal advice: have a lawyer review them and fill every [bracketed] field before publishing.
        {placeholders > 0 && <strong> This text still has bracketed placeholders.</strong>}
      </div>
      <input value={t} onChange={(e) => setTitle(e.target.value)} className="h-10 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-white" />
      <div className="flex gap-1 rounded-lg border border-white/10 p-1 text-sm">
        {(["edit", "preview"] as const).map((x) => (
          <button key={x} type="button" onClick={() => setTab(x)} className={`flex-1 rounded-md py-1.5 capitalize ${tab === x ? "bg-white text-black" : "text-white/60"}`}>
            {x}
          </button>
        ))}
      </div>
      {tab === "edit" ? (
        <textarea value={b} onChange={(e) => setBody(e.target.value)} rows={28} className="rounded-lg border border-white/10 bg-black/40 p-3 font-mono text-[13px] text-white/85" />
      ) : (
        <div className="rounded-lg border border-white/10 p-5">
          <LegalMarkdown body={b} />
        </div>
      )}
      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-white/50">Summary of changes (shown to users asked to re-accept)</span>
        <input value={s} onChange={(e) => setSummary(e.target.value)} className="h-10 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-white" />
      </label>
      <label className="flex items-center gap-2 text-sm text-white/75">
        <input type="checkbox" checked={reaccept} onChange={(e) => setReaccept(e.target.checked)} />
        Signed-in users must accept this version before continuing (for material changes)
      </label>
      <div className="flex gap-2">
        <button type="button" onClick={() => save.mutate()} disabled={save.isPending} className="h-10 rounded-lg border border-white/15 px-4 text-sm text-white hover:bg-white/5">
          Save draft
        </button>
        <button
          type="button"
          disabled={publish.isPending}
          onClick={() => {
            if (confirm(`Publish "${t}" as the live version${reaccept ? " and ask every user to accept it" : ""}?`)) publish.mutate();
          }}
          className="bg-primary hover:bg-primary/90 h-10 rounded-lg px-4 text-sm font-semibold text-white"
        >
          Publish
        </button>
      </div>
      <div className="text-xs text-white/40">
        Versions:{" "}
        {versions?.map((v) => `v${v.version}${v.published ? ` (published ${v.publishedAt ? new Date(v.publishedAt).toLocaleDateString() : ""}${v.requiresReaccept ? ", re-accept" : ""})` : " (draft)"}`).join(" · ")}
      </div>
    </div>
  );
}

/** Admin → Legal: Terms, Privacy, Cookies… versioned, with acceptance counts. */
export function LegalAdminPage() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-legal"], queryFn: () => api<Row[]>("") });
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-5 p-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Legal</h1>
        <p className="text-sm text-white/50">
          Documents users accept. Until a document is published here, its public page forwards to the old smplcontent.com page.
        </p>
      </div>
      {editing ? (
        <Editor slug={editing} onDone={() => setEditing(null)} />
      ) : isLoading ? (
        <Loader2 className="size-5 animate-spin text-white/40" />
      ) : (
        <div className="divide-y divide-white/5 rounded-xl border border-white/10">
          {data?.map((r) => (
            <button key={r.slug} type="button" onClick={() => setEditing(r.slug)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.03]">
              <FileText className="size-4 text-white/40" />
              <span className="flex-1">
                <span className="text-sm font-medium text-white">{r.title}</span>
                <span className="block text-xs text-white/40">/legal/{r.slug}</span>
              </span>
              <span className="text-xs text-white/55">
                {r.liveVersion ? `Live v${r.liveVersion} · ${r.acceptances} acceptances` : "Not published"}
                {r.draftVersion ? ` · draft v${r.draftVersion}` : ""}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
