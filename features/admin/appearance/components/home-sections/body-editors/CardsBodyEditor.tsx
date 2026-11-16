"use client";

import { Plus } from "lucide-react";
import {
  HomeSectionLimits as L,
  SECTION_COLUMNS,
  type CardItem,
  type CardsBody,
} from "@/features/home-sections/types";
import { Field, ItemControls, MediaField, Segmented, SmallButton, TextArea, TextInput, moveItem } from "../fields";

/** Quick backgrounds; any CSS color or gradient can be typed too. */
const PRESETS = [
  "linear-gradient(135deg, #6b41ff, #ea4bff)",
  "linear-gradient(135deg, #ff7a45, #ffd166)",
  "linear-gradient(135deg, #00c2ff, #6b41ff)",
  "linear-gradient(135deg, #22c55e, #0ea5e9)",
  "#111111",
  "#d4ff00",
];

export function CardsBodyEditor({ body, onChange }: { body: CardsBody; onChange: (b: CardsBody) => void }) {
  const setItem = (i: number, patch: Partial<CardItem>) =>
    onChange({ ...body, items: body.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });

  return (
    <div className="flex flex-col gap-4">
      <Field label="Columns">
        <Segmented options={SECTION_COLUMNS.cards} value={body.columns} onChange={(columns) => onChange({ ...body, columns })} />
      </Field>

      {body.items.map((card, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-lg border border-white/10 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/60">Card {i + 1}</span>
            <ItemControls
              index={i}
              count={body.items.length}
              onMove={(dir) => onChange({ ...body, items: moveItem(body.items, i, dir) })}
              onRemove={() => onChange({ ...body, items: body.items.filter((_, idx) => idx !== i) })}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Title">
              <TextInput value={card.title} onChange={(title) => setItem(i, { title })} maxLength={L.maxTitleLength} />
            </Field>
            <Field label="Link (optional)" hint="/create/video or https://…">
              <TextInput value={card.href ?? ""} onChange={(href) => setItem(i, { href })} maxLength={L.maxUrlLength} />
            </Field>
          </div>
          <Field label="Text">
            <TextArea value={card.text} onChange={(text) => setItem(i, { text })} maxLength={L.maxCardTextLength} />
          </Field>
          <Field label="Background" hint="Any CSS color or gradient">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    title={p}
                    onClick={() => setItem(i, { background: p })}
                    className="size-6 rounded-md border border-white/20"
                    style={{ background: p }}
                  />
                ))}
              </div>
              <TextInput value={card.background} onChange={(background) => setItem(i, { background })} maxLength={L.maxCssLength} />
            </div>
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Text color (optional)" hint="e.g. #ffffff or black">
              <TextInput value={card.textColor ?? ""} onChange={(textColor) => setItem(i, { textColor })} maxLength={L.maxCssLength} />
            </Field>
            <Field label="Image (optional)">
              <MediaField
                url={card.imageUrl ?? ""}
                kind="image"
                kinds={["image"]}
                onChange={(imageUrl) => setItem(i, { imageUrl })}
              />
            </Field>
          </div>
        </div>
      ))}

      <div>
        <SmallButton
          onClick={() =>
            onChange({ ...body, items: [...body.items, { title: "", text: "", background: PRESETS[body.items.length % PRESETS.length] }] })
          }
          disabled={body.items.length >= L.maxItems}
        >
          <Plus className="size-3.5" /> Add card
        </SmallButton>
      </div>
    </div>
  );
}
