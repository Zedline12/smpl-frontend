"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    setDraft(value ?? "");
  }, [value]);

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
      <div className="min-w-0 flex-1">
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
