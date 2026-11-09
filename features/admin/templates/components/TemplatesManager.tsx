"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PromptComposer from "@/features/generation/components/prompt/PromptComposer";
import InfluencerBuilder from "@/features/ai-influencer/components/InfluencerBuilder";
import AdsBuilder from "@/features/ads-studio/components/AdsBuilder";
import { InfluencerBulkGenerator } from "./InfluencerBulkGenerator";
import {
  AiModelsEnum,
  IMAGE_MODELS,
  Model,
  STUDIO_MODELS,
  VIDEO_MODELS,
} from "@/features/generation/enums/models.enum";
import { GenerationTypeEnum } from "@/features/generation/types/generation";
import { useGenerationQueuesQuery } from "@/features/generation/hooks/generation";
import { useAiGenerationControlStore } from "@/stores/useAiGenerationControlStore";
import { useAdminTemplatesQuery } from "@/features/media/queries/media";
import { useDeleteTemplateMutation } from "@/features/media/hooks/useTemplates";
import { QueuedGenerationTile } from "@/features/media/components/QueuedGenerationTile";
import { Template } from "@/features/templates/types";
import { reorderTemplates, updateTemplate } from "@/features/templates/api";
import { TemplateMedia } from "@/features/templates/components/TemplateMedia";
import { TemplatePreviewDialog } from "@/features/templates/components/TemplatePreviewDialog";
import { TemplateEditDialog } from "./TemplateEditDialog";
import { LegacyTemplatesImport } from "./LegacyTemplatesImport";

const MODEL_GROUPS: { label: string; type: GenerationTypeEnum; models: Model[] }[] = [
  { label: "Image", type: GenerationTypeEnum.IMAGE, models: IMAGE_MODELS },
  { label: "Video", type: GenerationTypeEnum.VIDEO, models: VIDEO_MODELS },
  { label: "Studios", type: GenerationTypeEnum.IMAGE, models: STUDIO_MODELS },
];

