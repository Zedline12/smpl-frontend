"use client";

import { KeyboardEvent, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_FONTS = 6;

interface FontChipsInputProps {
  value: string[];
  onChange: (fonts: string[]) => void;
}

export function FontChipsInput({ value, onChange }: FontChipsInputProps) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const trimmed = draft.trim();
    setDraft("");
    if (!trimmed || value.length >= MAX_FONTS) return;
    if (value.some((font) => font.toLowerCase() === trimmed.toLowerCase())) {
      return;
    }
    onChange([...value, trimmed]);
  };

  const remove = (font: string) => {
    onChange(value.filter((item) => item !== font));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    // Never commit mid-IME-composition (e.g. typing Japanese/Korean).
    if ((event.nativeEvent as unknown as { isComposing?: boolean }).isComposing) {
      return;
    }
    event.preventDefault();
    commit();
  };

  return (
    <div
      className={cn(
        "border-border bg-background-light flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-xl! border! px-2! py-1.5!",
        "focus-within:border-primary/50",
      )}
    >
      {value.map((font) => (
        <span
          key={font}
          className="border-border bg-card text-foreground/80 group flex items-center gap-1 rounded-full border py-0.5 pr-1 pl-2 text-[11px]"
        >
          {font}
          <button
            type="button"
            onClick={() => remove(font)}
            aria-label={`Remove ${font}`}
            className="text-muted-foreground hover:text-foreground cursor-pointer rounded-full p-0.5 transition-colors"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}

      {value.length < MAX_FONTS && (
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          placeholder={value.length ? "" : "Type a font and press Enter"}
          aria-label="Add a font"
          className="text-foreground placeholder:text-muted-foreground min-w-[8rem] flex-1 border-0! bg-transparent! p-0! text-xs! outline-none!"
        />
      )}
    </div>
  );
}
