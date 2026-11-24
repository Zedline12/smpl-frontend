"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Field,
  ItemControls,
  MediaField,
  Segmented,
  SmallButton,
  TextArea,
  TextInput,
  isoToLocalInput,
  localInputToIso,
  moveItem,
} from "@/features/admin/appearance/components/home-sections/fields";
import { BroadcastCard } from "@/features/broadcasts/components/BroadcastCard";
import {
  AUDIENCE_LABELS,
  BROADCAST_ALIGNS,
  BROADCAST_AUDIENCES,
  BROADCAST_BUTTON_STYLES,
  BROADCAST_LAYOUTS,
  BROADCAST_SIZES,
  BroadcastLimits as L,
  LAYOUT_LABELS,
  type AdminBroadcast,
  type BroadcastButton,
  type BroadcastDesign,
  type BroadcastInput,
} from "@/features/broadcasts/types";

const BACKGROUNDS = [
  "linear-gradient(135deg, #1b1033, #0b0b10)",
  "linear-gradient(135deg, #6b41ff, #ea4bff)",
  "linear-gradient(135deg, #00c2ff, #6b41ff)",
  "linear-gradient(135deg, #ff7a45, #ffd166)",
  "linear-gradient(135deg, #22c55e, #0ea5e9)",
  "#111111",
  "#ffffff",
];
const ACCENTS = ["#6b41ff", "#ea4bff", "#c4ff3d", "#00c2ff", "#ff7a45", "#22c55e", "#111111"];
const TEXT_COLORS = ["#ffffff", "#111111"];

const SIZE_LABELS: Record<BroadcastDesign["size"], string> = { sm: "Small", md: "Medium", lg: "Large" };
const AUDIENCE_HINT: Record<BroadcastInput["audience"], string> = {
  all: "Every signed-in user",
  no_plan: "Signed in without a paid plan",
  paid: "Users with a paid plan",
};

function Swatches({ colors, onPick }: { colors: string[]; onPick: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {colors.map((c) => (
        <button
          key={c}
          type="button"
          title={c}
          onClick={() => onPick(c)}
          className="size-6 rounded-md border border-white/20"
          style={{ background: c }}
        />
      ))}
    </div>
  );
}

