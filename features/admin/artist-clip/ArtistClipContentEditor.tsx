"use client";
import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Plus, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Field,
  ItemControls,
  MediaField,
  SmallButton,
  TextArea,
  TextInput,
} from "@/features/admin/appearance/components/home-sections/fields";

type Kind = "location" | "weather" | "time";
type Tab = Kind | "video";

interface AdminOption {
  id: string;
  kind: Kind;
  key: string;
  label: string;
  emoji: string;
  thumbnail: string;
  promptText: string;
  indoor: boolean;
  accent: string[];
  order: number;
  enabled: boolean;
}

interface AdminVideo {
  id: string;
  title: string;
  videoUrl: string;
  thumbnail: string;
  durationSec: number;
  location: string;
  weather: string;
  time: string;
  mood: string;
  order: number;
  enabled: boolean;
}

interface AdminData {
  options: AdminOption[];
  videos: AdminVideo[];
}

const KEY = ["admin", "artist-clip-scenes"];

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/admin/artist-clip-scenes${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error ?? "Request failed");
  return (json?.data ?? json) as T;
}

const TABS: { id: Tab; label: string }[] = [
  { id: "video", label: "Ready-made videos" },
  { id: "location", label: "Locations" },
  { id: "weather", label: "Weather" },
  { id: "time", label: "Times" },
];

const KIND_HINT: Record<Kind, string> = {
  location: "How the place is described to the image and video models, e.g. “a wide sandy beach with palm trees”.",
  weather: "The sky and weather, e.g. “steady rain falling, wet glistening surfaces”.",
  time: "The light, starting with the time, e.g. “at sunset, with warm golden-hour light”.",
};

const CARD = "rounded-2xl border border-white/[0.08] bg-[#161616] p-4";

/**
 * Catalog → Artist video clip: the Location / Weather / Time picks (both clip types) and
 * the ready-made Lyrics background videos.
 */
