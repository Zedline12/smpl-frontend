"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  Plus,
  Trash2,
  Save,
  Film,
} from "lucide-react";
import { MediaManagerDialog } from "@/features/generation/components/prompt/MediaManagerDialog";
import {
  AiModelsEnum,
  IMAGE_MODELS,
  VIDEO_MODELS,
  AUDIO_MODELS,
  STUDIO_MODELS,
} from "@/features/generation/enums/models.enum";

// ─── types ────────────────────────────────────────────────────────────────────

interface MediaItem {
  src: string;
  label: string;
  highlight: boolean;
}

interface Slide {
  eyebrow: string;
  title: string;
  description: string;
  layout: "single" | "beforeAfter" | "grid";
  thumbnail: string;
  media: MediaItem[];
}

interface HowItWorksConfig {
  models: Partial<Record<string, Slide[]>>;
}

// ─── all models flat list ─────────────────────────────────────────────────────

const ALL_MODELS = [
  ...VIDEO_MODELS,
  ...IMAGE_MODELS,
  ...AUDIO_MODELS,
  ...STUDIO_MODELS,
];

// ─── helpers ─────────────────────────────────────────────────────────────────

function blankSlide(): Slide {
  return {
    eyebrow: "",
    title: "",
    description: "",
    layout: "single",
    thumbnail: "",
    media: [{ src: "", label: "", highlight: false }],
  };
}

function blankMediaItem(): MediaItem {
  return { src: "", label: "", highlight: false };
}

// ─── SlideCard ───────────────────────────────────────────────────────────────

