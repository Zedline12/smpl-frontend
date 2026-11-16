"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ChevronDown, Copy, Eye, EyeOff, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  createHomeSection,
  deleteHomeSection,
  duplicateHomeSection,
  fetchAdminHomeSections,
  reorderHomeSections,
  updateHomeSection,
} from "@/features/home-sections/api";
import {
  HOME_SECTION_TYPES,
  HOME_SECTION_TYPE_LABELS,
  blankBody,
  sectionStatus,
  type AdminHomeSection,
  type HomeSectionType,
  type SectionStatus,
} from "@/features/home-sections/types";
import { HomeSectionForm } from "./HomeSectionForm";
import { SmallButton } from "./fields";

const ADMIN_KEY = ["home-sections", "admin"];

const STATUS: Record<SectionStatus, { label: string; className: string }> = {
  live: { label: "Live", className: "bg-green-500/15 text-green-300" },
  scheduled: { label: "Scheduled", className: "bg-blue-500/15 text-blue-300" },
  expired: { label: "Expired", className: "bg-amber-500/15 text-amber-300" },
  hidden: { label: "Hidden", className: "bg-white/10 text-white/50" },
};

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : null);

function SectionRow({
  section,
  index,
  count,
  expanded,
  onToggleExpand,
  onMove,
  onChanged,
}: {
  section: AdminHomeSection;
  index: number;
  count: number;
  expanded: boolean;
  onToggleExpand: () => void;
  onMove: (dir: -1 | 1) => void;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const status = STATUS[sectionStatus(section)];
  const schedule = [fmt(section.startsAt) && `from ${fmt(section.startsAt)}`, fmt(section.expiresAt) && `until ${fmt(section.expiresAt)}`]
    .filter(Boolean)
    .join(" · ");

  const run = async (action: () => Promise<unknown>, done: string) => {
    setBusy(true);
    try {
      await action();
      toast.success(done);
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={cn("rounded-xl border bg-white/[0.03]", expanded ? "border-white/20" : "border-white/10")}>
      <div className="flex flex-wrap items-center gap-3 p-3">
        <button type="button" onClick={onToggleExpand} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <ChevronDown className={cn("size-4 shrink-0 text-white/40 transition-transform", expanded && "rotate-180")} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium text-white">{section.name}</span>
              <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", status.className)}>{status.label}</span>
            </div>
            <p className="truncate text-[11px] text-white/40">
              {HOME_SECTION_TYPE_LABELS[section.body.type]}
              {section.header.align !== "none" && section.header.title ? ` · “${section.header.title}”` : " · no header"}
              {schedule && ` · ${schedule}`}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-1">
          {busy && <Loader2 className="size-3.5 animate-spin text-white/40" />}
          <SmallButton onClick={() => onMove(-1)} disabled={index === 0} title="Move up">
            <ArrowUp className="size-3.5" />
          </SmallButton>
          <SmallButton onClick={() => onMove(1)} disabled={index === count - 1} title="Move down">
            <ArrowDown className="size-3.5" />
          </SmallButton>
          <SmallButton
            onClick={() =>
              run(() => updateHomeSection(section.id, { isActive: !section.isActive }), section.isActive ? "Section hidden" : "Section shown")
            }
            title={section.isActive ? "Hide from users" : "Show to users"}
          >
            {section.isActive ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
          </SmallButton>
          <SmallButton onClick={() => run(() => duplicateHomeSection(section.id), "Copy added (hidden)")} title="Duplicate">
            <Copy className="size-3.5" />
          </SmallButton>
          <SmallButton
            danger
            title="Delete"
            onClick={() => {
              if (confirm(`Delete "${section.name}"? This can't be undone.`))
                void run(() => deleteHomeSection(section.id), "Section deleted");
            }}
          >
            <Trash2 className="size-3.5" />
          </SmallButton>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-white/10 p-4">
          <HomeSectionForm section={section} onSaved={onChanged} />
        </div>
      )}
    </div>
  );
}

/** App Appearance → Homepage Sections: custom sections shown after the home page hero. */
export function HomeSectionsEditor() {
  const queryClient = useQueryClient();
  const { data: sections = [], isLoading, error } = useQuery({ queryKey: ADMIN_KEY, queryFn: fetchAdminHomeSections });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ADMIN_KEY });

  const add = async (type: HomeSectionType) => {
    setAdding(true);
    try {
      // New sections start hidden, so nothing half-done shows on the home page.
      const created = await createHomeSection({
        name: `New ${HOME_SECTION_TYPE_LABELS[type].toLowerCase()}`,
        isActive: false,
        startsAt: null,
        expiresAt: null,
        header: type === "hero" ? { align: "none", title: "", description: "" } : { align: "left", title: "Section title", description: "" },
        body: blankBody(type),
      });
      await refresh();
      setExpandedId(created.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't add the section");
    } finally {
      setAdding(false);
    }
  };

  const move = async (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= sections.length) return;
    const ids = sections.map((s) => s.id);
    [ids[i], ids[j]] = [ids[j], ids[i]];
    // Show the new order right away; the server confirms it.
    queryClient.setQueryData<AdminHomeSection[]>(ADMIN_KEY, ids.map((id) => sections.find((s) => s.id === id)!));
    try {
      await reorderHomeSections(ids);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't reorder sections");
    }
    void refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Homepage Sections</h1>
        <p className="mt-1 text-sm text-white/40">
          Custom sections shown on the home page after the hero, top to bottom in this order. A section shows while it&apos;s
          active and inside its show-from / hide-after window.
        </p>
      </div>

      {isLoading ? (
        <Loader2 className="size-5 animate-spin text-white/40" />
      ) : error ? (
        <p className="text-sm text-red-400">{error instanceof Error ? error.message : "Couldn't load sections"}</p>
      ) : sections.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 py-16 text-center text-sm text-white/30">
          No sections yet. Add one below.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sections.map((s, i) => (
            <SectionRow
              key={s.id}
              section={s}
              index={i}
              count={sections.length}
              expanded={expandedId === s.id}
              onToggleExpand={() => setExpandedId((id) => (id === s.id ? null : s.id))}
              onMove={(dir) => move(i, dir)}
              onChanged={refresh}
            />
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs text-white/40">
          {adding ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />} Add section:
        </span>
        {HOME_SECTION_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            disabled={adding}
            onClick={() => add(type)}
            className="rounded-lg border border-dashed border-white/15 px-3 py-2 text-xs text-white/60 transition-colors hover:border-white/30 hover:text-white disabled:opacity-40"
          >
            {HOME_SECTION_TYPE_LABELS[type]}
          </button>
        ))}
      </div>
    </div>
  );
}
