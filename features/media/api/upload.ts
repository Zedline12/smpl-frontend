/** Uploads straight to storage with progress, and the upload editor's crop / trim step. */

/** Backend responses come wrapped in { data }. */
function unwrap<T>(json: unknown): T {
  const wrapped = json as { data?: T } | null;
  return (wrapped?.data ?? json) as T;
}

async function readError(res: Response, fallback: string): Promise<string> {
  const json = await res.json().catch(() => null);
  const message = json?.error || json?.message;
  return typeof message === "string" && message ? message : fallback;
}

export class UploadCancelledError extends Error {
  constructor() {
    super("Upload cancelled");
    this.name = "UploadCancelledError";
  }
}

export interface UploadOptions {
  /** "media-edit-source": a temporary original the backend will crop / trim. */
  purpose?: "media-edit-source";
  onProgress?: (fraction: number) => void;
  signal?: AbortSignal;
}

/** Uploads a file to storage through a signed URL; resolves with its public URL. */
export async function uploadWithProgress(file: File, options: UploadOptions = {}): Promise<string> {
  const { purpose, onProgress, signal } = options;
  const contentType = file.type || "application/octet-stream";
  const sigRes = await fetch("/api/media/upload-signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType, ...(purpose ? { purpose } : {}) }),
    signal,
  });
  if (!sigRes.ok) throw new Error(await readError(sigRes, "Couldn't start the upload"));
  const sig = unwrap<{ url?: string; publicUrl?: string }>(await sigRes.json());
  if (!sig?.url || !sig.publicUrl) throw new Error("Couldn't start the upload");

  // XHR, because fetch can't report upload progress.
  await new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(new UploadCancelledError());
    const xhr = new XMLHttpRequest();
    const onAbort = () => xhr.abort();
    signal?.addEventListener("abort", onAbort, { once: true });
    const done = (fn: () => void) => {
      signal?.removeEventListener("abort", onAbort);
      fn();
    };
    xhr.open("PUT", sig.url!);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded / e.total);
    };
    xhr.onload = () =>
      done(() =>
        xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("Upload failed. Please try again.")),
      );
    xhr.onerror = () => done(() => reject(new Error("Upload failed. Check your connection and try again.")));
    xhr.onabort = () => done(() => reject(new UploadCancelledError()));
    xhr.send(file);
  });
  onProgress?.(1);
  return sig.publicUrl;
}

/** A crop drawn on the image as the browser shows it (natural size). */
export interface UploadCrop {
  x: number;
  y: number;
  width: number;
  height: number;
  displayWidth: number;
  displayHeight: number;
}

/** The part of the video to keep, in seconds. */
export interface UploadTrim {
  start: number;
  end: number;
}

export type UploadEdit = { type: "image"; crop: UploadCrop } | { type: "video"; trim: UploadTrim };

/**
 * Crops / trims an original uploaded with purpose "media-edit-source" (ffmpeg on our
 * backend) and saves the result with the user's uploads. Resolves with its URL.
 */
export async function applyUploadEdit(sourceUrl: string, edit: UploadEdit): Promise<string> {
  const res = await fetch("/api/media-edits/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sourceUrl, ...edit }),
  });
  if (!res.ok) throw new Error(await readError(res, "Couldn't edit the file. Please try again."));
  const data = unwrap<{ url?: string }>(await res.json());
  if (!data?.url) throw new Error("Couldn't edit the file. Please try again.");
  return data.url;
}
