"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Copy, ExternalLink, Loader2, Pencil, Plus, Radio, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  activateHomePreset,
  createHomePreset,
  deleteHomePreset,
  updateHomePreset,
} from "@/features/home-sections/api";
import type { HomePreset } from "@/features/home-sections/types";
import { SmallButton } from "./fields";

export const PRESETS_KEY = ["home-presets", "admin"];

const PREVIEW_AS = [
  { value: "", label: "as me" },
  { value: "guest", label: "as a guest" },
  { value: "no_plan", label: "as a user without a plan" },
  { value: "paid", label: "as a paying user" },
];

const input = "h-9 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-white placeholder:text-white/30";

/**
 * Pick the preset to edit; make it live, copy, rename, preview or delete it.
 * Exactly one preset is live (the home page everyone sees).
 */
export function PresetBar({
  presets,
  selected,
  onSelect,
}: {
  presets: HomePreset[];
  selected: HomePreset | null;
  onSelect: (id: string) => void;
}) {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"idle" | "new" | "rename">("idle");
  const [name, setName] = useState("");
  const [copy, setCopy] = useState(true);
  const [previewAs, setPreviewAs] = useState("");

  const refresh = () => queryClient.invalidateQueries({ queryKey: PRESETS_KEY });

  const run = async <T,>(action: () => Promise<T>, done: string): Promise<T | null> => {
    setBusy(true);
    try {
      const result = await action();
      toast.success(done);
      await refresh();
      return result;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      return null;
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!name.trim()) return;
    if (mode === "new") {
      const created = await run(
        () => createHomePreset({ name: name.trim(), copyFrom: copy && selected ? selected.id : null }),
        copy && selected ? `Copied “${selected.name}”` : "Preset created",
      );
      if (created) onSelect(created.id);
    } else if (mode === "rename" && selected) {
      await run(() => updateHomePreset(selected.id, { name: name.trim() }), "Preset renamed");
    }
    setMode("idle");
  };

  const previewUrl = selected
    ? `/?preset=${encodeURIComponent(selected.id)}${previewAs ? `&as=${previewAs}` : ""}`
    : "/";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium tracking-wide text-white/40 uppercase">Preset</span>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors",
                selected?.id === p.id
                  ? "border-[#6b41ff] bg-[#6b41ff]/15 text-white"
                  : "border-white/10 text-white/60 hover:border-white/25 hover:text-white",
              )}
            >
              {p.isActive && <span className="size-1.5 rounded-full bg-green-400" aria-label="Live" />}
              {p.name}
              <span className="text-[11px] text-white/35">{p.sectionCount}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setMode("new");
              setName(selected ? `${selected.name} copy` : "New preset");
            }}
            className="flex items-center gap-1 rounded-lg border border-dashed border-white/15 px-3 py-1.5 text-sm text-white/50 hover:border-white/30 hover:text-white"
          >
            <Plus className="size-3.5" /> New preset
          </button>
        </div>
        {busy && <Loader2 className="size-4 animate-spin text-white/40" />}
      </div>

      {mode !== "idle" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
          className="flex flex-wrap items-center gap-2"
        >
          <input autoFocus value={name} maxLength={80} onChange={(e) => setName(e.target.value)} className={cn(input, "w-64")} />
          {mode === "new" && selected && (
            <label className="flex items-center gap-1.5 text-xs text-white/60">
              <input type="checkbox" checked={copy} onChange={(e) => setCopy(e.target.checked)} />
              Copy the sections of “{selected.name}”
            </label>
          )}
          <SmallButton onClick={() => void submit()} title="Save" disabled={busy || !name.trim()}>
            <Check className="size-3.5" />
          </SmallButton>
          <SmallButton title="Cancel" onClick={() => setMode("idle")}>
            <X className="size-3.5" />
          </SmallButton>
        </form>
      )}

      {selected && mode === "idle" && (
        <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3">
          {selected.isActive ? (
            <span className="flex items-center gap-1.5 rounded-lg bg-green-500/15 px-2.5 py-1.5 text-xs font-medium text-green-300">
              <Radio className="size-3.5" /> Live on the home page
            </span>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                if (confirm(`Make “${selected.name}” the live home page? Everyone will see it right away.`))
                  void run(() => activateHomePreset(selected.id), `“${selected.name}” is live`);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-[#6b41ff] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#5a33ef] disabled:opacity-50"
            >
              <Radio className="size-3.5" /> Make live
            </button>
          )}

          <div className="flex items-center gap-1">
            <select value={previewAs} onChange={(e) => setPreviewAs(e.target.value)} className={cn(input, "h-8 text-xs")}>
              {PREVIEW_AS.map((o) => (
                <option key={o.value} value={o.value}>
                  Preview {o.label}
                </option>
              ))}
            </select>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 items-center gap-1 rounded-lg border border-white/10 px-2.5 text-xs text-white/70 hover:text-white"
            >
              Open <ExternalLink className="size-3.5" />
            </a>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <SmallButton
              title="Rename"
              onClick={() => {
                setMode("rename");
                setName(selected.name);
              }}
            >
              <Pencil className="size-3.5" />
            </SmallButton>
            <SmallButton
              title="Copy to a new preset"
              onClick={() => {
                setMode("new");
                setCopy(true);
                setName(`${selected.name} copy`);
              }}
            >
              <Copy className="size-3.5" />
            </SmallButton>
            <SmallButton
              danger
              title={selected.isActive ? "The live preset can't be deleted" : "Delete preset"}
              disabled={selected.isActive || busy}
              onClick={() => {
                if (confirm(`Delete “${selected.name}” and its ${selected.sectionCount} sections? This can't be undone.`))
                  void run(() => deleteHomePreset(selected.id), "Preset deleted").then(() => {
                    const live = presets.find((p) => p.isActive);
                    if (live) onSelect(live.id);
                  });
              }}
            >
              <Trash2 className="size-3.5" />
            </SmallButton>
          </div>
        </div>
      )}
    </div>
  );
}
