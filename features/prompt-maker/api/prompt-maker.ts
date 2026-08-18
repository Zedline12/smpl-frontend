import { CreatePromptMakerRequest, PromptMaker } from "../types/prompt-maker";

function unwrap<T>(json: any): T {
  return (json?.data ?? json) as T;
}

async function readError(res: Response, fallback: string): Promise<string> {
  const json = await res.json().catch(() => null);
  return json?.error || json?.message || fallback;
}

export async function fetchPrompts(): Promise<PromptMaker[]> {
  const res = await fetch("/api/prompt-maker");
  if (!res.ok) {
    throw new Error(await readError(res, "Failed to load prompts"));
  }
  const data = unwrap<PromptMaker[]>(await res.json());
  return Array.isArray(data) ? data : [];
}

export async function createPrompt(
  body: CreatePromptMakerRequest,
): Promise<PromptMaker> {
  const res = await fetch("/api/prompt-maker", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await readError(res, "Failed to create prompt"));
  }
  return unwrap<PromptMaker>(await res.json());
}

export async function deletePrompt(id: string): Promise<void> {
  const res = await fetch(`/api/prompt-maker/${id}`, { method: "DELETE" });
  // 204, no body — never parse it.
  if (!res.ok) {
    throw new Error(await readError(res, "Failed to delete prompt"));
  }
}
