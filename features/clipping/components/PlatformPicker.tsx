"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CLIPPING_PLATFORMS,
  ClippingPlatform,
  ClippingPlatformId,
  PlatformIcon,
  SHAPES,
  groupByShape,
  lengthRangeLabel,
} from "../platforms";

/** A platform logo on its brand colour. */
export function PlatformLogo({ platform, size = "md" }: { platform: ClippingPlatform; size?: "sm" | "md" }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center text-white ring-1 ring-white/10",
        size === "sm" ? "size-6 rounded-md" : "size-10 rounded-xl",
      )}
      style={{ background: platform.brand }}
    >
      <PlatformIcon id={platform.id} className={size === "sm" ? "size-3.5" : "size-5"} />
    </span>
  );
}

/** "Where will you post?" button; opens a side menu to pick platforms. */
export function PlatformPicker({
  value,
  onChange,
}: {
  value: ClippingPlatformId[];
  onChange: (ids: ClippingPlatformId[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const picked = CLIPPING_PLATFORMS.filter((p) => value.includes(p.id));

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex w-full items-center gap-3 rounded-xl border border-white/10 px-3 py-2.5 text-left transition-colors hover:border-white/25"
      >
        {picked.length ? (
          <span className="flex -space-x-1.5">
            {picked.map((p) => (
              <span key={p.id} className="rounded-md ring-2 ring-neutral-950">
                <PlatformLogo platform={p} size="sm" />
              </span>
            ))}
          </span>
        ) : null}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-white">
            {picked.length ? picked.map((p) => p.short).join(", ") : "Pick platforms"}
          </span>
          <span className="block text-[11px] text-white/45">
            {picked.length
              ? `${picked.length} platform${picked.length > 1 ? "s" : ""} · tap to change`
              : "We set the shape and length for each"}
          </span>
        </span>
        <ChevronRight className="size-4 shrink-0 text-white/40 transition-transform group-hover:translate-x-0.5" />
      </button>
      {open && <PlatformMenu value={value} onChange={onChange} onClose={close} />}
    </>
  );
}

function PlatformMenu({
  value,
  onChange,
  onClose,
}: {
  value: ClippingPlatformId[];
  onChange: (ids: ClippingPlatformId[]) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<ClippingPlatformId[]>(value);
  const groups = groupByShape(draft);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const toggle = (id: ClippingPlatformId) =>
    setDraft((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  // Platforms listed under the shape they're clipped in.
  const sections = [1, 2, 4].map((ratio) => ({
    ratio,
    platforms: CLIPPING_PLATFORMS.filter((p) => p.ratio === ratio),
  }));

  return createPortal(
    <div className="fixed inset-0 z-[80] flex justify-end">
      <style>{`@keyframes pp-slide { from { transform: translateX(28px); opacity: 0 } to { transform: none; opacity: 1 } }`}</style>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <aside
        role="dialog"
        aria-label="Pick platforms"
        className="relative flex h-full w-full max-w-[440px] flex-col border-l border-white/[0.08] bg-[#121316] shadow-2xl"
        style={{ animation: "pp-slide .25s cubic-bezier(.2,.8,.2,1)" }}
      >
        <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4">
          <div>
            <h2 className="text-xl font-black tracking-tight text-white uppercase">Where will you post?</h2>
            <p className="mt-1 text-[13px] text-white/50">
              We clip in the right shape and length for each platform.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 pb-6">
          {sections.map(({ ratio, platforms }) => (
            <div key={ratio}>
              <p className="mb-2 text-[11px] font-semibold tracking-widest text-white/40 uppercase">
                {SHAPES[ratio].name} {SHAPES[ratio].label}
              </p>
              <div className="space-y-2">
                {platforms.map((p) => {
                  const on = draft.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggle(p.id)}
                      aria-pressed={on}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors",
                        on ? "border-white/50 bg-white/[0.07]" : "border-white/[0.07] bg-white/[0.02] hover:border-white/20",
                      )}
                    >
                      <PlatformLogo platform={p} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] font-semibold text-white">{p.label}</span>
                        <span className="block text-[11px] text-white/45">
                          {SHAPES[p.ratio].label} · clips {lengthRangeLabel(p.preferLength)}
                          {p.captionMax ? ` · captions up to ${p.captionMax.toLocaleString()} chars` : ""}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                          on ? "border-white bg-white text-black" : "border-white/25",
                        )}
                      >
                        {on && <Check className="size-3.5" strokeWidth={3} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.06] bg-[#16171a] px-6 py-4">
          <p className="mb-3 text-[12px] text-white/55">
            {groups.length === 0
              ? "Pick at least one platform."
              : groups.length === 1
                ? `1 clip set: ${SHAPES[groups[0].ratio].name} ${SHAPES[groups[0].ratio].label}.`
                : `${groups.length} clip sets (${groups.map((g) => SHAPES[g.ratio].label).join(", ")}), charged per set.`}
          </p>
          <button
            type="button"
            disabled={!draft.length}
            onClick={() => {
              onChange(draft);
              onClose();
            }}
            className="w-full rounded-xl bg-white py-3 text-sm font-bold text-black transition-opacity hover:opacity-90 disabled:opacity-30"
          >
            Use {draft.length || ""} platform{draft.length === 1 ? "" : "s"}
          </button>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
