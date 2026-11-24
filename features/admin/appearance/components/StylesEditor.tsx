"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Eye,
  EyeOff,
  Film,
  ImageIcon,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { MediaManagerDialog } from "@/features/generation/components/prompt/MediaManagerDialog";
import {
  type AdminStyle,
  createStyle,
  deleteStyle,
  fetchAdminStyles,
  reorderStyles,
  updateStyle,
} from "@/features/styles/api";

const ADMIN_KEY = ["styles", "admin"];

type Draft = Pick<AdminStyle, "name" | "prompt" | "videoUrl" | "isActive"> & { imageUrl: string };

function StyleRow({
  style,
  isFirst,
  isLast,
  onMove,
  onSaved,
}: {
  style: AdminStyle;
  isFirst: boolean;
  isLast: boolean;
  onMove: (dir: -1 | 1) => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<Draft>({
    name: style.name,
    prompt: style.prompt,
    videoUrl: style.videoUrl,
    imageUrl: style.imageUrl ?? "",
    isActive: style.isActive,
  });
  const [showPrompt, setShowPrompt] = useState(false);
  const [picker, setPicker] = useState<"video" | "image" | null>(null);
  const [saving, setSaving] = useState(false);

  // Fresh data from the server replaces the draft (e.g. after saving).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft({ name: style.name, prompt: style.prompt, videoUrl: style.videoUrl, imageUrl: style.imageUrl ?? "", isActive: style.isActive });
  }, [style.name, style.prompt, style.videoUrl, style.imageUrl, style.isActive]);

  const dirty =
    draft.name !== style.name ||
    draft.prompt !== style.prompt ||
    draft.videoUrl !== style.videoUrl ||
    draft.imageUrl !== (style.imageUrl ?? "") ||
    draft.isActive !== style.isActive;

  const save = async (next: Partial<Draft> = {}) => {
    const body = { ...draft, ...next };
    if (!body.name.trim()) {
      toast.error("The name can't be empty");
      return;
    }
    setSaving(true);
    try {
      await updateStyle(style.id, body);
      toast.success(`Saved "${body.name}"`);
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Hide "${style.name}"? Users won't see it anymore; past generations keep it.`)) return;
    try {
      await deleteStyle(style.id);
      toast.success(`"${style.name}" hidden`);
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't delete");
    }
  };

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border p-3 sm:flex-row ${
        draft.isActive ? "border-white/10 bg-white/[0.03]" : "border-white/5 bg-white/[0.01] opacity-70"
      }`}
    >
      {/* Thumbnail: a looping video or a still image */}
      <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg bg-black sm:w-56">
        {draft.videoUrl ? (
          <video key={draft.videoUrl} src={draft.videoUrl} autoPlay muted loop playsInline className="h-full w-full object-cover" />
        ) : draft.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img loading="lazy" decoding="async" key={draft.imageUrl} src={draft.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-white/30">No video or image yet</div>
        )}
        <div className="absolute bottom-2 left-2 flex gap-1.5">
          <button
            type="button"
            onClick={() => setPicker("video")}
            className="flex items-center gap-1.5 rounded-md bg-black/70 px-2 py-1 text-[11px] font-medium text-white backdrop-blur hover:bg-black/90"
          >
            <Film className="size-3.5" /> {draft.videoUrl ? "Change video" : "Video"}
          </button>
          <button
            type="button"
            onClick={() => setPicker("image")}
            className="flex items-center gap-1.5 rounded-md bg-black/70 px-2 py-1 text-[11px] font-medium text-white backdrop-blur hover:bg-black/90"
          >
            <ImageIcon className="size-3.5" /> {draft.imageUrl ? "Change image" : "Image"}
          </button>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center gap-2">
          <input
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            maxLength={80}
            aria-label="Style name"
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500/50 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setDraft((d) => ({ ...d, isActive: !d.isActive }))}
            title={draft.isActive ? "Shown to users" : "Hidden from users"}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-2 text-xs text-white/70 hover:text-white"
          >
            {draft.isActive ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
            {draft.isActive ? "Active" : "Hidden"}
          </button>
        </div>

        <p className="truncate text-[11px] text-white/35">
          slug: {style.slug}
          {draft.videoUrl || draft.imageUrl ? ` · ${draft.videoUrl || draft.imageUrl}` : ""}
        </p>

        <button
          type="button"
          onClick={() => setShowPrompt((v) => !v)}
          className="flex w-fit items-center gap-1 text-xs text-white/50 hover:text-white"
        >
          <ChevronDown className={`size-3.5 transition-transform ${showPrompt ? "rotate-180" : ""}`} />
          Hidden prompt
        </button>
        {showPrompt && (
          <textarea
            value={draft.prompt}
            onChange={(e) => setDraft((d) => ({ ...d, prompt: e.target.value }))}
            rows={5}
            maxLength={3000}
            className="w-full resize-y rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs leading-relaxed text-white/85 focus:border-blue-500/50 focus:outline-none"
          />
        )}

        <div className="mt-auto flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={isFirst}
            aria-label="Move up"
            className="rounded-md p-1.5 text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-30"
          >
            <ArrowUp className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={isLast}
            aria-label="Move down"
            className="rounded-md p-1.5 text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-30"
          >
            <ArrowDown className="size-4" />
          </button>
          <div className="ml-auto flex items-center gap-2">
            {dirty && <span className="text-xs text-amber-400">Unsaved</span>}
            <button
              type="button"
              onClick={remove}
              aria-label="Hide style"
              className="rounded-md p-1.5 text-white/40 hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => save()}
              disabled={!dirty || saving}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-40"
            >
              {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
              Save
            </button>
          </div>
        </div>
      </div>

      <MediaManagerDialog
        key={picker ?? "closed"}
        open={picker !== null}
        onOpenChange={(open) => !open && setPicker(null)}
        mediaType={picker ?? "video"}
        maxSelections={1}
        selectedImage={(picker === "image" ? draft.imageUrl : draft.videoUrl) || undefined}
        onSelect={(urls) => {
          const kind = picker;
          setPicker(null);
          // Saved right away (the name/prompt drafts go with it); a style has a video or an image, not both.
          if (!urls[0]) return;
          void save(kind === "image" ? { imageUrl: urls[0], videoUrl: "" } : { videoUrl: urls[0], imageUrl: "" });
        }}
      />
    </div>
  );
}

/** App Appearance → Styles: names, looping thumbnail videos, hidden prompts and order. */
export function StylesEditor() {
  const queryClient = useQueryClient();
  const { data: styles, isLoading, isError } = useQuery({ queryKey: ADMIN_KEY, queryFn: fetchAdminStyles });
  const [adding, setAdding] = useState(false);

  // The admin list and the users' list both change.
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["styles"] });

  const move = async (index: number, dir: -1 | 1) => {
    if (!styles) return;
    const ids = styles.map((s) => s.id);
    const target = index + dir;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    try {
      await reorderStyles(ids);
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't reorder");
    }
  };

  const add = async () => {
    const name = window.prompt("Name of the new style");
    if (!name?.trim()) return;
    setAdding(true);
    try {
      await createStyle({ name: name.trim() });
      toast.success("Style added. Add its video and hidden prompt, then save.");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't add the style");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Styles</h2>
          <p className="text-sm text-white/40">
            Shown in the Styles tab and the Create sidebar. The hidden prompt is added to users&apos; prompts
            and is never shown to them.
          </p>
        </div>
        <button
          type="button"
          onClick={add}
          disabled={adding}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-60"
        >
          {adding ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          Add style
        </button>
      </div>

      {isError ? (
        <p className="text-sm text-red-400">Couldn&apos;t load styles.</p>
      ) : isLoading || !styles ? (
        <div className="flex items-center gap-2 text-sm text-white/50">
          <Loader2 className="size-4 animate-spin" /> Loading styles…
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {styles.map((style, i) => (
            <StyleRow
              key={style.id}
              style={style}
              isFirst={i === 0}
              isLast={i === styles.length - 1}
              onMove={(dir) => move(i, dir)}
              onSaved={refresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}
