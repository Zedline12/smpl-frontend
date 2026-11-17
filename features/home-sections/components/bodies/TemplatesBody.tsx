"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Template } from "@/features/templates/types";
import { TemplateCard } from "@/features/templates/components/TemplateGrid";
import { TemplatePreviewDialog } from "@/features/templates/components/TemplatePreviewDialog";
import type { TemplatesBodyResolved } from "../../types";
import { GRID_COLUMNS } from "../layout";
import { SmartLink } from "../SmartLink";

/**
 * Hand-picked Explore templates: preview on click, Recreate on hover. With a link, the grid
 * fades out at the bottom under a primary "View all" button.
 */
export function TemplatesBody({ body }: { body: TemplatesBodyResolved }) {
  const [preview, setPreview] = useState<Template | null>(null);
  if (!body.templates.length) return null;
  const link = body.link?.href ? body.link : null;
  const grid = (
    <div className={cn("grid gap-4", GRID_COLUMNS[body.columns] ?? GRID_COLUMNS[3])}>
      {body.templates.map((t) => (
        <TemplateCard key={t.id} template={t} onOpen={() => setPreview(t)} />
      ))}
    </div>
  );
  return (
    <>
      {link ? (
        <div className="relative">
          {/* The last stretch of the grid fades into the page. */}
          <div className="[mask-image:linear-gradient(to_bottom,black_65%,transparent)]">{grid}</div>
          <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
            <SmartLink
              href={link.href}
              className="bg-primary/80 hover:bg-primary/95 pointer-events-auto flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-sm transition-colors sm:text-base"
            >
              {link.label.trim() || "View all"}
              <ArrowUpRight className="size-4" />
            </SmartLink>
          </div>
        </div>
      ) : (
        grid
      )}
      <TemplatePreviewDialog template={preview} onClose={() => setPreview(null)} />
    </>
  );
}