/** Create or edit one announcement, with a live preview of the popup. */
export function BroadcastForm({
  initial,
  saving,
  onSave,
  onCancel,
}: {
  initial: AdminBroadcast | BroadcastInput;
  saving: boolean;
  onSave: (draft: BroadcastInput) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<BroadcastInput>({
    name: initial.name,
    enabled: initial.enabled,
    startsAt: initial.startsAt,
    endsAt: initial.endsAt,
    audience: initial.audience,
    priority: initial.priority,
    design: initial.design,
  });
  const set = (patch: Partial<BroadcastInput>) => setDraft((d) => ({ ...d, ...patch }));
  const setDesign = (patch: Partial<BroadcastDesign>) => setDraft((d) => ({ ...d, design: { ...d.design, ...patch } }));
  const d = draft.design;
  const setButton = (i: number, patch: Partial<BroadcastButton>) =>
    setDesign({ buttons: d.buttons.map((b, idx) => (idx === i ? { ...b, ...patch } : b)) });
  const stats = "stats" in initial ? initial.stats : null;

  const submit = () => {
    if (!draft.name.trim()) return toast.error("Give it a name");
    if (!d.title.trim()) return toast.error("Add a title");
    if (d.layout !== "image_top" && !d.media) return toast.error("This layout needs an image or a video");
    if (draft.startsAt && draft.endsAt && new Date(draft.endsAt) <= new Date(draft.startsAt))
      return toast.error("The end must be after the start");
    onSave(draft);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-5">
        {/* Basics */}
        <section className="flex flex-col gap-3 rounded-xl border border-white/10 p-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Field label="Name (only admins see it)">
              <TextInput value={draft.name} onChange={(name) => set({ name })} maxLength={L.maxNameLength} placeholder="e.g. Black Friday 40% off" />
            </Field>
            <Field label="Priority" hint="Higher shows first">
              <input
                type="number"
                min={L.minPriority}
                max={L.maxPriority}
                value={draft.priority}
                onChange={(e) => set({ priority: Math.trunc(Number(e.target.value) || 0) })}
                className="h-9 w-24 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-white outline-none focus:border-white/30"
              />
            </Field>
          </div>
          <Field label="Who sees it" hint={AUDIENCE_HINT[draft.audience]}>
            <Segmented options={BROADCAST_AUDIENCES} value={draft.audience} onChange={(audience) => set({ audience })} label={(a) => AUDIENCE_LABELS[a]} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Start" hint="Your local time; empty = as soon as it's on">
              <TextInput type="datetime-local" value={isoToLocalInput(draft.startsAt)} onChange={(v) => set({ startsAt: localInputToIso(v) })} />
            </Field>
            <Field label="End (optional)" hint="Empty = until you turn it off">
              <TextInput type="datetime-local" value={isoToLocalInput(draft.endsAt)} onChange={(v) => set({ endsAt: localInputToIso(v) })} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-white/80">
            <input type="checkbox" checked={draft.enabled} onChange={(e) => set({ enabled: e.target.checked })} />
            On (shows during the dates above)
          </label>
        </section>

        {/* Design */}
        <section className="flex flex-col gap-3 rounded-xl border border-white/10 p-4">
          <Field label="Layout">
            <Segmented options={BROADCAST_LAYOUTS} value={d.layout} onChange={(layout) => setDesign({ layout })} label={(l) => LAYOUT_LABELS[l]} />
          </Field>
          <Field label={d.layout === "image_top" ? "Image or video (optional)" : "Image or video"}>
            <MediaField
              url={d.media?.url ?? ""}
              kind={d.media?.kind ?? "image"}
              onChange={(url, kind) => setDesign({ media: url ? { url, kind } : null })}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
            <Field label="Badge (optional)" hint="e.g. NEW, -40%">
              <TextInput value={d.badge} onChange={(badge) => setDesign({ badge })} maxLength={L.maxBadgeLength} />
            </Field>
            <Field label="Title">
              <TextInput value={d.title} onChange={(title) => setDesign({ title })} maxLength={L.maxTitleLength} />
            </Field>
          </div>
          <Field label="Text (optional)">
            <TextArea value={d.body} onChange={(body) => setDesign({ body })} maxLength={L.maxBodyLength} rows={3} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Alignment">
              <Segmented options={BROADCAST_ALIGNS} value={d.align} onChange={(align) => setDesign({ align })} />
            </Field>
            <Field label="Size">
              <Segmented options={BROADCAST_SIZES} value={d.size} onChange={(size) => setDesign({ size })} label={(s) => SIZE_LABELS[s]} />
            </Field>
          </div>
          <Field label="Background" hint="Any CSS color or gradient">
            <div className="flex flex-col gap-2">
              <Swatches colors={BACKGROUNDS} onPick={(background) => setDesign({ background })} />
              <TextInput value={d.background} onChange={(background) => setDesign({ background })} maxLength={L.maxCssLength} />
            </div>
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Text color">
              <div className="flex flex-col gap-2">
                <Swatches colors={TEXT_COLORS} onPick={(textColor) => setDesign({ textColor })} />
                <TextInput value={d.textColor} onChange={(textColor) => setDesign({ textColor })} maxLength={L.maxCssLength} />
              </div>
            </Field>
            <Field label="Button & badge color">
              <div className="flex flex-col gap-2">
                <Swatches colors={ACCENTS} onPick={(accent) => setDesign({ accent })} />
                <TextInput value={d.accent} onChange={(accent) => setDesign({ accent })} maxLength={L.maxCssLength} />
              </div>
            </Field>
          </div>
        </section>

        {/* Buttons */}
        <section className="flex flex-col gap-3 rounded-xl border border-white/10 p-4">
          <span className="text-[11px] font-medium tracking-wide text-white/45 uppercase">Buttons</span>
          {d.buttons.map((b, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-lg border border-white/10 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-white/60">
                  Button {i + 1}
                  {stats && <span className="ml-2 text-white/35">· {stats.clicksByButton[i] ?? 0} clicks</span>}
                </span>
                <ItemControls
                  index={i}
                  count={d.buttons.length}
                  onMove={(dir) => setDesign({ buttons: moveItem(d.buttons, i, dir) })}
                  onRemove={() => setDesign({ buttons: d.buttons.filter((_, idx) => idx !== i) })}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Text">
                  <TextInput value={b.label} onChange={(label) => setButton(i, { label })} maxLength={L.maxButtonLabelLength} />
                </Field>
                <Field label="Link" hint="/pricing or https://…">
                  <TextInput value={b.href} onChange={(href) => setButton(i, { href })} maxLength={L.maxUrlLength} />
                </Field>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Segmented options={BROADCAST_BUTTON_STYLES} value={b.style} onChange={(style) => setButton(i, { style })} />
                <label className="flex items-center gap-2 text-xs text-white/60">
                  <input type="checkbox" checked={b.newTab} onChange={(e) => setButton(i, { newTab: e.target.checked })} />
                  Open in a new tab
                </label>
              </div>
            </div>
          ))}
          <div>
            <SmallButton
              disabled={d.buttons.length >= L.maxButtons}
              onClick={() =>
                setDesign({
                  buttons: [...d.buttons, { label: "Learn more", href: "/", style: d.buttons.length ? "secondary" : "primary", newTab: false }],
                })
              }
            >
              <Plus className="size-3.5" /> Add button
            </SmallButton>
          </div>
        </section>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="bg-primary hover:bg-primary/90 flex h-10 items-center gap-2 rounded-lg px-5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving && <Loader2 className="size-4 animate-spin" />} Save
          </button>
          <button type="button" onClick={onCancel} className="h-10 rounded-lg border border-white/10 px-5 text-sm text-white/70 hover:bg-white/5">
            Cancel
          </button>
        </div>
      </div>

      {/* Live preview + stats */}
      <div className="flex flex-col gap-4 xl:sticky xl:top-4 xl:self-start">
        <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-white/10 bg-black/80 p-6">
          <BroadcastCard design={d} onButton={() => {}} onClose={() => {}} />
        </div>
        {stats && (
          <div className="grid grid-cols-4 gap-2">
            {[
              ["Viewed", stats.views],
              ["Clicked", stats.clicks],
              ["Closed", stats.closes],
              ["Click rate", `${Math.round(stats.clickRate * 100)}%`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-white/10 p-3">
                <div className="text-[11px] text-white/45">{label}</div>
                <div className="text-lg font-semibold text-white tabular-nums">{value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
