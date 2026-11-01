"use client";
import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Copy, Trash2 } from "lucide-react";
import {
  CONTEXT_ADHERENCE,
  ContextAdherence,
  MusicLimits,
  MusicSection,
} from "@/features/generation/types/models/elevenlabs-music-v2-5.type";
import { SECTION_TYPES } from "../data/presets";
import { formatDuration, sectionIssues } from "../utils/composition-plan";
import { TagInput } from "./TagInput";

interface SectionCardProps {
  index: number;
  section: MusicSection;
  /** The whole song is instrumental, so lyrics are hidden everywhere. */
  songInstrumental: boolean;
  isFirst: boolean;
  isLast: boolean;
  canDuplicate: boolean;
  onChange: (patch: Partial<MusicSection>) => void;
  onMove: (direction: -1 | 1) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}

const ADHERENCE_LABEL: Record<ContextAdherence, string> = {
  low: "Loose",
  medium: "Balanced",
  high: "Tight",
};

const iconButton =
  "flex size-7 items-center justify-center rounded-lg text-white/45 transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-25";

export function SectionCard({
  index,
  section,
  songInstrumental,
  isFirst,
  isLast,
  canDuplicate,
  onChange,
  onMove,
  onDuplicate,
  onRemove,
}: SectionCardProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const instrumental = songInstrumental || section.instrumental;
  const issues = sectionIssues(section, instrumental);
  const lineCount = section.lyrics ? section.lyrics.split("\n").length : 0;

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border bg-white/[0.03] p-3 ${
        issues.length ? "border-red-500/40" : "border-white/10"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-white/10 text-[11px] font-semibold text-white/70">
          {index + 1}
        </span>
        <select
          value={section.type}
          onChange={(e) => {
            const type = SECTION_TYPES.find((t) => t.id === e.target.value);
            onChange({
              type: e.target.value,
              customName: type ? undefined : section.customName || "",
            });
          }}
          aria-label="Section type"
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-sm font-medium text-white [color-scheme:dark] focus:border-white/25 focus:outline-none"
        >
          {SECTION_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
          <option value="custom">Custom…</option>
        </select>
        <div className="flex shrink-0 items-center">
          <button type="button" title="Move up" disabled={isFirst} onClick={() => onMove(-1)} className={iconButton}>
            <ArrowUp className="size-3.5" />
          </button>
          <button type="button" title="Move down" disabled={isLast} onClick={() => onMove(1)} className={iconButton}>
            <ArrowDown className="size-3.5" />
          </button>
          <button type="button" title="Duplicate" disabled={!canDuplicate} onClick={onDuplicate} className={iconButton}>
            <Copy className="size-3.5" />
          </button>
          <button type="button" title="Remove" onClick={onRemove} className={`${iconButton} hover:text-red-400`}>
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {section.type === "custom" && (
        <input
          value={section.customName ?? ""}
          onChange={(e) => onChange({ customName: e.target.value })}
          maxLength={MusicLimits.maxSectionNameLength}
          placeholder="Section name, e.g. Rap Break"
          className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-sm text-white placeholder:text-white/30 focus:border-white/25 focus:outline-none"
        />
      )}

      <label className="flex items-center gap-3">
        <span className="w-14 shrink-0 text-xs text-white/50">Length</span>
        <input
          type="range"
          min={MusicLimits.minChunkSec}
          max={MusicLimits.maxChunkSec}
          step={1}
          value={section.durationSec}
          onChange={(e) => onChange({ durationSec: Number(e.target.value) })}
          className="flex-1 accent-[var(--color-primary)]"
        />
        <span className="w-10 text-right text-xs font-medium tabular-nums text-white/80">
          {formatDuration(section.durationSec)}
        </span>
      </label>

      {!songInstrumental && (
        <label className="flex cursor-pointer items-center justify-between text-xs text-white/60">
          Instrumental (no vocals)
          <input
            type="checkbox"
            checked={section.instrumental}
            onChange={(e) => onChange({ instrumental: e.target.checked })}
            className="size-4 accent-[var(--color-primary)]"
          />
        </label>
      )}

      {!instrumental && (
        <div className="flex flex-col gap-1">
          <textarea
            value={section.lyrics}
            onChange={(e) => onChange({ lyrics: e.target.value })}
            rows={4}
            placeholder={"Your lyrics, one line per row.\n(ooh) for vocal sounds, {beat drops} for cues.\nLeave empty and the AI writes the words."}
            className="resize-y rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2 text-sm leading-relaxed text-white placeholder:text-white/25 focus:border-white/25 focus:outline-none"
          />
          <span
            className={`self-end text-[10px] tabular-nums ${
              lineCount > MusicLimits.maxLinesPerChunk ? "text-red-400" : "text-white/35"
            }`}
          >
            {lineCount}/{MusicLimits.maxLinesPerChunk} lines
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={() => setAdvancedOpen((o) => !o)}
        className="flex items-center gap-1 self-start text-[11px] font-medium text-white/45 hover:text-white"
      >
        <ChevronDown className={`size-3.5 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
        Advanced
      </button>
      {advancedOpen && (
        <div className="flex flex-col gap-3">
          <TagInput
            label="Section styles"
            value={section.extraStyles}
            onChange={(extraStyles) => onChange({ extraStyles })}
            placeholder="e.g. half-time drums, whispered vocals"
          />
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-white/50">
              Stick to the flow
            </span>
            <div className="flex rounded-lg border border-white/10 p-0.5">
              {CONTEXT_ADHERENCE.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => onChange({ adherence: level })}
                  className={`flex-1 rounded-md py-1 text-xs font-medium transition-colors ${
                    section.adherence === level ? "bg-white/10 text-white" : "text-white/50 hover:text-white"
                  }`}
                >
                  {ADHERENCE_LABEL[level]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {issues.length > 0 && (
        <ul className="flex flex-col gap-0.5 text-[11px] text-red-400">
          {issues.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
