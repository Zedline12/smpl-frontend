import {
  DEFAULT_VIDEO_TYPE,
  HOST_TO_VIDEO_TYPE,
  LANGUAGES,
  RATIOS,
  VIDEO_TYPES,
} from "./constants";

/**
 * Accepts "youtube.com/watch?v=x" as well as a full URL and always returns one
 * *with* a scheme — the DTO uses @IsUrl({ require_protocol: true }).
 * Returns null for anything that isn't a plausible http(s) URL.
 */
export function normalizeVideoUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const candidate = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Maps a URL's host to its videoType, falling back to 1 (remote file). */
export function detectVideoType(url: string): number {
  let host: string;
  try {
    host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return DEFAULT_VIDEO_TYPE;
  }

  const match = HOST_TO_VIDEO_TYPE.find(
    (entry) => host === entry.host || host.endsWith(`.${entry.host}`),
  );
  return match?.value ?? DEFAULT_VIDEO_TYPE;
}

export function videoTypeLabel(value: number): string {
  return VIDEO_TYPES.find((type) => type.value === value)?.label ?? "Video";
}

export function ratioLabel(value: number | null): string {
  if (value === null) return "9:16";
  return RATIOS.find((ratio) => ratio.value === value)?.label ?? "9:16";
}

export function languageLabel(value: string): string {
  return LANGUAGES.find((lang) => lang.value === value)?.label ?? value;
}

/** Milliseconds → "m:ss". Clips are short, so "0:45" reads better than "45s". */
export function formatClipDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "0:00";
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * `viralScore` arrives as a string of unknown format ("85", "8.5", "85%").
 * Returns a 0-100 number, or null when it can't be read.
 */
export function parseViralScore(raw: string | null | undefined): number | null {
  if (raw === null || raw === undefined) return null;
  const parsed = Number.parseFloat(String(raw).replace("%", "").trim());
  if (!Number.isFinite(parsed)) return null;
  // Some providers report 0-10 rather than 0-100.
  const normalized = parsed > 0 && parsed <= 10 ? parsed * 10 : parsed;
  return Math.max(0, Math.min(100, Math.round(normalized)));
}
