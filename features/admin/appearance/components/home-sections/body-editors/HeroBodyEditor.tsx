"use client";

import {
  CONTENT_ALIGNS,
  HERO_HEIGHTS,
  HomeSectionLimits as L,
  type HeroBody,
} from "@/features/home-sections/types";
import { Field, MediaField, Segmented, TextArea, TextInput } from "../fields";

const HEIGHT_LABELS = { sm: "Small", md: "Medium", lg: "Large" } as const;

export function HeroBodyEditor({ body, onChange }: { body: HeroBody; onChange: (b: HeroBody) => void }) {
  const set = (patch: Partial<HeroBody>) => onChange({ ...body, ...patch });
  return (
    <div className="flex flex-col gap-4">
      <Field label="Background">
        <MediaField
          url={body.background.url}
          kind={body.background.kind}
          onChange={(url, kind) => set({ background: { url, kind } })}
        />
      </Field>

      <div className="flex flex-wrap gap-4">
        <Field label="Content position">
          <Segmented options={CONTENT_ALIGNS} value={body.align} onChange={(align) => set({ align })} />
        </Field>
        <Field label="Height">
          <Segmented options={HERO_HEIGHTS} value={body.height} onChange={(height) => set({ height })} label={(h) => HEIGHT_LABELS[h]} />
        </Field>
        <Field label={`Darken background (${Math.round(body.overlay * 100)}%)`}>
          <input
            type="range"
            min={0}
            max={0.9}
            step={0.05}
            value={body.overlay}
            onChange={(e) => set({ overlay: Number(e.target.value) })}
            className="w-40 accent-white"
          />
        </Field>
      </div>

      <Field label="Title">
        <TextInput value={body.title} onChange={(title) => set({ title })} maxLength={L.maxTitleLength} />
      </Field>
      <Field label="Text">
        <TextArea value={body.text} onChange={(text) => set({ text })} maxLength={L.maxCardTextLength} />
      </Field>

      <div className="flex flex-col gap-2 rounded-lg border border-white/10 p-3">
        <label className="flex items-center gap-2 text-xs text-white/70">
          <input
            type="checkbox"
            checked={!!body.cta}
            onChange={(e) => set({ cta: e.target.checked ? { label: "Try it", href: "/create/video" } : null })}
          />
          CTA button
        </label>
        {body.cta && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Button text">
              <TextInput
                value={body.cta.label}
                onChange={(label) => set({ cta: { ...body.cta!, label } })}
                maxLength={L.maxCtaLabelLength}
              />
            </Field>
            <Field label="Button link" hint="/create/video or https://…">
              <TextInput
                value={body.cta.href}
                onChange={(href) => set({ cta: { ...body.cta!, href } })}
                maxLength={L.maxUrlLength}
              />
            </Field>
          </div>
        )}
      </div>
    </div>
  );
}
