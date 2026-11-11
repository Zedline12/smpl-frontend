"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Pencil, Plus, Timer, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { getModel } from "@/features/generation/enums/models.enum";
import { cn } from "@/lib/utils";

type Schema = Record<string, Record<string, (string | number | boolean)[]>>;

interface Rule {
  id: string;
  model: string;
  parameters: Record<string, unknown>;
  seconds: number;
}

interface StatRow {
  model: string;
  paramsKey: string;
  parameters: Record<string, string>;
  baseSeconds: number;
  baseSource: "rule" | "default";
  count: number;
  avgSeconds: number | null;
  medianSeconds: number | null;
  outliers: number;
  effectiveSeconds: number;
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/generation-estimates${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (res.status === 204) return undefined as T;
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error || "Request failed");
  return json as T;
}

const NON_TIME_PARAMS = new Set(["prompt", "units", "durationMinutes"]);
const PER_MINUTE = new Set(["video-clipping", "video-analyzer"]);

function modelName(id: string) {
  if (id === "video-clipping") return "Clipping Studio";
  if (id === "video-analyzer") return "Video Analyzer";
  if (id === "brand-theme") return "Brand theme extraction";
  return getModel(id)?.name ?? id;
}

export function formatDuration(seconds: number | null | undefined) {
  if (seconds == null) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m ? `${m}:${String(s).padStart(2, "0")}` : `${s}s`;
}

/** "2:30", "150", "2m" → seconds. */
function parseDuration(text: string): number | null {
  const t = text.trim().toLowerCase();
  if (!t) return null;
  const mmss = t.match(/^(\d+):(\d{1,2})$/);
  if (mmss) return Number(mmss[1]) * 60 + Number(mmss[2]);
  const min = t.match(/^(\d+(?:\.\d+)?)\s*m(in)?$/);
  if (min) return Math.round(Number(min[1]) * 60);
  const sec = t.match(/^(\d+)\s*s?$/);
  return sec ? Number(sec[1]) : null;
}

function settingsLabel(params: Record<string, unknown>) {
  const entries = Object.entries(params ?? {});
  return entries.length ? entries.map(([k, v]) => `${k}: ${String(v)}`).join(" · ") : "Any settings (model default)";
}

const sameParams = (a: Record<string, unknown>, b: Record<string, unknown>) => {
  const ka = Object.keys(a ?? {}).sort();
  const kb = Object.keys(b ?? {}).sort();
  return ka.length === kb.length && ka.every((k, i) => k === kb[i] && String(a[k]) === String(b[k]));
};

const input =
  "rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-sm text-white focus:border-white/30 focus:outline-none";

