import { Media } from "@/features/media/types/media";
import { Template } from "./types";

/**
 * A media-shaped view of a template, for the shared Recreate action and the settings
 * panel (both read model, type and input).
 */
export function templateAsMedia(t: Template): Media {
  return {
    id: t.id,
    url: t.images[0] ?? t.videos[t.videos.length - 1] ?? "",
    type: t.mediaType,
    aspectRatio: t.aspectRatio ?? "16:9",
    model: t.model,
    input: (t.input ?? {}) as Record<string, unknown>,
    generationId: t.generationId ?? undefined,
    isTemplate: true,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  } as unknown as Media;
}
