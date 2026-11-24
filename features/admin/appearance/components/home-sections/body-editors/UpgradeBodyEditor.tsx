"use client";

import { HomeSectionLimits as L, type UpgradeBody } from "@/features/home-sections/types";
import { Field, MediaField, TextArea, TextInput } from "../fields";

const BACKGROUNDS = [
  "linear-gradient(135deg, #6b41ff, #ea4bff)",
  "linear-gradient(135deg, #00c2ff, #6b41ff)",
  "linear-gradient(135deg, #ff7a45, #ffd166)",
  "linear-gradient(135deg, #22c55e, #0ea5e9)",
  "#111111",
];

/** A wide call to upgrade; set "Who sees it" to No plan so paying users don't get it. */
export function UpgradeBodyEditor({ body, onChange }: { body: UpgradeBody; onChange: (b: UpgradeBody) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Title">
          <TextInput value={body.title} onChange={(title) => onChange({ ...body, title })} maxLength={L.maxTitleLength} />
        </Field>
        <Field label="Image (optional)">
          <MediaField url={body.imageUrl ?? ""} kind="image" kinds={["image"]} onChange={(imageUrl) => onChange({ ...body, imageUrl: imageUrl || undefined })} />
        </Field>
      </div>
      <Field label="Text">
        <TextArea value={body.text} onChange={(text) => onChange({ ...body, text })} maxLength={L.maxCardTextLength} rows={2} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Button text">
          <TextInput
            value={body.cta.label}
            onChange={(label) => onChange({ ...body, cta: { ...body.cta, label } })}
            maxLength={L.maxCtaLabelLength}
          />
        </Field>
        <Field label="Button link" hint="e.g. /pricing">
          <TextInput value={body.cta.href} onChange={(href) => onChange({ ...body, cta: { ...body.cta, href } })} maxLength={L.maxUrlLength} />
        </Field>
      </div>
      <Field label="Background" hint="Any CSS color or gradient">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-1.5">
            {BACKGROUNDS.map((b) => (
              <button
                key={b}
                type="button"
                title={b}
                onClick={() => onChange({ ...body, background: b })}
                className="size-6 rounded-md border border-white/20"
                style={{ background: b }}
              />
            ))}
          </div>
          <TextInput value={body.background} onChange={(background) => onChange({ ...body, background })} maxLength={L.maxCssLength} />
        </div>
      </Field>
    </div>
  );
}
