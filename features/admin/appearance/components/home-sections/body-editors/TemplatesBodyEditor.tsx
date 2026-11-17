"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchTemplates } from "@/features/templates/api";
import type { Template } from "@/features/templates/types";
import { HomeSectionLimits as L, SECTION_COLUMNS, type TemplatesBody } from "@/features/home-sections/types";
import { Field, ItemControls, Segmented, TextInput, moveItem } from "../fields";

/** Published templates to pick from (shared with the section preview). */
export function usePublishedTemplates() {
  return useQuery({
    queryKey: ["templates", "home-sections-picker"],
    queryFn: () => fetchTemplates({ limit: 200 }),
    staleTime: 60_000,
    select: (page) => page.data,
  });
}

function Thumb({ t }: { t: Template }) {
  const video = t.videos[0];
  const image = t.images[0];
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-md bg-black">
      {video ? (
        <video src={video} muted playsInline preload="metadata" className="h-full w-full object-cover" />
      ) : image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />
      ) : null}
    </div>
  );
}

export function TemplatesBodyEditor({ body, onChange }: { body: TemplatesBody; onChange: (b: TemplatesBody) => void }) {
  const { data: templates = [], isLoading } = usePublishedTemplates();
  const [filter, setFilter] = useState("");
  const byId = useMemo(() => new Map(templates.map((t) => [t.id, t])), [templates]);

  const selected = new Set(body.templateIds);
  const toggle = (id: string) =>
    onChange({
      ...body,
      templateIds: selected.has(id)
        ? body.templateIds.filter((x) => x !== id)
        : [...body.templateIds, id].slice(0, L.maxItems),
    });

  const shown = templates.filter((t) => !filter || t.model.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="flex flex-col gap-4">
      <Field label="Columns">
        <Segmented options={SECTION_COLUMNS.templates} value={body.columns} onChange={(columns) => onChange({ ...body, columns })} />
      </Field>

      {/* Picked, in display order */}
      <Field label={`Picked templates (${body.templateIds.length}/${L.maxItems})`}>
        {body.templateIds.length === 0 ? (
          <p className="text-xs text-white/35">None yet: click templates below to add them.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {body.templateIds.map((id, i) => {
              const t = byId.get(id);
              return (
                <div key={id} className="flex items-center gap-3 rounded-lg border border-white/10 p-2">
                  <div className="w-24 shrink-0">{t ? <Thumb t={t} /> : null}</div>
                  <span className="min-w-0 flex-1 truncate text-xs text-white/70">
                    {t ? t.model : `${id} (unpublished or deleted: hidden on the home page)`}
                  </span>
                  <ItemControls
                    index={i}
                    count={body.templateIds.length}
                    onMove={(dir) => onChange({ ...body, templateIds: moveItem(body.templateIds, i, dir) })}
                    onRemove={() => toggle(id)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </Field>

      {/* Link: makes the title a link and adds a faded "View all" button under the grid. */}
      <div className="flex flex-col gap-2 rounded-lg border border-white/10 p-3">
        <label className="flex items-center gap-2 text-xs text-white/70">
          <input
            type="checkbox"
            checked={!!body.link}
            onChange={(e) => onChange({ ...body, link: e.target.checked ? { href: "", label: "" } : null })}
          />
          Link to more
        </label>
        {body.link && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Link" hint="/create/video?model=… or https://…">
              <TextInput
                value={body.link.href}
                onChange={(href) => onChange({ ...body, link: { ...body.link!, href } })}
                maxLength={L.maxUrlLength}
              />
            </Field>
            <Field label="Button text" hint='Empty shows "View all"'>
              <TextInput
                value={body.link.label}
                onChange={(label) => onChange({ ...body, link: { ...body.link!, label } })}
                maxLength={L.maxCtaLabelLength}
              />
            </Field>
          </div>
        )}
      </div>

      {/* Library */}
      <Field label="Published templates">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by model…"
          className="mb-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none"
        />
        {isLoading ? (
          <Loader2 className="size-4 animate-spin text-white/40" />
        ) : (
          <div className="grid max-h-80 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4 lg:grid-cols-6">
            {shown.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => toggle(t.id)}
                title={t.model}
                className={cn(
                  "relative rounded-md p-0.5 ring-1 transition",
                  selected.has(t.id) ? "ring-2 ring-white" : "ring-white/10 hover:ring-white/40",
                )}
              >
                <Thumb t={t} />
                {selected.has(t.id) && (
                  <span className="absolute right-1.5 top-1.5 rounded-full bg-white p-0.5 text-black">
                    <Check className="size-3" />
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </Field>
    </div>
  );
}
