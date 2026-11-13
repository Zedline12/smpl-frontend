"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Rocket,
  Code2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Release {
  id: string;
  name: string;
  notes: string;
  createdAt: string;
  live: boolean;
  // Dev only:
  frontendCommit?: string;
  frontendMessage?: string;
  backendCommit?: string;
  backendMessage?: string;
  createdBy?: string;
}

interface ListResponse {
  access: { owner: boolean; dev: boolean };
  live: string | null;
  hostError: string | null;
  releases: Release[];
}

interface HostDeploy {
  id: string;
  commit: string;
  message: string;
  createdAt: string;
  status: string;
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/admin/releases${path}`, init);
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error || "Request failed");
  return json as T;
}

const short = (sha?: string) => (sha ? sha.slice(0, 7) : "—");
const firstLine = (s?: string) => (s ?? "").split("\n")[0];
const date = (s: string) => new Date(s).toLocaleString();

const card = "rounded-[14px] border border-white/[0.08] bg-white/[0.02]";
const btn =
  "inline-flex items-center gap-2 rounded-[10px] px-3.5 py-2 text-[13px] font-semibold transition-colors disabled:opacity-50";

export function UpdatesAdminPage() {
  const qc = useQueryClient();
  const [devOpen, setDevOpen] = useState(false);
  const [confirm, setConfirm] = useState<Release | null>(null);
  const [switching, setSwitching] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    data,
    isLoading,
    error: loadError,
  } = useQuery({
    queryKey: ["admin-releases"],
    queryFn: () => api<ListResponse>(""),
    // While switching, keep checking until the new update reports live.
    refetchInterval: switching ? 5000 : false,
  });

  // Switch finished once the target is live: reload so this page runs on the new frontend.
  useEffect(() => {
    if (switching && data?.releases.find((r) => r.id === switching)?.live) {
      window.location.reload();
    }
  }, [switching, data]);

  const activate = async (r: Release) => {
    setConfirm(null);
    setError(null);
    try {
      await api(`/${r.id}/activate`, { method: "POST" });
      setSwitching(r.id);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  if (isLoading)
    return (
      <div className="p-8 text-white/50 flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading…
      </div>
    );
  if (loadError || !data)
    return (
      <div className="p-8 text-red-400">
        {(loadError as Error)?.message ?? "Could not load updates"}
      </div>
    );

  const { access } = data;
  const switchingName = data.releases.find((r) => r.id === switching)?.name;

  return (
    <div className="p-6 md:p-8 max-w-4xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Updates</h1>
          <p className="text-[13px] text-white/45 mt-1">
            Switch the whole site (website and server) to a saved update.
          </p>
        </div>
        {access.dev && (
          <button
            onClick={() => setDevOpen(true)}
            className={cn(
              btn,
              "bg-white/[0.06] text-white hover:bg-white/[0.1]",
            )}
          >
            <Code2 className="w-4 h-4" /> Dev
          </button>
        )}
      </div>

      <div className={cn(card, "p-6 flex items-center gap-4")}>
        <div className="w-11 h-11 rounded-full bg-emerald-500/15 flex items-center justify-center">
          <Rocket className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <p className="text-[12px] uppercase tracking-wider text-white/40 font-semibold">
            Live version
          </p>
          <p className="text-2xl font-bold text-white">
            {data.live ?? "Not a saved update"}
          </p>
          {data.hostError && (
            <p className="text-[12px] text-amber-400 mt-1">{data.hostError}</p>
          )}
        </div>
      </div>

      {switching && (
        <div
          className={cn(
            card,
            "p-4 flex items-center gap-3 text-[13px] text-white/80",
          )}
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          Switching to {switchingName}… this takes a few minutes while the
          server restarts. The page reloads when it&apos;s done.
        </div>
      )}
      {error && <div className="text-[13px] text-red-400">{error}</div>}

      <div className="space-y-2">
        <h2 className="text-[13px] font-semibold text-white/60">
          Saved updates
        </h2>
        {data.releases.length === 0 && (
          <p className="text-[13px] text-white/40">No saved updates yet.</p>
        )}
        {data.releases.map((r) => (
          <div
            key={r.id}
            className={cn(card, "p-4 flex items-center justify-between gap-4")}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-semibold text-white">
                  {r.name}
                </span>
                {r.live && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 rounded-full px-2 py-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Live
                  </span>
                )}
              </div>
              {r.notes && (
                <p className="text-[13px] text-white/50 mt-0.5">{r.notes}</p>
              )}
              <p className="text-[11px] text-white/30 mt-0.5">
                Saved {date(r.createdAt)}
              </p>
            </div>
            {!r.live && (
              <button
                disabled={!!switching}
                onClick={() => setConfirm(r)}
                className={cn(
                  btn,
                  "bg-white text-black hover:bg-white/90 shrink-0",
                )}
              >
                Switch to this
              </button>
            )}
          </div>
        ))}
      </div>

      {confirm && (
        <Modal
          onClose={() => setConfirm(null)}
          title={`Switch to ${confirm.name}?`}
        >
          <div className="space-y-3 text-[13px] text-white/70">
            <p>
              The website and the server will both change to update{" "}
              <b className="text-white">{confirm.name}</b>.
            </p>
            <div className="flex gap-2 rounded-[10px] bg-amber-500/10 p-3 text-amber-200/90">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Saved data (users, generations, settings) is not switched back.
                Going back to an older update can break things if the newer one
                changed how data is stored. Generations running right now
                restart.
              </span>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-5">
            <button
              onClick={() => setConfirm(null)}
              className={cn(btn, "text-white/70 hover:bg-white/[0.06]")}
            >
              Cancel
            </button>
            <button
              onClick={() => activate(confirm)}
              className={cn(btn, "bg-white text-black hover:bg-white/90")}
            >
              Switch
            </button>
          </div>
        </Modal>
      )}

      {devOpen && access.dev && (
        <DevPanel
          releases={data.releases}
          onClose={() => setDevOpen(false)}
          onChanged={() =>
            qc.invalidateQueries({ queryKey: ["admin-releases"] })
          }
        />
      )}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-[90] bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={cn(
          "w-full rounded-[16px] border border-white/10 bg-[#111] p-6 max-h-[90vh] overflow-y-auto",
          wide ? "max-w-3xl" : "max-w-md",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function DeployList({
  title,
  items,
  value,
  onChange,
  okStatuses,
  liveId,
}: {
  title: string;
  items: HostDeploy[];
  value: string;
  onChange: (id: string) => void;
  okStatuses: string[];
  liveId?: string | null;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[12px] font-semibold text-white/50 mb-1.5">{title}</p>
      <div className="rounded-[10px] border border-white/[0.08] max-h-64 overflow-y-auto divide-y divide-white/[0.05]">
        {items.map((d) => {
          const ok = okStatuses.includes(d.status);
          return (
            <label
              key={d.id}
              className={cn(
                "flex gap-2 p-2.5 text-[12px] cursor-pointer hover:bg-white/[0.03]",
                !ok && "opacity-40 cursor-not-allowed",
                value === d.id && "bg-white/[0.06]",
              )}
            >
              <input
                type="radio"
                disabled={!ok}
                checked={value === d.id}
                onChange={() => onChange(d.id)}
                className="mt-0.5"
              />
              <span className="min-w-0">
                <span className="font-mono text-white">{short(d.commit)}</span>
                {d.id === liveId && (
                  <span className="ml-1.5 text-emerald-400 font-semibold">
                    live
                  </span>
                )}
                <span className="block text-white/60 truncate">
                  {firstLine(d.message) || "(no message)"}
                </span>
                <span className="block text-white/30">
                  {date(d.createdAt)} · {d.status}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function DevPanel({
  releases,
  onClose,
  onChanged,
}: {
  releases: Release[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-releases-deployments"],
    queryFn: () =>
      api<{
        frontend: HostDeploy[];
        backend: HostDeploy[];
        live: {
          vercelDeploymentId: string | null;
          backendCommit: string | null;
        };
      }>("/deployments"),
  });
  const [fe, setFe] = useState("");
  const [be, setBe] = useState("");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const liveBackendId =
    data?.backend.find((d) => d.status === "live")?.id ?? null;
  // Default to what is live right now.
  const feId = fe || data?.live.vercelDeploymentId || "";
  const beId = be || liveBackendId || "";

  const run = async (fn: () => Promise<unknown>, done: string) => {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
      setMsg(done);
      onChanged();
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const save = () =>
    run(async () => {
      await api("", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          notes,
          vercelDeploymentId: feId,
          renderDeployId: beId,
        }),
      });
      setName("");
      setNotes("");
    }, "Update saved");

  return (
    <Modal title="Dev · save updates" onClose={onClose} wide>
      {isLoading && (
        <p className="text-[13px] text-white/50 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading deployments…
        </p>
      )}
      {error && (
        <p className="text-[13px] text-red-400">{(error as Error).message}</p>
      )}
      {data && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <DeployList
              title="Frontend (Vercel)"
              items={data.frontend}
              value={feId}
              onChange={setFe}
              okStatuses={["READY"]}
              liveId={data.live.vercelDeploymentId}
            />
            <DeployList
              title="Backend (Render)"
              items={data.backend}
              value={beId}
              onChange={setBe}
              okStatuses={["live", "deactivated"]}
              liveId={liveBackendId}
            />
          </div>
          <div className="grid md:grid-cols-[160px_1fr_auto] gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name, e.g. 1.1"
              className="rounded-[10px] bg-white/[0.04] border border-white/10 px-3 py-2 text-[13px] text-white"
            />
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes for the owner (optional)"
              className="rounded-[10px] bg-white/[0.04] border border-white/10 px-3 py-2 text-[13px] text-white"
            />
            <button
              disabled={busy || !name.trim() || !feId || !beId}
              onClick={save}
              className={cn(
                btn,
                "bg-white text-black hover:bg-white/90 justify-center",
              )}
            >
              Save update
            </button>
          </div>
        </div>
      )}

      {msg && <p className="text-[13px] text-white/70 mt-3">{msg}</p>}

      <h4 className="text-[13px] font-semibold text-white/60 mt-6 mb-2">
        Saved updates
      </h4>
      <div className="space-y-1.5">
        {releases.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between gap-3 rounded-[10px] border border-white/[0.06] p-2.5 text-[12px]"
          >
            <div className="min-w-0">
              <span className="font-semibold text-white">{r.name}</span>
              {r.live && (
                <span className="ml-1.5 text-emerald-400 font-semibold">
                  live
                </span>
              )}
              <span className="block text-white/50 truncate">
                web <span className="font-mono">{short(r.frontendCommit)}</span>{" "}
                {firstLine(r.frontendMessage)}
              </span>
              <span className="block text-white/50 truncate">
                server{" "}
                <span className="font-mono">{short(r.backendCommit)}</span>{" "}
                {firstLine(r.backendMessage)}
              </span>
            </div>
            <button
              disabled={busy || r.live}
              title={r.live ? "Can't delete the live update" : "Delete"}
              onClick={() =>
                confirmDelete(r) &&
                run(() => api(`/${r.id}`, { method: "DELETE" }), "Deleted")
              }
              className="text-white/40 hover:text-red-400 disabled:opacity-30"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
        <p className="text-[12px] text-white/40">
          After a switch, new pushes stop going live on their own. This promotes
          the newest frontend and turns Render auto-deploy back on.
        </p>
        <button
          disabled={busy}
          onClick={() =>
            run(
              () => api("/resume-auto-deploy", { method: "POST" }),
              "Auto-deploy resumed",
            )
          }
          className={cn(
            btn,
            "bg-white/[0.06] text-white hover:bg-white/[0.1] shrink-0",
          )}
        >
          Resume auto-deploy
        </button>
      </div>
    </Modal>
  );
}

const confirmDelete = (r: Release) =>
  window.confirm(`Delete update "${r.name}"? The deployments themselves stay.`);
