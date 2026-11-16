"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Template } from "@/features/templates/types";
import { TemplateCard } from "@/features/templates/components/TemplateGrid";
import { TemplatePreviewDialog } from "@/features/templates/components/TemplatePreviewDialog";
import type { TemplatesBodyResolved } from "../../types";
import { GRID_COLUMNS } from "../layout";

/** Hand-picked Explore templates: preview on click, Recreate on hover. */
export function TemplatesBody({ body }: { body: TemplatesBodyResolved }) {
  const [preview, setPreview] = useState<Template | null>(null);
  if (!body.templates.length) return null;
  return (
    <>
      <div className={cn("grid gap-4", GRID_COLUMNS[body.columns] ?? GRID_COLUMNS[3])}>
        {body.templates.map((t) => (
          <TemplateCard key={t.id} template={t} onOpen={() => setPreview(t)} />
        ))}
      </div>
      <TemplatePreviewDialog template={preview} onClose={() => setPreview(null)} />
    </>
  );
}