export function ArtistClipContentEditor() {
  const [tab, setTab] = useState<Tab>("video");
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: KEY, queryFn: () => api<AdminData>("") });
  const refresh = () => {
    void qc.invalidateQueries({ queryKey: KEY });
    void qc.invalidateQueries({ queryKey: ["artist-clip-scenes"] });
  };

  const reorder = useMutation({
    mutationFn: (body: { kind: Tab; ids: string[] }) =>
      api("/reorder", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/catalog" className="flex items-center gap-1 text-sm text-white/50 hover:text-white">
          <ArrowLeft className="size-4" /> Catalog
        </Link>
        <h1 className="text-xl font-semibold text-white">Artist video clip · content</h1>
      </div>
      <p className="max-w-2xl text-sm text-white/50">
        The places users pick from (used by Lip sync and Lyrics clips) and the ready-made videos for Lyrics
        clips. Changes show in the app within a minute.
      </p>

      <div className="flex flex-wrap gap-1 rounded-xl border border-white/[0.08] bg-black/30 p-1 self-start">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              tab === t.id ? "bg-white/10 text-white" : "text-white/55 hover:text-white",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-white/40">Loading…</p>}
      {error && <p className="text-sm text-red-300">{(error as Error).message}</p>}

      {data && tab === "video" && (
        <VideoList
          videos={data.videos}
          onChange={refresh}
          onReorder={(ids) => reorder.mutate({ kind: "video", ids })}
        />
      )}
      {data && tab !== "video" && (
        <OptionList
          kind={tab}
          options={data.options.filter((o) => o.kind === tab)}
          onChange={refresh}
          onReorder={(ids) => reorder.mutate({ kind: tab, ids })}
        />
      )}
    </div>
  );
}

function move<T extends { id: string }>(list: T[], i: number, dir: -1 | 1): string[] {
  const ids = list.map((x) => x.id);
  const j = i + dir;
  if (j < 0 || j >= ids.length) return ids;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  return ids;
}

// ---- Picks ----

type OptionDraft = Omit<AdminOption, "id" | "order" | "kind">;

const emptyOption = (): OptionDraft => ({
  key: "",
  label: "",
  emoji: "",
  thumbnail: "",
  promptText: "",
  indoor: false,
  accent: ["#6366f1", "#0f172a"],
  enabled: true,
});

function OptionList({
  kind,
  options,
  onChange,
  onReorder,
}: {
  kind: Kind;
  options: AdminOption[];
  onChange: () => void;
  onReorder: (ids: string[]) => void;
}) {
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const remove = useMutation({
    mutationFn: (id: string) => api<{ disabled?: boolean }>(`/options/${id}`, { method: "DELETE" }),
    onSuccess: (r) => {
      toast.success(r.disabled ? "Built-in pick hidden (it can be shown again)" : "Deleted");
      onChange();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="flex flex-col gap-3">
      {editing === "new" ? (
        <OptionForm kind={kind} onDone={() => { setEditing(null); onChange(); }} />
      ) : (
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="flex items-center gap-1.5 self-start rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/15"
        >
          <Plus className="size-4" /> Add {kind}
        </button>
      )}
      <div className="grid gap-3 lg:grid-cols-2">
        {options.map((o, i) =>
          editing === o.id ? (
            <div key={o.id} className="lg:col-span-2">
              <OptionForm kind={kind} option={o} onDone={() => { setEditing(null); onChange(); }} />
            </div>
          ) : (
            <div key={o.id} className={cn(CARD, "flex gap-4", !o.enabled && "opacity-50")}>
              <div
                className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-lg border border-white/10"
                style={o.thumbnail ? undefined : { background: `linear-gradient(135deg, ${o.accent[0]}, ${o.accent[1]})` }}
              >
                {o.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={o.thumbnail} alt="" className="absolute inset-0 size-full object-cover" />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-2xl">{o.emoji}</span>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="truncate font-semibold text-white">{o.label}</span>
                  <code className="text-[11px] text-white/35">{o.key}</code>
                  {!o.enabled && <span className="text-[11px] text-amber-300">Hidden</span>}
                </div>
                <p className="line-clamp-2 text-xs text-white/50">{o.promptText}</p>
                <div className="mt-auto flex flex-wrap gap-1">
                  <SmallButton onClick={() => setEditing(o.id)}>
                    <Pencil className="size-3.5" /> Edit
                  </SmallButton>
                  <ItemControls
                    index={i}
                    count={options.length}
                    onMove={(dir) => onReorder(move(options, i, dir))}
                    onRemove={() => {
                      if (confirm(`Remove "${o.label}"? Built-in picks are only hidden.`)) remove.mutate(o.id);
                    }}
                  />
                </div>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function OptionForm({ kind, option, onDone }: { kind: Kind; option?: AdminOption; onDone: () => void }) {
  const [d, setD] = useState<OptionDraft>(() => (option ? { ...option } : emptyOption()));
  const upd = <K extends keyof OptionDraft>(k: K, v: OptionDraft[K]) => setD((x) => ({ ...x, [k]: v }));
  const save = useMutation({
    mutationFn: () => {
      const { key, ...rest } = d;
      return option
        ? api(`/options/${option.id}`, { method: "PATCH", body: JSON.stringify(rest) })
        : api("/options", { method: "POST", body: JSON.stringify({ ...d, kind, key: key || undefined }) });
    },
    onSuccess: () => {
      toast.success("Saved");
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className={cn(CARD, "flex flex-col gap-4 border-white/20")}>
      <div className="grid gap-4 md:grid-cols-[1fr_1fr_6rem]">
        <Field label="Label" hint="What users see on the card.">
          <TextInput value={d.label} onChange={(v) => upd("label", v)} maxLength={40} />
        </Field>
        <Field label="Key" hint={option ? "Fixed once created." : "Optional: made from the label."}>
          {option ? (
            <code className="py-2 text-sm text-white/60">{d.key}</code>
          ) : (
            <TextInput value={d.key} onChange={(v) => upd("key", v)} maxLength={40} placeholder="e.g. night-club" />
          )}
        </Field>
        <Field label="Emoji">
          <TextInput value={d.emoji} onChange={(v) => upd("emoji", v)} maxLength={16} />
        </Field>
      </div>
      <Field label="Prompt text" hint={KIND_HINT[kind]}>
        <TextArea value={d.promptText} onChange={(v) => upd("promptText", v)} maxLength={600} rows={2} />
      </Field>
      <Field label="Photo (16:9)">
        <MediaField url={d.thumbnail} kind="image" kinds={["image"]} onChange={(url) => upd("thumbnail", url)} />
      </Field>
      <div className="flex flex-wrap items-center gap-5 text-sm text-white/70">
        {kind === "location" && (
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={d.indoor} onChange={(e) => upd("indoor", e.target.checked)} />
            Indoors (weather through the windows)
          </label>
        )}
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={d.enabled} onChange={(e) => upd("enabled", e.target.checked)} />
          Visible
        </label>
        <label className="flex items-center gap-2">
          Card colors
          <input type="color" value={d.accent[0]} onChange={(e) => upd("accent", [e.target.value, d.accent[1]])} />
          <input type="color" value={d.accent[1]} onChange={(e) => upd("accent", [d.accent[0], e.target.value])} />
        </label>
      </div>
      <FormButtons saving={save.isPending} onSave={() => save.mutate()} onCancel={onDone} />
    </div>
  );
}

// ---- Videos ----

type VideoDraft = Omit<AdminVideo, "id" | "order">;

const emptyVideo = (): VideoDraft => ({
  title: "",
  videoUrl: "",
  thumbnail: "",
  durationSec: 15,
  location: "",
  weather: "",
  time: "",
  mood: "",
  enabled: true,
});

function VideoList({
  videos,
  onChange,
  onReorder,
}: {
  videos: AdminVideo[];
  onChange: () => void;
  onReorder: (ids: string[]) => void;
}) {
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const remove = useMutation({
    mutationFn: (id: string) => api(`/videos/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Deleted");
      onChange();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="flex flex-col gap-3">
      {editing === "new" ? (
        <VideoForm onDone={() => { setEditing(null); onChange(); }} />
      ) : (
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="flex items-center gap-1.5 self-start rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/15"
        >
          <Plus className="size-4" /> Add video
        </button>
      )}
      {!videos.length && editing !== "new" && <p className="text-sm text-white/40">No videos yet.</p>}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {videos.map((v, i) =>
          editing === v.id ? (
            <div key={v.id} className="md:col-span-2 xl:col-span-3">
              <VideoForm video={v} onDone={() => { setEditing(null); onChange(); }} />
            </div>
          ) : (
            <div key={v.id} className={cn(CARD, "flex flex-col gap-3", !v.enabled && "opacity-50")}>
              <video
                src={v.videoUrl}
                poster={v.thumbnail || undefined}
                muted
                loop
                playsInline
                preload="metadata"
                onMouseEnter={(e) => void e.currentTarget.play().catch(() => {})}
                onMouseLeave={(e) => e.currentTarget.pause()}
                className="aspect-video w-full rounded-lg border border-white/10 bg-black object-cover"
              />
              <div className="flex items-center gap-2">
                <span className="truncate font-semibold text-white">{v.title}</span>
                <span className="text-[11px] text-white/35">{v.durationSec}s</span>
                {!v.enabled && <span className="text-[11px] text-amber-300">Hidden</span>}
              </div>
              <p className="truncate text-xs text-white/45 capitalize">
                {[v.location, v.weather, v.time, v.mood].filter(Boolean).join(" · ") || "No tags"}
              </p>
              <div className="flex flex-wrap gap-1">
                <SmallButton onClick={() => setEditing(v.id)}>
                  <Pencil className="size-3.5" /> Edit
                </SmallButton>
                <ItemControls
                  index={i}
                  count={videos.length}
                  onMove={(dir) => onReorder(move(videos, i, dir))}
                  onRemove={() => {
                    if (confirm(`Delete "${v.title}"?`)) remove.mutate(v.id);
                  }}
                />
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function VideoForm({ video, onDone }: { video?: AdminVideo; onDone: () => void }) {
  const [d, setD] = useState<VideoDraft>(() => (video ? { ...video } : emptyVideo()));
  const upd = <K extends keyof VideoDraft>(k: K, v: VideoDraft[K]) => setD((x) => ({ ...x, [k]: v }));
  const save = useMutation({
    mutationFn: () =>
      video
        ? api(`/videos/${video.id}`, { method: "PATCH", body: JSON.stringify(d) })
        : api("/videos", { method: "POST", body: JSON.stringify(d) }),
    onSuccess: () => {
      toast.success("Saved");
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className={cn(CARD, "flex flex-col gap-4 border-white/20")}>
      <div className="grid gap-4 md:grid-cols-[1fr_7rem]">
        <Field label="Title">
          <TextInput value={d.title} onChange={(v) => upd("title", v)} maxLength={80} />
        </Field>
        <Field label="Length (s)">
          <TextInput value={String(d.durationSec)} onChange={(v) => upd("durationSec", Number(v) || 0)} />
        </Field>
      </div>
      <Field label="Video (16:9, at least 15 s)" hint="Upload, pick from the library, or paste a link below.">
        <MediaField url={d.videoUrl} kind="video" kinds={["video"]} onChange={(url) => upd("videoUrl", url)} />
      </Field>
      <Field label="Video link">
        <TextInput type="url" value={d.videoUrl} onChange={(v) => upd("videoUrl", v)} placeholder="https://…" />
      </Field>
      <Field label="Poster image · optional">
        <MediaField url={d.thumbnail} kind="image" kinds={["image"]} onChange={(url) => upd("thumbnail", url)} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-4">
        {(["location", "weather", "time", "mood"] as const).map((k) => (
          <Field key={k} label={k}>
            <TextInput value={d[k]} onChange={(v) => upd(k, v)} maxLength={40} />
          </Field>
        ))}
      </div>
      <label className="flex items-center gap-2 text-sm text-white/70">
        <input type="checkbox" checked={d.enabled} onChange={(e) => upd("enabled", e.target.checked)} />
        Visible
      </label>
      <FormButtons saving={save.isPending} onSave={() => save.mutate()} onCancel={onDone} />
    </div>
  );
}

function FormButtons({ saving, onSave, onCancel }: { saving: boolean; onSave: () => void; onCancel: () => void }) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="bg-primary hover:bg-primary/90 flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        <Save className="size-4" /> {saving ? "Saving…" : "Save"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 hover:text-white"
      >
        <X className="size-4" /> Cancel
      </button>
    </div>
  );
}
