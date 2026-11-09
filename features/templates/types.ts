/** An Explore template (GET /templates). */
export interface Template {
  id: string;
  model: string;
  /** The main kind of media the template shows. */
  mediaType: "image" | "video" | "audio";
  /** Photos (AI Influencer…). */
  images: string[];
  /** Videos; two or more are shown as a before/after loop (Gensu, Remix). */
  videos: string[];
  aspectRatio: string | null;
  generationId: string | null;
  generation: { id: string; model: string | null; type: string | null; input: Record<string, unknown> | null } | null;
  /** The generation's settings, copied into the sidebar by Recreate. */
  input: Record<string, unknown> | null;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TemplatePage {
  data: Template[];
  totalCount: number;
  limit: number;
}

export type TemplateLayout = "before_after" | "photos" | "video" | "empty";

/** How a template is displayed, from what it holds. */
export function templateLayout(t: Pick<Template, "images" | "videos">): TemplateLayout {
  if (t.videos.length >= 2) return "before_after";
  if (t.videos.length === 1) return "video";
  if (t.images.length) return "photos";
  return "empty";
}
