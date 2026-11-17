"use client";

import { useState } from "react";
import { ProjectColorPicker } from "@/components/ui/hex-color-picker";

const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;

function normalize(raw: string): string {
  const trimmed = raw.trim();
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

interface HexColorFieldProps {
  value?: string;
  onChange: (color: string | undefined) => void;
}

/** The colour picker plus an always-visible box to type the hex code directly. */
export function HexColorField({ value, onChange }: HexColorFieldProps) {
  const [draft, setDraft] = useState(value ?? "");
  // A new value from outside (picker, swatch switch) replaces what was typed.
  const [seen, setSeen] = useState(value);
  if (seen !== value) {
    setSeen(value);
    setDraft(value ?? "");
  }

  const commit = (raw: string) => {
    if (!raw.trim()) {
      onChange(undefined);
      return;
    }
    const hex = normalize(raw);
    if (HEX_PATTERN.test(hex)) onChange(hex.toLowerCase());
    else setDraft(value ?? "");
  };

  return (
    <div className="flex items-center gap-2">
      {/* The picker's hex box has no classes of its own (it used the global field style). */}
      <div className="min-w-0 flex-1 [&_input]:h-9 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-white/10 [&_input]:bg-black/30 [&_input]:px-2.5 [&_input]:text-sm [&_input]:text-white">
        <ProjectColorPicker value={value} onChange={onChange} label="" />
      </div>
      <input
        type="text"
        value={draft}
        maxLength={7}
        placeholder="#rrggbb"
        aria-label="Hex colour code"
        onChange={(event) => {
          setDraft(event.target.value);
          if (HEX_PATTERN.test(normalize(event.target.value))) {
            onChange(normalize(event.target.value).toLowerCase());
          }
        }}
        onBlur={() => commit(draft)}
        className="border-border bg-background-light text-foreground placeholder:text-muted-foreground focus:border-primary/50 h-10 w-28 shrink-0 rounded-xl! border! px-3! font-mono text-sm! outline-none!"
      />
    </div>
  );
}
