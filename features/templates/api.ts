import { Template, TemplatePage } from "./types";

async function readJson<T>(res: Response, fallback: string): Promise<T> {
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error || json?.message || fallback);
  return (json?.data ?? json) as T;
}

const toPage = (data: Partial<TemplatePage> | null, limit: number): TemplatePage => ({
  data: data?.data ?? [],
  totalCount: data?.totalCount ?? 0,
  limit: data?.limit ?? limit,
});

/** Published templates for Explore. */
export async function fetchTemplates({
  type,
  model,
  limit = 12,
  offset = 0,
}: {
  type?: string;
  model?: string;
  limit?: number;
  offset?: number;
}): Promise<TemplatePage> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (type) params.set("type", type);
  if (model) params.set("model", model);
  const res = await fetch(`/api/templates?${params}`);
  return toPage(await readJson<TemplatePage>(res, "Could not load templates"), limit);
}

/** Admin: every template of a model, unpublished included. */
export async function fetchAdminTemplates({
  model,
  limit = 24,
  offset = 0,
}: {
  model?: string;
  limit?: number;
  offset?: number;
}): Promise<TemplatePage> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (model) params.set("model", model);
  const res = await fetch(`/api/admin/templates?${params}`);
  return toPage(await readJson<TemplatePage>(res, "Could not load templates"), limit);
}

export async function updateTemplate(
  id: string,
  data: { images?: string[]; videos?: string[]; isPublished?: boolean },
): Promise<Template> {
  const res = await fetch(`/api/admin/templates/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return readJson<Template>(res, "Could not save the template");
}

export async function reorderTemplates(ids: string[]): Promise<void> {
  const res = await fetch("/api/admin/templates/reorder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) await readJson(res, "Could not save the order");
}

export type LegacyTemplateReport = {
  dryRun: boolean;
  found: number;
  created: number;
  skipped: number;
  failed: number;
  byModel: Record<string, number>;
};

/** Moves the old templates (media with isTemplate) into the templates module. */
export async function migrateLegacyTemplates(dryRun: boolean): Promise<LegacyTemplateReport> {
  const res = await fetch(`/api/admin/templates/migrate-legacy?dryRun=${dryRun}`, { method: "POST" });
  return readJson<LegacyTemplateReport>(res, "Could not import the old templates");
}

/** Uploads an image or video for a template and returns its public URL. */
export async function uploadTemplateFile(file: File): Promise<string> {
  const contentType = file.type || "application/octet-stream";
  const sigRes = await fetch("/api/media/upload-signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType }),
  });
  const sig = await readJson<{ url?: string; publicUrl?: string }>(sigRes, "Could not start the upload");
  if (!sig.url || !sig.publicUrl) throw new Error("Could not start the upload");
  const putRes = await fetch(sig.url, { method: "PUT", body: file, headers: { "Content-Type": contentType } });
  if (!putRes.ok) throw new Error("Upload failed");
  return sig.publicUrl;
}
