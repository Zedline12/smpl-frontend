"use client";

import { useEffect, useState } from "react";
import { ChevronUp, ChevronDown, Plus, Trash2, Save, Film, Eye, EyeOff } from "lucide-react";
import { MediaManagerDialog } from "@/features/generation/components/prompt/MediaManagerDialog";
import {
  IMAGE_MODELS,
  VIDEO_MODELS,
  AUDIO_MODELS,
  STUDIO_MODELS,
} from "@/features/generation/enums/models.enum";

// ─── types ────────────────────────────────────────────────────────────────────

interface SectionMedia {
  src: string;
  alt: string;
}

interface HomepageSection {
  id: string;
  modelId: string;
  title: string;
  description: string;
  visible: boolean;
  media: SectionMedia[];
}

// ─── all models ───────────────────────────────────────────────────────────────

const ALL_MODELS = [...VIDEO_MODELS, ...IMAGE_MODELS, ...AUDIO_MODELS, ...STUDIO_MODELS];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function blankSection(): HomepageSection {
  return {
    id: uid(),
    modelId: ALL_MODELS[0]?.id ?? "",
    title: "",
    description: "",
    visible: true,
    media: [],
  };
}

// ─── SectionCard ─────────────────────────────────────────────────────────────

function SectionCard({
  section,
  index,
  total,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  section: HomepageSection;
  index: number;
  total: number;
  onChange: (s: HomepageSection) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [mediaDlg, setMediaDlg] = useState<number | null>(null);

  const set = (patch: Partial<HomepageSection>) => onChange({ ...section, ...patch });

  const setMedia = (i: number, patch: Partial<SectionMedia>) =>
    set({ media: section.media.map((m, idx) => (idx === i ? { ...m, ...patch } : m)) });

  const addMedia = () => set({ media: [...section.media, { src: "", alt: "" }] });
  const removeMedia = (i: number) => set({ media: section.media.filter((_, idx) => idx !== i) });

  const modelName = ALL_MODELS.find((m) => m.id === section.modelId)?.name ?? section.modelId;

  return (
    <div
      className={`rounded-xl border p-5 flex flex-col gap-4 transition-colors ${
        section.visible ? "border-white/10 bg-white/[0.03]" : "border-white/5 bg-white/[0.01] opacity-60"
      }`}
    >
      {/* header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-white/40">
          Section {index + 1} · {modelName}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => set({ visible: !section.visible })}
            className="p-1.5 rounded text-white/40 hover:text-white hover:bg-white/5 transition-colors"
            title={section.visible ? "Hide section" : "Show section"}
          >
            {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button type="button" onClick={onMoveUp} disabled={index === 0}
            className="p-1.5 rounded text-white/40 hover:text-white disabled:opacity-25 hover:bg-white/5 transition-colors">
            <ChevronUp className="w-4 h-4" />
          </button>
          <button type="button" onClick={onMoveDown} disabled={index === total - 1}
            className="p-1.5 rounded text-white/40 hover:text-white disabled:opacity-25 hover:bg-white/5 transition-colors">
            <ChevronDown className="w-4 h-4" />
          </button>
          <button type="button" onClick={onRemove}
            className="p-1.5 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors ml-1">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* model select + title */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-white/40 uppercase tracking-wider">Model</label>
          <select
            value={section.modelId}
            onChange={(e) => set({ modelId: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
          >
            {ALL_MODELS.map((m) => (
              <option key={m.id} value={m.id} className="bg-[#0a0a0a]">
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-white/40 uppercase tracking-wider">Title</label>
          <input
            value={section.title}
            onChange={(e) => set({ title: e.target.value })}
            placeholder="Gensu"
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-blue-500/50"
          />
        </div>
      </div>

      {/* description */}
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-white/40 uppercase tracking-wider">Description</label>
        <textarea
          value={section.description}
          onChange={(e) => set({ description: e.target.value })}
          rows={2}
          placeholder="Short description shown below the title on the homepage…"
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-blue-500/50 resize-none"
        />
      </div>

      {/* media */}
      <div className="flex flex-col gap-2">
        <p className="text-[11px] text-white/40 uppercase tracking-wider">
          Media ({section.media.length})
        </p>
        {section.media.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={item.src}
              onChange={(e) => setMedia(i, { src: e.target.value })}
              placeholder="https://…/video.mp4 or image.jpg"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-blue-500/50"
            />
            <input
              value={item.alt}
              onChange={(e) => setMedia(i, { alt: e.target.value })}
              placeholder="Alt text"
              className="w-32 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-blue-500/50"
            />
            <button
              type="button"
              onClick={() => setMediaDlg(i)}
              className="p-2 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/25 transition-colors flex-shrink-0"
              title="Pick from media manager"
            >
              <Film className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => removeMedia(i)}
              className="p-2 rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addMedia}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors self-start"
        >
          <Plus className="w-3.5 h-3.5" />
          Add media
        </button>
      </div>

      {mediaDlg !== null && (
        <MediaManagerDialog
          open
          onOpenChange={(o) => !o && setMediaDlg(null)}
          mediaType="video"
          maxSelections={1}
          onSelect={(urls) => {
            if (urls[0]) setMedia(mediaDlg, { src: urls[0] });
            setMediaDlg(null);
          }}
        />
      )}
    </div>
  );
}

// ─── HomepageSectionsEditor ───────────────────────────────────────────────────

export function HomepageSectionsEditor() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/appearance/homepage")
      .then((r) => r.json())
      .then((d) => setSections(d.sections ?? []));
  }, []);

  const update = (next: HomepageSection[]) => {
    setSections(next);
    setDirty(true);
  };

  const addSection = () => update([...sections, blankSection()]);

  const updateSection = (i: number, s: HomepageSection) =>
    update(sections.map((sec, idx) => (idx === i ? s : sec)));

  const removeSection = (i: number) =>
    update(sections.filter((_, idx) => idx !== i));

  const moveSection = (i: number, dir: -1 | 1) => {
    const next = [...sections];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    update(next);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/appearance/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections }),
      });
      if (res.ok) {
        setDirty(false);
        setSaveMsg("Saved!");
        setTimeout(() => setSaveMsg(null), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Homepage Sections</h1>
          <p className="text-sm text-white/40 mt-1">
            Each section shows a model's name, description, and media on the homepage.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {dirty && <span className="text-xs text-amber-400">Unsaved changes</span>}
          {saveMsg && <span className="text-xs text-green-400">{saveMsg}</span>}
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {sections.length === 0 && (
        <div className="text-center py-16 text-white/30 text-sm border border-dashed border-white/10 rounded-xl">
          No sections yet. Add one below to configure the homepage.
        </div>
      )}

      <div className="flex flex-col gap-4">
        {sections.map((sec, i) => (
          <SectionCard
            key={sec.id}
            section={sec}
            index={i}
            total={sections.length}
            onChange={(s) => updateSection(i, s)}
            onRemove={() => removeSection(i)}
            onMoveUp={() => moveSection(i, -1)}
            onMoveDown={() => moveSection(i, 1)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addSection}
        className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/15 text-white/40 hover:text-white hover:border-white/30 transition-colors self-start text-sm"
      >
        <Plus className="w-4 h-4" />
        Add section
      </button>
    </div>
  );
}
