"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Loader2, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { updateHomeSection } from "@/features/home-sections/api";
import { HomeSectionView } from "@/features/home-sections/components/HomeSections";
import {
  AUDIENCE_LABELS,
  HEADER_ALIGNS,
  HOME_SECTION_TYPES,
  HOME_SECTION_TYPE_LABELS,
  HomeSectionLimits as L,
  SECTION_AUDIENCES,
  TITLE_COLORS,
  blankBody,
  type AdminHomeSection,
  type HomeSectionBody,
  type PublicHomeSectionBody,
} from "@/features/home-sections/types";
import { Field, Segmented, TextArea, TextInput, isoToLocalInput, localInputToIso } from "./fields";
import { MediaBodyEditor } from "./body-editors/MediaBodyEditor";
import { TemplatesBodyEditor, usePublishedTemplates } from "./body-editors/TemplatesBodyEditor";
import { CardsBodyEditor } from "./body-editors/CardsBodyEditor";
import { HeroBodyEditor } from "./body-editors/HeroBodyEditor";
import { ShowcaseBodyEditor } from "./body-editors/ShowcaseBodyEditor";
import { ToolsBodyEditor } from "./body-editors/ToolsBodyEditor";
import { AnnouncementBodyEditor } from "./body-editors/AnnouncementBodyEditor";
import { ModelsBodyEditor } from "./body-editors/ModelsBodyEditor";
import { RecentBodyEditor } from "./body-editors/RecentBodyEditor";
import { UpgradeBodyEditor } from "./body-editors/UpgradeBodyEditor";

type Draft = Omit<AdminHomeSection, "id" | "sortOrder" | "presetId">;

const AUDIENCE_HINT: Record<string, string> = {
  all: "Everyone who opens the home page.",
  guests: "Only people who aren't signed in.",
  signed_in: "Anyone signed in, with or without a plan.",
  no_plan: "Signed in, without a paid plan (good for upgrade banners).",
  paid: "Signed in with a paid plan.",
};

const toDraft = (s: AdminHomeSection): Draft => ({
  name: s.name,
  audience: s.audience ?? "all",
  isActive: s.isActive,
  startsAt: s.startsAt,
  expiresAt: s.expiresAt,
  header: s.header,
  body: s.body,
});

function BodyEditor({ body, onChange }: { body: HomeSectionBody; onChange: (b: HomeSectionBody) => void }) {
  switch (body.type) {
    case "media":
      return <MediaBodyEditor body={body} onChange={onChange} />;
    case "templates":
      return <TemplatesBodyEditor body={body} onChange={onChange} />;
    case "cards":
      return <CardsBodyEditor body={body} onChange={onChange} />;
    case "hero":
      return <HeroBodyEditor body={body} onChange={onChange} />;
    case "showcase":
      return <ShowcaseBodyEditor body={body} onChange={onChange} />;
    case "tools":
      return <ToolsBodyEditor body={body} onChange={onChange} />;
    case "announcement":
      return <AnnouncementBodyEditor body={body} onChange={onChange} />;
    case "models":
      return <ModelsBodyEditor body={body} onChange={onChange} />;
    case "recent":
      return <RecentBodyEditor body={body} onChange={onChange} />;
    case "upgrade":
      return <UpgradeBodyEditor body={body} onChange={onChange} />;
  }
}

