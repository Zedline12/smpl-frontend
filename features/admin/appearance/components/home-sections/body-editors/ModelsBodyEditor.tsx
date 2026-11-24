"use client";

import { Plus } from "lucide-react";
import { HomeSectionLimits as L, type ModelItem, type ModelsBody } from "@/features/home-sections/types";
import { Field, ItemControls, MediaField, SmallButton, TextInput, moveItem } from "../fields";

/** A row of AI model cards: logo, name, a short line, badge, link. */
export function ModelsBodyEditor({ body, onChange }: { body: ModelsBody; onChange: (b: ModelsBody) => void }) {
  const setItem = (i: number, patch: Partial<ModelItem>) =>
    onChange({ ...body, items: body.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });

  return (
    <div className="flex flex-col gap-4">
      {body.items.map((m, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-lg border border-white/10 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/60">Model {i + 1}</span>
            <ItemControls
              index={i}
              count={body.items.length}
              onMove={(dir) => onChange({ ...body, items: moveItem(body.items, i, dir) })}
              onRemove={() => onChange({ ...body, items: body.items.filter((_, idx) => idx !== i) })}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Name">
              <TextInput value={m.name} onChange={(name) => setItem(i, { name })} maxLength={L.maxTitleLength} />
            </Field>
            <Field label="Link" hint="/create/video?model=veo-3">
              <TextInput value={m.href} onChange={(href) => setItem(i, { href })} maxLength={L.maxUrlLength} />
            </Field>
            <Field label="Badge (optional)" hint="e.g. NEW">
              <TextInput value={m.badge ?? ""} onChange={(badge) => setItem(i, { badge: badge || undefined })} maxLength={L.maxBadgeLength} />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Short text (optional)">
              <TextInput
                value={m.description ?? ""}
                onChange={(description) => setItem(i, { description: description || undefined })}
                maxLength={L.maxCaptionLength}
              />
            </Field>
            <Field label="Logo (optional)">
              <MediaField url={m.logoUrl ?? ""} kind="image" kinds={["image"]} onChange={(logoUrl) => setItem(i, { logoUrl: logoUrl || undefined })} />
            </Field>
          </div>
        </div>
      ))}
      <div>
        <SmallButton
          onClick={() => onChange({ ...body, items: [...body.items, { name: "", href: "/create/video" }] })}
          disabled={body.items.length >= L.maxItems}
        >
          <Plus className="size-3.5" /> Add model
        </SmallButton>
      </div>
    </div>
  );
}