export function GenerationTimesManager() {
  const queryClient = useQueryClient();
  const schemaQ = useQuery({ queryKey: ["gen-times", "models"], queryFn: () => api<Schema>("/models") });
  const rulesQ = useQuery({ queryKey: ["gen-times", "rules"], queryFn: () => api<Rule[]>("") });
  const statsQ = useQuery({ queryKey: ["gen-times", "stats"], queryFn: () => api<StatRow[]>("/stats") });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["gen-times"] });

  const save = useMutation({
    mutationFn: (rule: { model: string; parameters: Record<string, unknown>; seconds: number }) =>
      api<Rule>("", { method: "POST", body: JSON.stringify(rule) }),
    onSuccess: () => {
      toast.success("Time saved");
      refresh();
    },
    onError: (e) => toast.error(e.message),
  });
  const update = useMutation({
    mutationFn: ({ id, seconds }: { id: string; seconds: number }) =>
      api<Rule>(`/${id}`, { method: "PATCH", body: JSON.stringify({ seconds }) }),
    onSuccess: refresh,
    onError: (e) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: (id: string) => api<void>(`/${id}`, { method: "DELETE" }),
    onSuccess: refresh,
    onError: (e) => toast.error(e.message),
  });

  // New rule form
  const schema = schemaQ.data ?? {};
  const [model, setModel] = useState("");
  const [params, setParams] = useState<Record<string, string>>({});
  const [time, setTime] = useState("");
  const modelParams = Object.entries(schema[model] ?? {}).filter(([k]) => !NON_TIME_PARAMS.has(k));

  const submit = () => {
    const seconds = parseDuration(time);
    if (!model || !seconds) {
      toast.error("Pick a model and enter a time like 2:00");
      return;
    }
    const parameters: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(params)) {
      if (v === "") continue;
      const sample = schema[model]?.[k]?.[0];
      parameters[k] = typeof sample === "number" ? Number(v) : typeof sample === "boolean" ? v === "true" : v;
    }
    save.mutate({ model, parameters, seconds }, { onSuccess: () => setTime("") });
  };

  // One section per model that has a rule or has run.
  const sections = useMemo(() => {
    const rules = rulesQ.data ?? [];
    const stats = statsQ.data ?? [];
    const models = [...new Set([...rules.map((r) => r.model), ...stats.map((s) => s.model)])].sort((a, b) =>
      modelName(a).localeCompare(modelName(b)),
    );
    return models.map((m) => {
      const mRules = rules.filter((r) => r.model === m);
      const mStats = stats.filter((s) => s.model === m);
      // Measured rows whose settings match a rule exactly sit on that rule's row.
      const ruleRows = mRules
        .sort((a, b) => Object.keys(a.parameters).length - Object.keys(b.parameters).length)
        .map((r) => ({ rule: r, stat: mStats.find((s) => sameParams(s.parameters, r.parameters)) }));
      const unmatched = mStats.filter((s) => !mRules.some((r) => sameParams(s.parameters, r.parameters)));
      return { model: m, ruleRows, unmatched };
    });
  }, [rulesQ.data, statsQ.data]);

  const loading = schemaQ.isLoading || rulesQ.isLoading || statsQ.isLoading;

  return (
    <div className="space-y-6">
      {/* Add */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
          <Plus className="size-4" /> Set a base time
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs text-white/50">
            Model
            <select
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
                setParams({});
              }}
              className={cn(input, "min-w-56")}
            >
              <option value="" className="bg-neutral-900">
                Choose…
              </option>
              {Object.keys(schema)
                .sort((a, b) => modelName(a).localeCompare(modelName(b)))
                .map((m) => (
                  <option key={m} value={m} className="bg-neutral-900">
                    {modelName(m)}
                  </option>
                ))}
            </select>
          </label>
          {modelParams.map(([key, values]) => (
            <label key={key} className="flex flex-col gap-1 text-xs text-white/50">
              {key}
              <select
                value={params[key] ?? ""}
                onChange={(e) => setParams((p) => ({ ...p, [key]: e.target.value }))}
                className={input}
              >
                <option value="" className="bg-neutral-900">
                  Any
                </option>
                {values.map((v) => (
                  <option key={String(v)} value={String(v)} className="bg-neutral-900">
                    {String(v)}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <label className="flex flex-col gap-1 text-xs text-white/50">
            {PER_MINUTE.has(model) ? "Time per source minute" : "Time (m:ss)"}
            <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="2:00" className={cn(input, "w-24")} />
          </label>
          <button
            type="button"
            onClick={submit}
            disabled={save.isPending}
            className="flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
          >
            {save.isPending && <Loader2 className="size-3.5 animate-spin" />}
            Save
          </button>
        </div>
        <p className="mt-3 text-xs text-white/40">
          Leave a setting on “Any” to cover all its values. Users see this time blended with real jobs:
          (base × 5 + recent job times) ÷ (5 + jobs), so it adjusts as people generate. Jobs that take over 4× the base
          are ignored.
        </p>
      </div>

      {loading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-white/[0.04]" />
      ) : sections.length === 0 ? (
        <p className="text-sm text-white/50">No times yet. Set a base above; real job times show up here as people generate.</p>
      ) : (
        sections.map(({ model: m, ruleRows, unmatched }) => (
          <div key={m} className="overflow-hidden rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 bg-white/[0.04] px-4 py-3">
              <Timer className="size-4 text-white/60" />
              <span className="font-semibold text-white">{modelName(m)}</span>
              {PER_MINUTE.has(m) && <span className="text-xs text-white/40">(times per source minute)</span>}
            </div>
            <div className="grid grid-cols-[2fr_1fr_1.6fr_1fr_auto] gap-3 border-b border-white/[0.06] px-4 py-2 text-[11px] font-semibold tracking-wider text-white/35 uppercase">
              <span>Settings</span>
              <span>Base time</span>
              <span>Measured</span>
              <span>Users see</span>
              <span className="w-16" />
            </div>
            {ruleRows.map(({ rule, stat }) => (
              <RuleRow
                key={rule.id}
                rule={rule}
                stat={stat}
                onSave={(seconds) => update.mutate({ id: rule.id, seconds })}
                onDelete={() => remove.mutate(rule.id)}
              />
            ))}
            {unmatched.map((s) => (
              <div
                key={s.paramsKey}
                className="grid grid-cols-[2fr_1fr_1.6fr_1fr_auto] items-center gap-3 border-b border-white/[0.04] px-4 py-2.5 text-sm"
              >
                <span className="text-white/70">{settingsLabel(s.parameters)}</span>
                <span className="text-white/45">
                  {formatDuration(s.baseSeconds)}{" "}
                  <span className="text-[10px]">({s.baseSource === "rule" ? "from a broader rule" : "default"})</span>
                </span>
                <Measured stat={s} />
                <span className="font-semibold text-white">{formatDuration(s.effectiveSeconds)}</span>
                <button
                  type="button"
                  onClick={() => {
                    setModel(m);
                    setParams(s.parameters);
                    setTime(formatDuration(s.medianSeconds ?? s.effectiveSeconds));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-16 text-left text-xs text-white/50 hover:text-white"
                >
                  Set base
                </button>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

function Measured({ stat }: { stat?: StatRow }) {
  if (!stat || !stat.count) return <span className="text-white/35">No jobs yet</span>;
  return (
    <span className="text-white/75">
      avg {formatDuration(stat.avgSeconds)} · median {formatDuration(stat.medianSeconds)}
      <span className="text-white/40">
        {" "}
        · {stat.count} job{stat.count === 1 ? "" : "s"}
        {stat.outliers ? ` (+${stat.outliers} ignored)` : ""}
      </span>
    </span>
  );
}

function RuleRow({
  rule,
  stat,
  onSave,
  onDelete,
}: {
  rule: Rule;
  stat?: StatRow;
  onSave: (seconds: number) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(formatDuration(rule.seconds));
  return (
    <div className="grid grid-cols-[2fr_1fr_1.6fr_1fr_auto] items-center gap-3 border-b border-white/[0.04] px-4 py-2.5 text-sm">
      <span className="text-white">{settingsLabel(rule.parameters)}</span>
      {editing ? (
        <span className="flex items-center gap-1">
          <input value={text} onChange={(e) => setText(e.target.value)} className={cn(input, "w-20 py-1")} autoFocus />
          <button
            type="button"
            aria-label="Save"
            onClick={() => {
              const s = parseDuration(text);
              if (!s) return toast.error("Enter a time like 2:00");
              onSave(s);
              setEditing(false);
            }}
            className="text-emerald-300 hover:text-emerald-200"
          >
            <Check className="size-4" />
          </button>
          <button type="button" aria-label="Cancel" onClick={() => setEditing(false)} className="text-white/40 hover:text-white">
            <X className="size-4" />
          </button>
        </span>
      ) : (
        <span className="font-semibold text-white">{formatDuration(rule.seconds)}</span>
      )}
      <Measured stat={stat} />
      <span className="font-semibold text-white">{formatDuration(stat?.effectiveSeconds ?? rule.seconds)}</span>
      <span className="flex w-16 items-center gap-2">
        <button
          type="button"
          aria-label="Edit"
          onClick={() => {
            setText(formatDuration(rule.seconds));
            setEditing(true);
          }}
          className="text-white/45 hover:text-white"
        >
          <Pencil className="size-3.5" />
        </button>
        <button type="button" aria-label="Delete" onClick={onDelete} className="text-white/45 hover:text-red-300">
          <Trash2 className="size-3.5" />
        </button>
      </span>
    </div>
  );
}
