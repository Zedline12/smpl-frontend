"use client";
import { useState } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  label?: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  max?: number;
}

/** Free-text tags: Enter or comma adds, × removes. */
export function TagInput({ label, value, onChange, placeholder, max = 50 }: TagInputProps) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const tag = draft.trim().replace(/,$/, "");
    setDraft("");
    if (!tag || value.length >= max) return;
    if (value.some((v) => v.toLowerCase() === tag.toLowerCase())) return;
    onChange([...value, tag]);
  };

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <span className="text-[11px] font-semibold uppercase tracking-widest text-white/50">{label}</span>
      )}
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] p-1.5 focus-within:border-white/25">
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-white/10 py-0.5 pr-1 pl-2.5 text-xs text-white/85"
          >
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => onChange(value.filter((v) => v !== tag))}
              className="rounded-full p-0.5 text-white/50 hover:bg-white/10 hover:text-white"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            } else if (e.key === "Backspace" && !draft && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={add}
          placeholder={value.length ? "" : placeholder}
          className="min-w-24 flex-1 bg-transparent px-1.5 py-0.5 text-xs text-white placeholder:text-white/30 focus:outline-none"
        />
      </div>
    </div>
  );
}