export function TemplatesManager() {
  const queryClient = useQueryClient();
  const { model, setModel, setMediaType, setTemplateMode } =
    useAiGenerationControlStore();
  const [preview, setPreview] = useState<Template | null>(null);
  const [editing, setEditing] = useState<Template | null>(null);
  const [toDelete, setToDelete] = useState<Template | null>(null);
  const deleteTemplate = useDeleteTemplateMutation();

  // Composers on this page create templates, not the admin's own media.
  useEffect(() => {
    setTemplateMode(true);
    return () => setTemplateMode(false);
  }, [setTemplateMode]);

  const pickModel = (type: GenerationTypeEnum, id: AiModelsEnum) => {
    // setMediaType resets the model, so set the model after it.
    setMediaType(type);
    setModel(id);
  };

  const { data, isFetched, hasNextPage, fetchNextPage, isFetchingNextPage } =
    // Up to 200 per model, so the display order covers all of them.
    useAdminTemplatesQuery(model, 200);
  const templates = data?.pages.flatMap((p) => p.data) ?? [];
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["templates"] });

  const togglePublished = async (t: Template) => {
    try {
      await updateTemplate(t.id, { isPublished: !t.isPublished });
      refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const moveTemplate = async (index: number, dir: -1 | 1) => {
    const ids = templates.map((t) => t.id);
    const j = index + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[index], ids[j]] = [ids[j], ids[index]];
    try {
      await reorderTemplates(ids);
      refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  // Show this model's running jobs and refresh the list when one finishes.
  const { data: queues } = useGenerationQueuesQuery();
  const running = useMemo(
    () =>
      queues?.filter(
        (q: { status: string; model?: string; mediaId?: string }) =>
          ["pending", "processing"].includes(q.status) && !q.mediaId,
      ) ?? [],
    [queues],
  );
  const seenSuccess = useRef(new Set<string>());
  useEffect(() => {
    let finished = false;
    queues?.forEach((q: { id: string; status: string }) => {
      if (q.status === "success" && !seenSuccess.current.has(q.id)) {
        seenSuccess.current.add(q.id);
        finished = true;
      }
    });
    if (finished) queryClient.invalidateQueries({ queryKey: ["templates"] });
  }, [queues, queryClient]);

  const modelName =
    [...IMAGE_MODELS, ...VIDEO_MODELS, ...STUDIO_MODELS].find((m) => m.id === model)
      ?.name ?? model;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Templates</h1>
        <p className="text-sm text-white/50">
          Generate examples with a model. Users see them under Explore and can
          only recreate them.
        </p>
      </div>

      {/* Model picker */}
      <div className="flex flex-col gap-4">
        {MODEL_GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col gap-2">
            <p className="text-xs font-semibold tracking-wider text-white/40 uppercase">
              {group.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.models.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => pickModel(group.type, m.id)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                    model === m.id
                      ? "border-white bg-white text-black"
                      : "border-white/10 text-white/70 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Composer */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <p className="mb-3 text-sm font-medium text-white/80">
          New template · {modelName}
        </p>
        {model === AiModelsEnum.HIGGSFIELD_AI_INFLUENCER ? (
          <div className="max-w-xl">
            <InfluencerBuilder />
          </div>
        ) : model === AiModelsEnum.HIGGSFIELD_ADS_STUDIO ? (
          <div className="max-w-xl">
            <AdsBuilder />
          </div>
        ) : (
          <PromptComposer />
        )}
      </section>

      {model === AiModelsEnum.HIGGSFIELD_AI_INFLUENCER && <InfluencerBulkGenerator />}

      <LegacyTemplatesImport />

      {/* Templates for the selected model */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">
          {modelName} templates
          {isFetched && (
            <span className="ml-2 text-sm font-normal text-white/40">
              {data?.pages[0]?.totalCount ?? 0}
            </span>
          )}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {running.map((q) => (
            <QueuedGenerationTile key={q.id} queue={q} />
          ))}
          {templates.map((t, i) => (
            <div key={t.id} className="flex flex-col gap-2">
              <div
                className={`group relative aspect-video cursor-pointer overflow-hidden rounded-xl border bg-black ${
                  t.isPublished ? "border-white/10" : "border-dashed border-amber-400/40 opacity-60"
                }`}
                onClick={() => setPreview(t)}
              >
                <TemplateMedia template={t} />
                {!t.isPublished && (
                  <span className="absolute bottom-2 left-2 rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-semibold text-black">
                    Hidden
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button type="button" title="Move earlier" disabled={i === 0} onClick={() => moveTemplate(i, -1)} className="rounded-md p-1.5 text-white/60 hover:bg-white/10 disabled:opacity-30">
                  <ArrowUp className="size-4" />
                </button>
                <button type="button" title="Move later" disabled={i === templates.length - 1} onClick={() => moveTemplate(i, 1)} className="rounded-md p-1.5 text-white/60 hover:bg-white/10 disabled:opacity-30">
                  <ArrowDown className="size-4" />
                </button>
                <button type="button" title={t.isPublished ? "Hide from Explore" : "Show in Explore"} onClick={() => togglePublished(t)} className="rounded-md p-1.5 text-white/60 hover:bg-white/10">
                  {t.isPublished ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </button>
                <button type="button" title="Edit media" onClick={() => setEditing(t)} className="rounded-md p-1.5 text-white/60 hover:bg-white/10">
                  <Pencil className="size-4" />
                </button>
                <span className="ml-auto text-[11px] text-white/35">
                  {t.videos.length} video{t.videos.length === 1 ? "" : "s"} · {t.images.length} image{t.images.length === 1 ? "" : "s"}
                </span>
                <button type="button" title="Delete template" onClick={() => setToDelete(t)} className="rounded-md p-1.5 text-red-400 hover:bg-white/10">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        {isFetched && !templates.length && !running.length && (
          <p className="text-sm text-white/40">No templates for this model yet.</p>
        )}
        {hasNextPage && (
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="self-center text-sm text-white/60 hover:text-white"
          >
            {isFetchingNextPage ? "Loading…" : "Show more"}
          </button>
        )}
      </section>

      <TemplatePreviewDialog template={preview} onClose={() => setPreview(null)} />
      {editing && (
        <TemplateEditDialog template={editing} onClose={() => setEditing(null)} onSaved={() => refresh()} />
      )}

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this template?</AlertDialogTitle>
            <AlertDialogDescription>
              Users won&apos;t see it under Explore anymore.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() =>
                toDelete &&
                deleteTemplate.mutate(toDelete.id, {
                  onSuccess: () => setToDelete(null),
                })
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
