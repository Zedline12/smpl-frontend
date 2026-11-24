"use client";

import { Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { TOOL_ICONS } from "@/components/FeatureGrid";
import {
  HomeSectionLimits as L,
  type ToolItem,
  type ToolsBody,
  type ToolsPromo,
} from "@/features/home-sections/types";
import { Field, ItemControls, MediaField, SmallButton, TextInput, moveItem } from "../fields";

const DEFAULT_PROMO: ToolsPromo = {
  title: "Smpl Studio",
  subtitle: "Your AI creative suite — all models, one workspace.",
  cta: { label: "Create", href: "/create/video" },
  statusItems: [{ label: "Veo 3 generation complete", accent: true }],
  thumbUrls: ["", "", ""],
};

function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {Object.entries(TOOL_ICONS).map(([key, Icon]) => (
        <button
          key={key}
          type="button"
          title={key}
          onClick={() => onChange(key)}
          className={cn(
            "flex size-8 items-center justify-center rounded-md border transition-colors",
            value === key ? "border-[#6b41ff] bg-[#6b41ff]/20 text-white" : "border-white/10 text-white/50 hover:text-white",
          )}
        >
          <Icon className="size-4" />
        </button>
      ))}
    </div>
  );
}

/** The studio card on the left (optional) and the tool cards. */
export function ToolsBodyEditor({ body, onChange }: { body: ToolsBody; onChange: (b: ToolsBody) => void }) {
  const setItem = (i: number, patch: Partial<ToolItem>) =>
    onChange({ ...body, items: body.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });
  const promo = body.promo;
  const setPromo = (patch: Partial<ToolsPromo>) => promo && onChange({ ...body, promo: { ...promo, ...patch } });
  const thumbs = [0, 1, 2].map((i) => promo?.thumbUrls[i] ?? "");

  return (
    <div className="flex flex-col gap-4">
      {/* Big card */}
      <div className="flex flex-col gap-3 rounded-lg border border-white/10 p-3">
        <label className="flex items-center gap-2 text-xs font-medium text-white/70">
          <input
            type="checkbox"
            checked={!!promo}
            onChange={(e) => onChange({ ...body, promo: e.target.checked ? DEFAULT_PROMO : null })}
          />
          Big card on the left (title, button, activity lines, thumbnails)
        </label>
        {promo && (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Title">
                <TextInput value={promo.title} onChange={(title) => setPromo({ title })} maxLength={L.maxTitleLength} />
              </Field>
              <Field label="Text">
                <TextInput value={promo.subtitle} onChange={(subtitle) => setPromo({ subtitle })} maxLength={L.maxDescriptionLength} />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Button text" hint="Empty: no button">
                <TextInput
                  value={promo.cta?.label ?? ""}
                  onChange={(label) => setPromo({ cta: label ? { label, href: promo.cta?.href ?? "/create/video" } : null })}
                  maxLength={L.maxCtaLabelLength}
                />
              </Field>
              {promo.cta && (
                <Field label="Button link">
                  <TextInput
                    value={promo.cta.href}
                    onChange={(href) => setPromo({ cta: { label: promo.cta!.label, href } })}
                    maxLength={L.maxUrlLength}
                  />
                </Field>
              )}
            </div>
            <Field label="Activity lines" hint="Checked lines get a check mark">
              <div className="flex flex-col gap-2">
                {promo.statusItems.map((line, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      title="Done (check mark)"
                      checked={!!line.accent}
                      onChange={(e) =>
                        setPromo({
                          statusItems: promo.statusItems.map((l, idx) => (idx === i ? { ...l, accent: e.target.checked || undefined } : l)),
                        })
                      }
                    />
                    <TextInput
                      value={line.label}
                      onChange={(label) =>
                        setPromo({ statusItems: promo.statusItems.map((l, idx) => (idx === i ? { ...l, label } : l)) })
                      }
                      maxLength={L.maxCaptionLength}
                    />
                    <ItemControls
                      index={i}
                      count={promo.statusItems.length}
                      onMove={(dir) => setPromo({ statusItems: moveItem(promo.statusItems, i, dir) })}
                      onRemove={() => setPromo({ statusItems: promo.statusItems.filter((_, idx) => idx !== i) })}
                    />
                  </div>
                ))}
                <div>
                  <SmallButton
                    onClick={() => setPromo({ statusItems: [...promo.statusItems, { label: "" }] })}
                    disabled={promo.statusItems.length >= L.maxStatusItems}
                  >
                    <Plus className="size-3.5" /> Add line
                  </SmallButton>
                </div>
              </div>
            </Field>
            <Field label="Thumbnails (optional)" hint="Empty ones show a placeholder tile">
              <div className="grid gap-2 sm:grid-cols-3">
                {thumbs.map((url, i) => (
                  <MediaField
                    key={i}
                    url={url}
                    kind="image"
                    kinds={["image"]}
                    onChange={(u) => setPromo({ thumbUrls: thumbs.map((t, idx) => (idx === i ? u : t)) })}
                  />
                ))}
              </div>
            </Field>
          </>
        )}
      </div>

      {/* Tool cards */}
      {body.items.map((item, i) => {
        const Icon = TOOL_ICONS[item.icon] ?? Sparkles;
        return (
          <div key={i} className="flex flex-col gap-3 rounded-lg border border-white/10 p-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-medium text-white/60">
                <Icon className="size-3.5" /> Tool card {i + 1}
              </span>
              <ItemControls
                index={i}
                count={body.items.length}
                onMove={(dir) => onChange({ ...body, items: moveItem(body.items, i, dir) })}
                onRemove={() => onChange({ ...body, items: body.items.filter((_, idx) => idx !== i) })}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Title">
                <TextInput value={item.title} onChange={(title) => setItem(i, { title })} maxLength={L.maxTitleLength} />
              </Field>
              <Field label="Link" hint="/ads-studio or https://…">
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
            <Field label="Icon">
              <IconPicker value={item.icon} onChange={(icon) => setItem(i, { icon })} />
            </Field>
            <label className="flex items-center gap-2 text-xs text-white/60">
              <input
                type="checkbox"
                checked={!!item.highlighted}
                onChange={(e) => setItem(i, { highlighted: e.target.checked || undefined })}
              />
              Highlight (purple card)
            </label>
          </div>
        );
      })}
      <div>
        <SmallButton
          onClick={() =>
            onChange({ ...body, items: [...body.items, { icon: "Sparkles", title: "", description: "", href: "/create/video" }] })
          }
          disabled={body.items.length >= L.maxToolItems}
        >
          <Plus className="size-3.5" /> Add tool card
        </SmallButton>
      </div>
    </div>
  );
}
