"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useRecreateMedia } from "@/features/media/hooks/useMediaActions";
import { Template, isPortraitRatio } from "../types";
import { cn } from "@/lib/utils";
import { templateAsMedia } from "../recreate";
import { TemplateMedia } from "./TemplateMedia";
import { TemplatePreviewDialog } from "./TemplatePreviewDialog";

/**
 * One template: its media, with Recreate on hover. Click opens the preview.
 * The card takes the template's shape: 9:16 for portrait media, 16:9 otherwise. The stored
 * aspect ratio decides; without one, the media's real size once it loads.
 */
export function TemplateCard({ template, onOpen }: { template: Template; onOpen: () => void }) {
  const recreate = useRecreateMedia();
  const [measured, setMeasured] = useState<boolean | null>(null);
  const portrait = isPortraitRatio(template.aspectRatio) ?? measured ?? false;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen()}
      // self-start: in a grid row with a taller portrait card, keep this card its own height.
      className={cn(
        "group relative cursor-pointer self-start overflow-hidden rounded-xl border border-white/10 bg-black",
        portrait ? "aspect-[9/16]" : "aspect-video",
      )}
    >
      <TemplateMedia template={template} onPortrait={setMeasured} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      {template.model && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            recreate(templateAsMedia(template));
          }}
          className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black opacity-0 shadow transition-opacity group-hover:opacity-100 focus:opacity-100"
        >
          <Sparkles className="size-3.5" /> Recreate
        </button>
      )}
    </div>
  );
}

/** Explore grid of templates. */
export function TemplateGrid({ templates }: { templates: Template[] }) {
  const [preview, setPreview] = useState<Template | null>(null);
  if (!templates.length) return null;
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <TemplateCard key={t.id} template={t} onOpen={() => setPreview(t)} />
        ))}
      </div>
      <TemplatePreviewDialog template={preview} onClose={() => setPreview(null)} />
    </>
  );
}
