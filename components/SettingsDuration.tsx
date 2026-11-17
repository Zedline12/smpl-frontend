"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronRight } from "lucide-react";
import DurationSelector from "@/features/generation/components/selectors/DurationSelector";

interface SettingsDurationProps<T extends number> {
  options: readonly T[];
  value: T | undefined;
  onChange: (value: T) => void;
  label?: string;
}

/** A sidebar settings row showing the chosen seconds; clicking it opens the duration slider. */
export function SettingsDuration<T extends number>({
  options,
  value,
  onChange,
  label = "Duration",
}: SettingsDurationProps<T>) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const current = value ?? options[0];

  // Fixed next to the trigger (the sidebar clips overflow); below it when there's no room (phones).
  const place = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.max(240, Math.min(280, rect.width));
    const gap = 8;
    if (rect.right + gap + width <= window.innerWidth - 8) {
      setPos({ top: Math.max(8, Math.min(rect.top, window.innerHeight - 120)), left: rect.right + gap, width });
    } else {
      setPos({ top: rect.bottom + 6, left: rect.left, width: rect.width });
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!triggerRef.current?.contains(e.target as Node) && !menuRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, place]);

  return (
    <div className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`${label}: ${current} seconds`}
        onClick={() => {
          if (!open) place();
          setOpen(!open);
        }}
        className={`flex min-h-16 w-full min-w-0 cursor-pointer items-center justify-between rounded-[10px] border py-3 pr-2 pl-3 transition-colors duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(107,65,255,0.4)] ${
          open ? "bg-[var(--bg-elevated)]" : "bg-[var(--bg-card)] hover:bg-[var(--bg-elevated)]"
        }`}
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <span className="flex min-w-0 flex-col items-start gap-[3px] text-left">
          <span className="text-xs leading-tight font-medium text-white/40">{label}</span>
          <span className="text-base leading-tight font-semibold text-white">{current}s</span>
        </span>
        <ChevronRight
          className="ml-1 size-4 shrink-0 text-[var(--text-muted)] transition-transform duration-150"
          style={{ transform: open ? "rotate(90deg)" : undefined }}
        />
      </button>

      {open &&
        pos &&
        createPortal(
          <div
            ref={menuRef}
            role="dialog"
            aria-label={label}
            className="fixed z-[80] overflow-hidden rounded-[10px] border shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
            style={{ top: pos.top, left: pos.left, width: pos.width, borderColor: "var(--border-subtle)" }}
          >
            <DurationSelector options={options} value={current} onChange={onChange} label={label} />
          </div>,
          document.body,
        )}
    </div>
  );
}
