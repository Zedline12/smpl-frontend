"use client";

import { Plus } from "lucide-react";
import { HomeSectionLimits as L, type ShowcaseBody, type ShowcaseItem } from "@/features/home-sections/types";
import { Field, ItemControls, MediaField, SmallButton, TextInput, moveItem } from "../fields";

/** Featured videos row: each card is a looping video with a title, a line of text and a link. */
export function ShowcaseBodyEditor({ body, onChange }: { body: ShowcaseBody; onChange: (b: ShowcaseBody) => void }) {
  const setItem = (i: number, patch: Partial<ShowcaseItem>) =>
    onChange({ ...body, items: body.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-white/40">16:9 videos play muted on a loop while they&apos;re on screen. Keep them short and light.</p>
      {body.items.map((item, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-lg border border-white/10 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/60">Video {i + 1}</span>
            <ItemControls
              index={i}
              count={body.items.length}
              onMove={(dir) => onChange({ ...body, items: moveItem(body.items, i, dir) })}
              onRemove={() => onChange({ ...body, items: body.items.filter((_, idx) => idx !== i) })}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Video">
              <MediaField url={item.video} kind="video" kinds={["video"]} onChange={(video) => setItem(i, { video })} />
            </Field>
            <Field label="Poster (optional)" hint="Shown before it plays">
              <MediaField
                url={item.poster ?? ""}
                kind="image"
                kinds={["image"]}
                onChange={(poster) => setItem(i, { poster: poster || undefined })}
              />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Title">
              <TextInput value={item.title} onChange={(title) => setItem(i, { title })} maxLength={L.maxTitleLength} />
            </Field>
            <Field label="Link" hint="/create/video or https://…">
              <TextInput value={item.href} onChange={(href) => setItem(i, { href })} maxLength={L.maxUrlLength} />
            </Field>
            <Field label="Badge (optional)" hint="e.g. NEW">
              <TextInput
                value={item.badge ?? ""}
                onChange={(badge) => setItem(i, { badge: badge || undefined })}
                maxLength={L.maxBadgeLength}
              />
            </Field>
          </div>
          <Field label="Text">
            <TextInput
              value={item.description}
              onChange={(description) => setItem(i, { description })}
              maxLength={L.maxDescriptionLength}
            />
          </Field>
        </div>
      ))}
      <div>
        <SmallButton
          onClick={() =>
            onChange({ ...body, items: [...body.items, { title: "", description: "", video: "", href: "/create/video" }] })
          }
          disabled={body.items.length >= L.maxShowcaseItems}
        >
          <Plus className="size-3.5" /> Add video
        </SmallButton>
      </div>
    </div>
  );
}
