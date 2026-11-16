"use client";

import { Plus } from "lucide-react";
import {
  HomeSectionLimits as L,
  MEDIA_ASPECT_RATIOS,
  SECTION_COLUMNS,
  type MediaBody,
  type MediaItem,
} from "@/features/home-sections/types";
import { Field, ItemControls, MediaField, Segmented, SmallButton, TextInput, moveItem } from "../fields";

export function MediaBodyEditor({ body, onChange }: { body: MediaBody; onChange: (b: MediaBody) => void }) {
  const setItem = (i: number, patch: Partial<MediaItem>) =>
    onChange({ ...body, items: body.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4">
        <Field label="Columns">
          <Segmented options={SECTION_COLUMNS.media} value={body.columns} onChange={(columns) => onChange({ ...body, columns })} />
        </Field>
        <Field label="Shape">
          <Segmented
            options={MEDIA_ASPECT_RATIOS}
            value={body.aspectRatio}
            onChange={(aspectRatio) => onChange({ ...body, aspectRatio })}
          />
        </Field>
      </div>

      {body.items.map((item, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-lg border border-white/10 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/60">Item {i + 1}</span>
            <ItemControls
              index={i}
              count={body.items.length}
              onMove={(dir) => onChange({ ...body, items: moveItem(body.items, i, dir) })}
              onRemove={() => onChange({ ...body, items: body.items.filter((_, idx) => idx !== i) })}
            />
          </div>
          <MediaField url={item.url} kind={item.kind} onChange={(url, kind) => setItem(i, { url, kind })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Caption (optional)">
              <TextInput value={item.caption ?? ""} onChange={(caption) => setItem(i, { caption })} maxLength={L.maxCaptionLength} />
            </Field>
            <Field label="Link (optional)" hint="/create/video or https://…">
              <TextInput value={item.href ?? ""} onChange={(href) => setItem(i, { href })} maxLength={L.maxUrlLength} />
            </Field>
          </div>
        </div>
      ))}

      <div>
        <SmallButton
          onClick={() => onChange({ ...body, items: [...body.items, { url: "", kind: "image" }] })}
          disabled={body.items.length >= L.maxItems}
        >
          <Plus className="size-3.5" /> Add photo / video
        </SmallButton>
      </div>
    </div>
  );
}
