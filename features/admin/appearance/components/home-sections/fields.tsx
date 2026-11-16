"use client";

import { useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Film, ImageIcon, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaManagerDialog } from "@/features/generation/components/prompt/MediaManagerDialog";
import type { MediaKind } from "@/features/home-sections/types";

/** Small form controls shared by the Homepage Sections editor. */

const INPUT =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-blue-500/50 focus:outline-none";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-wide text-white/45">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-white/30">{hint}</span>}
    </label>
  );
}

export function TextInput({
  value,
  onChange,
  maxLength,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  placeholder?: string;
  type?: "text" | "datetime-local" | "url";
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      maxLength={maxLength}
      placeholder={placeholder}
      className={cn(INPUT, type === "datetime-local" && "[color-scheme:dark]")}
    />
  );
}

export function TextArea({
  value,
  onChange,
  maxLength,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      maxLength={maxLength}
      placeholder={placeholder}
      rows={rows}
      className={cn(INPUT, "resize-y")}
    />
  );
}

/** A row of buttons acting as one choice. */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label = (o) => String(o),
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  label?: (o: T) => string;
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-1">
      {options.map((o) => (
        <button
          key={String(o)}
          type="button"
          onClick={() => onChange(o)}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors",
            o === value ? "bg-white text-black" : "text-white/55 hover:text-white",
          )}
        >
          {label(o)}
        </button>
      ))}
    </div>
  );
}

/** Pick an image or video from the media manager (upload or library); shows a small preview. */
export function MediaField({
  url,
  kind,
  onChange,
  kinds = ["image", "video"],
}: {
  url: string;
  kind: MediaKind;
  onChange: (url: string, kind: MediaKind) => void;
  kinds?: readonly MediaKind[];
}) {
  const [picker, setPicker] = useState<MediaKind | null>(null);
  return (
    <div className="flex items-center gap-3">
      <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black">
        {url ? (
          kind === "video" ? (
            <video src={url} muted loop autoPlay playsInline className="h-full w-full object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-cover" />
          )
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-white/30">None</div>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {kinds.includes("image") && (
          <SmallButton onClick={() => setPicker("image")}>
            <ImageIcon className="size-3.5" /> Image
          </SmallButton>
        )}
        {kinds.includes("video") && (
          <SmallButton onClick={() => setPicker("video")}>
            <Film className="size-3.5" /> Video
          </SmallButton>
        )}
        {url && (
          <SmallButton onClick={() => onChange("", kind)}>
            <X className="size-3.5" /> Clear
          </SmallButton>
        )}
      </div>
      <MediaManagerDialog
        key={picker ?? "closed"}
        open={picker !== null}
        onOpenChange={(open) => !open && setPicker(null)}
        mediaType={picker ?? "image"}
        maxSelections={1}
        selectedImage={url || undefined}
        onSelect={(urls) => {
          const k = picker ?? "image";
          setPicker(null);
          if (urls[0]) onChange(urls[0], k);
        }}
      />
    </div>
  );
}

export function SmallButton({
  onClick,
  children,
  disabled,
  danger,
  title,
}: {
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "flex items-center gap-1.5 rounded-md border border-white/10 px-2 py-1 text-[11px] font-medium transition-colors disabled:opacity-30",
        danger ? "text-red-300 hover:bg-red-500/10" : "text-white/70 hover:bg-white/5 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}

/** Up / down / remove controls for one item of a list. */
export function ItemControls({
  index,
  count,
  onMove,
  onRemove,
}: {
  index: number;
  count: number;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex gap-1">
      <SmallButton onClick={() => onMove(-1)} disabled={index === 0} title="Move up">
        <ArrowUp className="size-3.5" />
      </SmallButton>
      <SmallButton onClick={() => onMove(1)} disabled={index === count - 1} title="Move down">
        <ArrowDown className="size-3.5" />
      </SmallButton>
      <SmallButton onClick={onRemove} danger title="Remove">
        <Trash2 className="size-3.5" />
      </SmallButton>
    </div>
  );
}

/** A copy of `list` with item `i` moved by `dir`. */
export function moveItem<T>(list: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

/** ISO date → the value a datetime-local input wants (local time), and back. */
export function isoToLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function localInputToIso(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
