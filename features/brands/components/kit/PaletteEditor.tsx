"use client";
import { useState } from "react";
import { Plus, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND_LIMITS } from "../../types";
import { isLight } from "../../color";
import { HexColorField } from "../HexColorField";

/**
 * The brand palette: swatches with the main colour first. Pick a swatch to change its
 * colour, make it the main one, or remove it.
 */
export function PaletteEditor({
  colors,
  onChange,
}: {
  colors: string[];
  onChange: (colors: string[]) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const active =
    selected !== null && selected < colors.length ? selected : null;

  const set = (index: number, color: string) =>
    onChange(colors.map((c, i) => (i === index ? color : c)));
  const remove = (index: number) => {
    onChange(colors.filter((_, i) => i !== index));
    setSelected(null);
  };
  const makeMain = (index: number) => {
    onChange([colors[index], ...colors.filter((_, i) => i !== index)]);
    setSelected(0);
  };
  const add = () => {
    onChange([...colors, "#ffffff"]);
    setSelected(colors.length);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {colors.map((color, i) => (
          <button
            key={`${color}-${i}`}
            type="button"
            onClick={() => setSelected(active === i ? null : i)}
            aria-pressed={active === i}
            aria-label={`${i === 0 ? "Main colour" : "Colour"} ${color}`}
            className={cn(
              "flex h-16 flex-col justify-end rounded-xl border p-2 text-left transition-shadow",
              active === i
                ? "ring-2 ring-white ring-offset-2 ring-offset-[#151519]"
                : "border-white/10",
              isLight(color) ? "text-black/70" : "text-white/85",
            )}
            style={{ background: color }}
          >
            {i === 0 && <span className="text-xs font-semibold">Main</span>}
            <span className="font-mono text-[10px] uppercase">{color}</span>
          </button>
        ))}
        {colors.length < BRAND_LIMITS.colors && (
          <button
            type="button"
            onClick={add}
            aria-label="Add a colour"
            className="flex h-16 items-center justify-center rounded-xl border border-dashed border-white/15 text-white/45 transition-colors hover:border-white/30 hover:text-white"
          >
            <Plus className="size-4" />
          </button>
        )}
      </div>

      {active !== null && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-black/25 p-2.5">
          <div className="min-w-0 flex-1">
            <HexColorField
              value={colors[active]}
              onChange={(c) => c && set(active, c)}
            />
          </div>
          {active !== 0 && (
            <button
              type="button"
              onClick={() => makeMain(active)}
              className="flex h-10 items-center gap-1.5 rounded-xl border border-white/10 px-3 text-xs font-semibold text-white/80 hover:bg-white/10"
            >
              <Star className="size-3.5" /> Make main
            </button>
          )}
          <button
            type="button"
            onClick={() => remove(active)}
            aria-label="Remove colour"
            className="flex size-10 items-center justify-center rounded-xl border border-white/10 text-white/60 hover:bg-red-500/20 hover:text-red-300"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
