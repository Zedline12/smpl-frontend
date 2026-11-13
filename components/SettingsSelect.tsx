"use client";

import { useEffect, useRef, useState, useCallback, KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, Check } from "lucide-react";

export interface SettingsSelectOption {
  label: string;
  value: string | number | boolean;
}

interface SettingsSelectProps {
  label: string;
  value: string | number | boolean;
  options: SettingsSelectOption[];
  onChange: (value: string | number | boolean) => void;
  disabled?: boolean;
}

export function SettingsSelect({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: SettingsSelectProps) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  // Fixed position next to the trigger: the sidebar clips anything that overflows it.
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);

  const place = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.max(200, Math.min(260, rect.width));
    const menuHeight = Math.min(280, options.length * 40 + 2);
    const gap = 8;
    // Right of the trigger when it fits, otherwise below it (phones).
    if (rect.right + gap + width <= window.innerWidth - 8) {
      const top = Math.max(8, Math.min(rect.top, window.innerHeight - menuHeight - 8));
      setPos({ top, left: rect.right + gap, width });
    } else {
      setPos({ top: rect.bottom + 6, left: rect.left, width: rect.width });
    }
  }, [options.length]);

  useEffect(() => {
    if (!open) return;
    window.addEventListener("resize", place);
    // Capture: the sidebar's own scrolling moves the trigger too.
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, place]);

  const selectedOption = options.find((o) => o.value === value) ?? options[0];
  const selectedIndex = options.findIndex((o) => o.value === value);

  const close = useCallback(() => {
    setOpen(false);
    setFocusedIndex(-1);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !menuRef.current?.contains(e.target as Node)
      ) {
        close();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, close]);

  useEffect(() => {
    if (!open || focusedIndex < 0) return;
    const el = menuRef.current?.querySelector(`[data-index="${focusedIndex}"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: "nearest" });
  }, [focusedIndex, open]);

  function handleTriggerKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (open) close();
      else { place(); setOpen(true); setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0); }
    } else if (e.key === "Escape") {
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) { place(); setOpen(true); setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0); }
      else setFocusedIndex((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) { place(); setOpen(true); setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0); }
      else setFocusedIndex((i) => Math.max(i - 1, 0));
    }
  }

  function handleMenuKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") { close(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setFocusedIndex((i) => Math.min(i + 1, options.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setFocusedIndex((i) => Math.max(i - 1, 0)); }
    if ((e.key === "Enter" || e.key === " ") && focusedIndex >= 0) {
      e.preventDefault();
      onChange(options[focusedIndex].value);
      close();
    }
  }

  return (
    <div
      className="relative w-full"
      style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? "none" : "auto" }}
    >
      <style>{`
        @keyframes ssSelectIn {
          from { opacity: 0; transform: scale(0.97) translateX(-4px); }
          to   { opacity: 1; transform: scale(1)    translateX(0); }
        }
      `}</style>

      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`${label}: ${selectedOption?.label}`}
        disabled={disabled}
        onClick={() => {
          if (open) close();
          else { place(); setOpen(true); setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0); }
        }}
        onKeyDown={handleTriggerKeyDown}
        className="w-full flex items-center justify-between pl-3 pr-3 py-3 rounded-[10px] border transition-colors duration-100 focus:outline-none focus-visible:ring-2"
        style={{
          backgroundColor: open ? "var(--bg-elevated)" : "var(--bg-card)",
          borderColor: "var(--border-subtle)",
          minHeight: "64px",
          ["--tw-ring-color" as any]: "rgba(107, 65, 255, 0.4)",
        }}
        onMouseEnter={(e) => {
          if (!open) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-elevated)";
        }}
        onMouseLeave={(e) => {
          if (!open) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-card)";
        }}
      >
        <span className="flex flex-col items-start gap-[3px] text-left">
          <span className="text-white/40" style={{ fontSize: "12px", fontWeight: 500, lineHeight: 1.2 }}>
            {label}
          </span>
          <span className="text-white" style={{ fontSize: "16px", fontWeight: 600, lineHeight: 1.2 }}>
            {selectedOption?.label ?? "—"}
          </span>
        </span>
        <ChevronRight
          className="flex-shrink-0 ml-2 transition-transform duration-150"
          style={{
            width: 16,
            height: 16,
            color: "var(--text-muted)",
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* Dropdown */}
      {open && pos && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          aria-label={label}
          tabIndex={-1}
          onKeyDown={handleMenuKeyDown}
          className="fixed z-[80] rounded-[10px] border overflow-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [--bg-card:var(--background-light)] [--bg-elevated:var(--background-lighter)]"
          style={{
            top: pos.top,
            left: pos.left,
            width: pos.width,
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border-subtle)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            animation: "ssSelectIn 150ms ease",
            maxHeight: 280,
            overflowY: "auto",
          }}
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === value;
            const isFocused = focusedIndex === i;
            return (
              <div
                key={String(opt.value)}
                role="option"
                aria-selected={isSelected}
                data-index={i}
                onClick={() => { onChange(opt.value); close(); }}
                onMouseEnter={() => setFocusedIndex(i)}
                className="flex items-center justify-between cursor-pointer transition-colors duration-75"
                style={{
                  height: 40,
                  padding: "0 12px",
                  backgroundColor: isFocused ? "var(--bg-elevated)" : "transparent",
                  color: isSelected ? "var(--text)" : "var(--text-muted)",
                  fontSize: 14,
                  fontWeight: isSelected ? 600 : 400,
                  outline: isFocused ? "2px solid rgba(139, 92, 246, 0.35)" : "none",
                  outlineOffset: -2,
                }}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <Check style={{ width: 14, height: 14, color: "var(--primary)", flexShrink: 0 }} />
                )}
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </div>
  );
}
