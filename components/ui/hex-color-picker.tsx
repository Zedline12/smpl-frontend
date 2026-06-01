"use client";

import { useState, useRef, useEffect } from "react";
import { HexColorPicker } from "react-colorful";

interface HexColorPickerProps {
  value?: string;
  onChange: (color: string | undefined) => void;
  label?: string;
}

export function ProjectColorPicker({
  value,
  onChange,
  label = "Color (optional)",
}: HexColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [inputVal, setInputVal] = useState(value ?? "");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputVal(value ?? "");
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleInput = (raw: string) => {
    setInputVal(raw);
    if (/^#[0-9a-fA-F]{6}$/.test(raw)) onChange(raw);
  };

  const handlePickerChange = (color: string) => {
    onChange(color);
    setInputVal(color);
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
      )}
      <div ref={ref} className="relative">
        {/* Trigger */}
        <button
          type="button"
          onClick={() => setOpen((p) => !p)}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border bg-background-light hover:border-white/20 transition-colors duration-200 w-full"
        >
          {value ? (
            <div
              className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0"
              style={{ background: value }}
            />
          ) : (
            <div className="w-5 h-5 rounded-full border border-border bg-muted flex items-center justify-center flex-shrink-0">
              <svg
                className="w-2.5 h-2.5 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          )}
          <span className="text-sm text-muted-foreground">
            {value ?? "No color"}
          </span>
        </button>

        {/* Picker panel */}
        {open && (
          <div className="absolute top-full left-0 mt-2 z-50 bg-card border border-border rounded-xl p-4 space-y-3 w-[220px] shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
            <HexColorPicker
              color={value ?? "#6b41ff"}
              onChange={handlePickerChange}
              style={{ width: "100%" }}
            />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => handleInput(e.target.value)}
              placeholder="#6b41ff"
              maxLength={7}
            />
            <button
              type="button"
              onClick={() => {
                onChange(undefined);
                setInputVal("");
                setOpen(false);
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center"
            >
              Clear color
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