function SlideCard({
  slide,
  index,
  total,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  slide: Slide;
  index: number;
  total: number;
  onChange: (s: Slide) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [mediaDlgIndex, setMediaDlgIndex] = useState<number | null>(null);

  const set = (patch: Partial<Slide>) => onChange({ ...slide, ...patch });

  const setMedia = (i: number, patch: Partial<MediaItem>) => {
    const updated = slide.media.map((m, idx) => (idx === i ? { ...m, ...patch } : m));
    set({ media: updated });
  };

  const addMedia = () => set({ media: [...slide.media, blankMediaItem()] });

  const removeMedia = (i: number) =>
    set({ media: slide.media.filter((_, idx) => idx !== i) });

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 flex flex-col gap-4">
      {/* slide header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-white/40">
          Slide {index + 1}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1.5 rounded text-white/40 hover:text-white disabled:opacity-25 hover:bg-white/5 transition-colors"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="p-1.5 rounded text-white/40 hover:text-white disabled:opacity-25 hover:bg-white/5 transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors ml-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* layout selector */}
      <div className="flex gap-2">
        {(["single", "beforeAfter", "grid"] as const).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => set({ layout: l })}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
              slide.layout === l
                ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
                : "border-white/10 text-white/50 hover:text-white hover:border-white/25"
            }`}
          >
            {l === "single" ? "Single" : l === "beforeAfter" ? "Before/After" : "Grid (4)"}
          </button>
        ))}
      </div>

      {/* text fields */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-white/40 uppercase tracking-wider">Eyebrow</label>
          <input
            value={slide.eyebrow}
            onChange={(e) => set({ eyebrow: e.target.value })}
            placeholder="THE IDEA"
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-white/40 uppercase tracking-wider">Title</label>
          <input
            value={slide.title}
            onChange={(e) => set({ title: e.target.value })}
            placeholder="ONE VIDEO, MANY VERSIONS"
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-blue-500/50"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-white/40 uppercase tracking-wider">Description</label>
        <textarea
          value={slide.description}
          onChange={(e) => set({ description: e.target.value })}
          rows={2}
          placeholder="Upload any video and remake it…"
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-blue-500/50 resize-none"
        />
      </div>

      {/* media items */}
      <div className="flex flex-col gap-2">
        <p className="text-[11px] text-white/40 uppercase tracking-wider">Media</p>
        {slide.media.map((item, i) => (
          <div key={i} className="rounded-lg border border-white/8 bg-white/[0.02] p-3 flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <div className="flex-1 flex flex-col gap-1">
                <input
                  value={item.src}
                  onChange={(e) => setMedia(i, { src: e.target.value })}
                  placeholder="https://pub-…/video.mp4"
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-blue-500/50 w-full"
                />
              </div>
              <button
                type="button"
                onClick={() => setMediaDlgIndex(i)}
                className="flex items-center gap-1 px-2 py-2 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/25 text-xs transition-colors flex-shrink-0"
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
            <div className="flex items-center gap-3">
              <input
                value={item.label}
                onChange={(e) => setMedia(i, { label: e.target.value })}
                placeholder="Label (optional)"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-blue-500/50"
              />
              <label className="flex items-center gap-1.5 text-xs text-white/50 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={item.highlight}
                  onChange={(e) => setMedia(i, { highlight: e.target.checked })}
                  className="accent-blue-500"
                />
                Highlight
              </label>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addMedia}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors self-start"
        >
          <Plus className="w-3.5 h-3.5" />
          Add media item
        </button>
      </div>

      {mediaDlgIndex !== null && (
        <MediaManagerDialog
          open
          onOpenChange={(o) => !o && setMediaDlgIndex(null)}
          mediaType="video"
          maxSelections={1}
          onSelect={(urls) => {
            if (urls[0]) setMedia(mediaDlgIndex, { src: urls[0] });
            setMediaDlgIndex(null);
          }}
        />
      )}
    </div>
  );
}

// ─── HowItWorksEditor ────────────────────────────────────────────────────────

export function HowItWorksEditor() {
  const [config, setConfig] = useState<HowItWorksConfig>({ models: {} });
  const [selectedModel, setSelectedModel] = useState<string>(
    AiModelsEnum.SMPL_GENSU
  );
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/appearance/how-it-works")
      .then((r) => r.json())
      .then((d) => setConfig(d));
  }, []);

  const slides: Slide[] = config.models[selectedModel] ?? [];

  const updateSlides = useCallback(
    (next: Slide[]) => {
      setConfig((c) => ({ models: { ...c.models, [selectedModel]: next } }));
      setDirty(true);
    },
    [selectedModel]
  );

  const addSlide = () => updateSlides([...slides, blankSlide()]);

  const updateSlide = (i: number, s: Slide) =>
    updateSlides(slides.map((sl, idx) => (idx === i ? s : sl)));

  const removeSlide = (i: number) =>
    updateSlides(slides.filter((_, idx) => idx !== i));

  const moveSlide = (i: number, dir: -1 | 1) => {
    const next = [...slides];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    updateSlides(next);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/appearance/how-it-works", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
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

  const modelName = ALL_MODELS.find((m) => m.id === selectedModel)?.name ?? selectedModel;

  return (
    <div className="flex gap-6 h-full">
      {/* left: model list */}
      <aside className="w-56 flex-shrink-0 flex flex-col gap-1">
        <p className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2">
          Models
        </p>
        {ALL_MODELS.map((m) => {
          const count = config.models[m.id]?.length ?? 0;
          const isActive = selectedModel === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedModel(m.id)}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                isActive
                  ? "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="truncate">{m.name}</span>
              <span
                className={`text-[10px] font-bold ml-2 flex-shrink-0 ${
                  count > 0 ? "text-blue-400" : "text-white/20"
                }`}
              >
                {count > 0 ? `${count}` : "—"}
              </span>
            </button>
          );
        })}
      </aside>

      {/* right: slides editor */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{modelName}</h2>
            <p className="text-sm text-white/40">
              {slides.length} slide{slides.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {dirty && (
              <span className="text-xs text-amber-400">Unsaved changes</span>
            )}
            {saveMsg && (
              <span className="text-xs text-green-400">{saveMsg}</span>
            )}
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

        <div className="flex flex-col gap-4">
          {slides.map((slide, i) => (
            <SlideCard
              key={i}
              slide={slide}
              index={i}
              total={slides.length}
              onChange={(s) => updateSlide(i, s)}
              onRemove={() => removeSlide(i)}
              onMoveUp={() => moveSlide(i, -1)}
              onMoveDown={() => moveSlide(i, 1)}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={addSlide}
          className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/15 text-white/40 hover:text-white hover:border-white/30 transition-colors self-start text-sm"
        >
          <Plus className="w-4 h-4" />
          Add slide
        </button>
      </div>
    </div>
  );
}
