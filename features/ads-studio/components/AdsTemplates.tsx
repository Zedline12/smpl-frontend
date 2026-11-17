"use client";
import { useState } from "react";
import { Flame } from "lucide-react";
import { TemplateCard } from "@/features/templates/components/TemplateGrid";
import { TemplatePreviewDialog } from "@/features/templates/components/TemplatePreviewDialog";
import type { Template } from "@/features/templates/types";

/** "Trending now": published Ads Studio templates; Recreate loads one into the composer. */
export function AdsTemplates({
  templates,
  loading,
  hasMore,
  loadingMore,
  onMore,
}: {
  templates: Template[];
  loading: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  onMore: () => void;
}) {
  const [preview, setPreview] = useState<Template | null>(null);

  if (!loading && templates.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="flex items-center justify-center gap-2 text-base font-semibold text-white">
        <Flame className="text-primary size-4" />
        Trending now
      </h2>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="aspect-video animate-pulse rounded-xl bg-white/[0.05]"
              />
            ))
          : templates.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                onOpen={() => setPreview(t)}
              />
            ))}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={onMore}
          disabled={loadingMore}
          className="self-center rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:opacity-50"
        >
          {loadingMore ? "Loading…" : "Show more"}
        </button>
      )}

      <TemplatePreviewDialog
        template={preview}
        onClose={() => setPreview(null)}
      />
    </section>
  );
}
