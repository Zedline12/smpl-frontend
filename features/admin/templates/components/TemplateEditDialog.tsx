"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Template } from "@/features/templates/types";
import { updateTemplate, uploadTemplateFile } from "@/features/templates/api";
import { TemplateMedia } from "@/features/templates/components/TemplateMedia";

type Kind = "images" | "videos";

const move = (list: string[], i: number, dir: -1 | 1) => {
  const next = [...list];
  const j = i + dir;
  if (j < 0 || j >= next.length) return next;
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};

/** One list (images or videos): reorder, remove, add by URL or upload. */
function MediaListEditor({
  kind,
  items,
  onChange,
  hint,
}: {
  kind: Kind;
  items: string[];
  onChange: (next: string[]) => void;
  hint: string;
}) {
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const accept = kind === "images" ? "image/*" : "video/*";

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      onChange([...items, await uploadTemplateFile(file)]);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div>
        <p className="text-sm font-medium capitalize">{kind}</p>
        <p className="text-[11px] text-white/40">{hint}</p>
      </div>
      {items.map((item, i) => (
        <div key={item + i} className="flex items-center gap-2 rounded-lg border border-white/10 p-1.5">
          <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded bg-black">
            {kind === "images" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item} alt="" className="h-full w-full object-cover" />
            ) : (
              <video src={item} muted preload="metadata" className="h-full w-full object-cover" />
            )}
          </div>
          <span className="min-w-0 flex-1 truncate text-[11px] text-white/50">
            {kind === "videos" && items.length >= 2 && i < 2 ? (i === 0 ? "Before · " : "After · ") : ""}
            {item}
          </span>
          <button type="button" title="Move up" disabled={i === 0} onClick={() => onChange(move(items, i, -1))} className="rounded p-1 text-white/60 hover:bg-white/10 disabled:opacity-30">
            <ArrowUp className="size-3.5" />
          </button>
          <button type="button" title="Move down" disabled={i === items.length - 1} onClick={() => onChange(move(items, i, 1))} className="rounded p-1 text-white/60 hover:bg-white/10 disabled:opacity-30">
            <ArrowDown className="size-3.5" />
          </button>
          <button type="button" title="Remove" onClick={() => onChange(items.filter((_, j) => j !== i))} className="rounded p-1 text-red-400 hover:bg-white/10">
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-transparent px-2.5 py-1.5 text-xs"
        />
        <button
          type="button"
          disabled={!/^https?:\/\//i.test(url.trim())}
          onClick={() => {
            onChange([...items, url.trim()]);
            setUrl("");
          }}
          className="flex items-center gap-1 rounded-lg border border-white/15 px-2.5 text-xs hover:bg-white/5 disabled:opacity-40"
        >
          <Plus className="size-3.5" /> Add
        </button>
        <label className="flex cursor-pointer items-center gap-1 rounded-lg border border-white/15 px-2.5 text-xs hover:bg-white/5">
          {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
          Upload
          <input type="file" accept={accept} className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
        </label>
      </div>
    </div>
  );
}

/** Admin: edit a template's images and videos (with a live preview). */
export function TemplateEditDialog({
  template,
  onClose,
  onSaved,
}: {
  template: Template;
  onClose: () => void;
  onSaved: (t: Template) => void;
}) {
  const [images, setImages] = useState(template.images);
  const [videos, setVideos] = useState(template.videos);
  const [saving, setSaving] = useState(false);
  const empty = images.length + videos.length === 0;

  const save = async () => {
    setSaving(true);
    try {
      onSaved(await updateTemplate(template.id, { images, videos }));
      toast.success("Template saved");
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && !saving && onClose()}>
      <DialogContent className="bg-card border-border max-h-[90vh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-2xl border sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit template media</DialogTitle>
          <DialogDescription>
            Two or more videos play as a before/after loop (first = before, second = after). Images play as a photo
            gallery.
          </DialogDescription>
        </DialogHeader>
        <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10">
          <TemplateMedia template={{ images, videos }} />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <MediaListEditor kind="videos" items={videos} onChange={setVideos} hint="Before/after pairs, or one video" />
          <MediaListEditor kind="images" items={images} onChange={setImages} hint="Photos, shown in this order" />
        </div>
        {empty && <p className="text-xs text-red-400">A template needs at least one image or video.</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={saving} className="rounded-lg border border-white/15 px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving || empty}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
          >
            {saving && <Loader2 className="size-4 animate-spin" />} Save
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
