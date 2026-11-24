"use client";

import {
  HomeSectionLimits as L,
  RECENT_MEDIA_TYPES,
  SECTION_COLUMNS,
  type RecentBody,
} from "@/features/home-sections/types";
import { Field, Segmented, TextInput } from "../fields";

const COUNTS = [4, 6, 8, 10, 12] as const;

/** The viewer's own latest creations; nothing to pick, just how many and which kind. */
export function RecentBodyEditor({ body, onChange }: { body: RecentBody; onChange: (b: RecentBody) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-white/40">
        Each signed-in person sees their own latest creations; guests and people with none see nothing. The preview shows yours.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Kind">
          <Segmented options={RECENT_MEDIA_TYPES} value={body.mediaType} onChange={(mediaType) => onChange({ ...body, mediaType })} />
        </Field>
        <Field label="How many">
          <Segmented
            options={COUNTS}
            value={(COUNTS as readonly number[]).includes(body.limit) ? (body.limit as (typeof COUNTS)[number]) : 8}
            onChange={(limit) => onChange({ ...body, limit })}
          />
        </Field>
        <Field label="Columns">
          <Segmented options={SECTION_COLUMNS.recent} value={body.columns} onChange={(columns) => onChange({ ...body, columns })} />
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="“See all” link (optional)" hint="e.g. /assets; empty: no button">
          <TextInput
            value={body.link?.href ?? ""}
            onChange={(href) => onChange({ ...body, link: href ? { href, label: body.link?.label ?? "" } : null })}
            maxLength={L.maxUrlLength}
          />
        </Field>
        {body.link && (
          <Field label="Button text" hint="Empty: “View all”">
            <TextInput
              value={body.link.label}
              onChange={(label) => onChange({ ...body, link: { href: body.link!.href, label } })}
              maxLength={L.maxCtaLabelLength}
            />
          </Field>
        )}
      </div>
    </div>
  );
}
