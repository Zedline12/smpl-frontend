import {
  MAX_SCREENSHOT_BYTES,
  SCREENSHOT_TYPES,
  SupportCategoryKey,
  SupportGenerationLists,
  SupportInvoiceOption,
  SupportTicketSummary,
  SupportTicketView,
} from "./types";

async function readJson<T>(res: Response, fallback: string): Promise<T> {
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error || json?.message || fallback);
  return (json?.data ?? json) as T;
}

/** Uploads one screenshot and returns its storage key (what the ticket stores). */
export async function uploadSupportScreenshot(file: File): Promise<{ key: string; publicUrl: string }> {
  if (!SCREENSHOT_TYPES.includes(file.type)) throw new Error("Screenshots must be PNG, JPG, WebP or GIF");
  if (file.size > MAX_SCREENSHOT_BYTES) throw new Error("Screenshots must be under 5 MB");

  const sigRes = await fetch("/api/support/attachments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType: file.type, size: file.size }),
  });
  const sig = await readJson<{ url: string; key: string; publicUrl: string }>(sigRes, "Couldn't start the upload");
  const put = await fetch(sig.url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
  if (!put.ok) throw new Error("Upload failed. Please try again.");
  return { key: sig.key, publicUrl: sig.publicUrl };
}

export async function fetchSupportInvoices() {
  return readJson<SupportInvoiceOption[]>(await fetch("/api/support/context/invoices"), "Couldn't load your invoices");
}

export async function fetchSupportGenerations() {
  return readJson<SupportGenerationLists>(await fetch("/api/support/context/generations"), "Couldn't load your generations");
}

export interface CreateTicketInput {
  category: SupportCategoryKey;
  topic?: string;
  body?: string;
  invoiceId?: string;
  jobIds?: string[];
  attachments?: string[];
}

export async function createSupportTicket(input: CreateTicketInput) {
  const res = await fetch("/api/support", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return readJson<SupportTicketView>(res, "Failed to submit");
}

export async function fetchMyTickets() {
  return readJson<SupportTicketSummary[]>(await fetch("/api/support/tickets"), "Couldn't load your tickets");
}

export async function fetchMyTicket(code: string) {
  return readJson<SupportTicketView>(
    await fetch(`/api/support/tickets/${encodeURIComponent(code)}`),
    "Couldn't load this ticket",
  );
}

export async function replyToTicket(code: string, body: string, attachments: string[]) {
  const res = await fetch(`/api/support/tickets/${encodeURIComponent(code)}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body, attachments }),
  });
  return readJson<SupportTicketView>(res, "Couldn't send your reply");
}
