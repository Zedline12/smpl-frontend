"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { uploadSupportScreenshot } from "../api";
import { MAX_SCREENSHOT_BYTES, MAX_SCREENSHOTS, SCREENSHOT_TYPES } from "../types";

interface Shot {
  id: string;
  previewUrl: string;
  key: string | null;
  error: string | null;
}

interface ScreenshotsFieldProps {
  /** Called with the storage keys of the finished uploads. */
  onChange: (keys: string[]) => void;
  /** Called while any upload is still running. */
  onUploadingChange?: (uploading: boolean) => void;
}

/**
 * Up to 5 screenshots: click, drag and drop, or paste. Each uploads right away.
 * Remount it (change its `key`) to clear it.
 */
export function ScreenshotsField({ onChange, onUploadingChange }: ScreenshotsFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [shots, setShots] = useState<Shot[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const shotsRef = useRef(shots);
  useEffect(() => {
    shotsRef.current = shots;
  }, [shots]);

  // Revoke previews when unmounting.
  useEffect(() => () => shotsRef.current.forEach((s) => URL.revokeObjectURL(s.previewUrl)), []);

  useEffect(() => {
    onChange(shots.filter((s) => s.key).map((s) => s.key as string));
    onUploadingChange?.(shots.some((s) => !s.key && !s.error));
  }, [shots, onChange, onUploadingChange]);

  const addFiles = (files: File[]) => {
    setMessage(null);
    const room = MAX_SCREENSHOTS - shotsRef.current.length;
    if (room <= 0) {
      setMessage(`You can add up to ${MAX_SCREENSHOTS} screenshots.`);
      return;
    }
    const accepted: File[] = [];
    for (const file of files) {
      if (!SCREENSHOT_TYPES.includes(file.type)) {
        setMessage("Only PNG, JPG, WebP or GIF images.");
        continue;
      }
      if (file.size > MAX_SCREENSHOT_BYTES) {
        setMessage("Each screenshot must be under 5 MB.");
        continue;
      }
      accepted.push(file);
    }
    if (accepted.length > room) setMessage(`Only the first ${room} were added (max ${MAX_SCREENSHOTS}).`);

    for (const file of accepted.slice(0, room)) {
      const id = Math.random().toString(36).slice(2);
      const shot: Shot = { id, previewUrl: URL.createObjectURL(file), key: null, error: null };
      setShots((prev) => [...prev, shot]);
      uploadSupportScreenshot(file)
        .then(({ key }) => setShots((prev) => prev.map((s) => (s.id === id ? { ...s, key } : s))))
        .catch((err: unknown) =>
          setShots((prev) =>
            prev.map((s) => (s.id === id ? { ...s, error: err instanceof Error ? err.message : "Upload failed" } : s)),
          ),
        );
    }
  };

  const remove = (id: string) =>
    setShots((prev) => {
      const gone = prev.find((s) => s.id === id);
      if (gone) URL.revokeObjectURL(gone.previewUrl);
      return prev.filter((s) => s.id !== id);
    });

  return (
    <div
      onPaste={(e) => {
        const files = Array.from(e.clipboardData.files ?? []);
        if (files.length) {
          e.preventDefault();
          addFiles(files);
        }
      }}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[12px] font-semibold text-white/50">Screenshots (optional)</span>
        <span className="text-[11px] text-white/30">
          {shots.length}/{MAX_SCREENSHOTS}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {shots.map((s) => (
          <div
            key={s.id}
            className="relative size-16 overflow-hidden rounded-lg border"
            style={{ borderColor: s.error ? "rgba(248,113,113,0.6)" : "rgba(255,255,255,0.1)" }}
            title={s.error ?? undefined}
          >
            <img src={s.previewUrl} alt="" className="size-full object-cover" />
            {!s.key && !s.error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/55">
                <Loader2 className="size-4 animate-spin text-white" />
              </div>
            )}
            {s.error && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-950/70 px-1 text-center text-[9px] leading-tight text-red-200">
                Failed
              </div>
            )}
            <button
              type="button"
              onClick={() => remove(s.id)}
              aria-label="Remove screenshot"
              className="absolute top-0.5 right-0.5 flex size-5 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
        {shots.length < MAX_SCREENSHOTS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              addFiles(Array.from(e.dataTransfer.files ?? []));
            }}
            className="flex h-16 min-w-16 flex-1 items-center justify-center gap-2 rounded-lg border border-dashed px-3 text-[12px] text-white/45 transition-colors hover:text-white/75"
            style={{
              borderColor: dragging ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.15)",
              background: dragging ? "rgba(255,255,255,0.06)" : "transparent",
            }}
          >
            <ImagePlus className="size-4 shrink-0" />
            {shots.length === 0 && <span>Add, drop or paste images</span>}
          </button>
        )}
      </div>
      {message && <p className="mt-1.5 text-[11px] text-amber-300/80">{message}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={SCREENSHOT_TYPES.join(",")}
        multiple
        hidden
        onChange={(e) => {
          addFiles(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
    </div>
  );
}
