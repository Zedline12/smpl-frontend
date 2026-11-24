"use client";

import {
  ANNOUNCEMENT_TONES,
  HomeSectionLimits as L,
  type AnnouncementBody,
} from "@/features/home-sections/types";
import { Field, Segmented, TextInput } from "../fields";

/** A slim strip with a message and an optional button; viewers can close it. */
export function AnnouncementBodyEditor({
  body,
  onChange,
}: {
  body: AnnouncementBody;
  onChange: (b: AnnouncementBody) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Field label="Message">
        <TextInput value={body.text} onChange={(text) => onChange({ ...body, text })} maxLength={L.maxDescriptionLength} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Button text (optional)" hint="Empty: no button">
          <TextInput
            value={body.cta?.label ?? ""}
            onChange={(label) => onChange({ ...body, cta: label ? { label, href: body.cta?.href ?? "/" } : null })}
            maxLength={L.maxCtaLabelLength}
          />
        </Field>
        {body.cta && (
          <Field label="Button link">
            <TextInput
              value={body.cta.href}
              onChange={(href) => onChange({ ...body, cta: { label: body.cta!.label, href } })}
              maxLength={L.maxUrlLength}
            />
          </Field>
        )}
      </div>
      <Field label="Color">
        <Segmented options={ANNOUNCEMENT_TONES} value={body.tone} onChange={(tone) => onChange({ ...body, tone })} />
      </Field>
      <label className="flex items-center gap-2 text-xs text-white/60">
        <input type="checkbox" checked={body.dismissible} onChange={(e) => onChange({ ...body, dismissible: e.target.checked })} />
        People can close it (it comes back when you edit it)
      </label>
    </div>
  );
}