/** Everything about one section, saved together; with a live preview of how it will look. */
export function HomeSectionForm({ section, onSaved }: { section: AdminHomeSection; onSaved: () => void }) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(section));
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const { data: templates = [] } = usePublishedTemplates();

  // Fresh data from the server replaces the draft (e.g. after saving).
  useEffect(() => {
    setDraft(toDraft(section));
  }, [section]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(toDraft(section));
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  const changeType = (type: HomeSectionBody["type"]) => {
    if (type === draft.body.type) return;
    if (!confirm("Switching the type replaces this section's content. Continue?")) return;
    set({ body: blankBody(type) });
  };

  // The preview gets the body the way users get it (templates filled in).
  const previewBody = useMemo<PublicHomeSectionBody>(() => {
    if (draft.body.type !== "templates") return draft.body;
    const byId = new Map(templates.map((t) => [t.id, t]));
    return {
      type: "templates",
      columns: draft.body.columns,
      templates: draft.body.templateIds.flatMap((id) => byId.get(id) ?? []),
      link: draft.body.link ?? null,
    };
  }, [draft.body, templates]);

  const save = async () => {
    setSaving(true);
    try {
      await updateHomeSection(section.id, draft);
      toast.success("Section saved");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save the section");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* General */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Name (admin only)">
          <TextInput value={draft.name} onChange={(name) => set({ name })} maxLength={L.maxNameLength} />
        </Field>
        <Field label="Show from (optional)" hint="Your local time; empty = right away">
          <TextInput
            type="datetime-local"
            value={isoToLocalInput(draft.startsAt)}
            onChange={(v) => set({ startsAt: localInputToIso(v) })}
          />
        </Field>
        <Field label="Hide after (optional)" hint="Empty = never expires">
          <TextInput
            type="datetime-local"
            value={isoToLocalInput(draft.expiresAt)}
            onChange={(v) => set({ expiresAt: localInputToIso(v) })}
          />
        </Field>
      </div>

      <Field label="Who sees it" hint={AUDIENCE_HINT[draft.audience]}>
        <Segmented
          options={SECTION_AUDIENCES}
          value={draft.audience}
          onChange={(audience) => set({ audience })}
          label={(a) => AUDIENCE_LABELS[a]}
        />
      </Field>

      {/* Header */}
      <fieldset className="flex flex-col gap-3 rounded-xl border border-white/10 p-4">
        <legend className="px-1 text-xs font-semibold text-white/70">Header</legend>
        <Field label="Position">
          <Segmented
            options={HEADER_ALIGNS}
            value={draft.header.align}
            onChange={(align) => set({ header: { ...draft.header, align } })}
            label={(a) => (a === "none" ? "No header" : a)}
          />
        </Field>
        {draft.header.align !== "none" && (
          <>
            <Field label="Title">
              <TextInput
                value={draft.header.title}
                onChange={(title) => set({ header: { ...draft.header, title } })}
                maxLength={L.maxTitleLength}
              />
            </Field>
            <Field label="Title color">
              <Segmented
                options={TITLE_COLORS}
                value={draft.header.titleColor ?? "white"}
                onChange={(titleColor) => set({ header: { ...draft.header, titleColor } })}
              />
            </Field>
            <Field label="Description (optional)">
              <TextArea
                value={draft.header.description}
                onChange={(description) => set({ header: { ...draft.header, description } })}
                maxLength={L.maxDescriptionLength}
                rows={2}
              />
            </Field>
          </>
        )}
      </fieldset>

      {/* Body */}
      <fieldset className="flex flex-col gap-3 rounded-xl border border-white/10 p-4">
        <legend className="px-1 text-xs font-semibold text-white/70">Body</legend>
        <Field label="Type">
          <Segmented
            options={HOME_SECTION_TYPES}
            value={draft.body.type}
            onChange={changeType}
            label={(t) => HOME_SECTION_TYPE_LABELS[t]}
          />
        </Field>
        <BodyEditor body={draft.body} onChange={(body) => set({ body })} />
      </fieldset>

      {/* Preview */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setShowPreview((v) => !v)}
          className="flex items-center gap-1.5 self-start text-xs text-white/50 hover:text-white"
        >
          {showPreview ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          {showPreview ? "Hide preview" : "Show preview"}
        </button>
        {showPreview && (
          <div className="rounded-xl border border-dashed border-white/15 bg-black/40 p-4 sm:p-6">
            <HomeSectionView section={{ header: draft.header, body: previewBody }} />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        {dirty && <span className="mr-auto text-xs text-amber-400">Unsaved changes</span>}
        <button
          type="button"
          onClick={() => setDraft(toDraft(section))}
          disabled={!dirty || saving}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70 hover:text-white disabled:opacity-40"
        >
          <RotateCcw className="size-3.5" /> Discard
        </button>
        <button
          type="button"
          onClick={save}
          disabled={!dirty || saving}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-40"
        >
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          Save
        </button>
      </div>
    </div>
  );
}
