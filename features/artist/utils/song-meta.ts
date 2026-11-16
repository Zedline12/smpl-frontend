import { Media } from "@/features/media/types/media";
import { Template } from "@/features/templates/types";
import { GENRES, MOODS } from "../data/presets";
import type { Track } from "../stores/useArtistPlayerStore";

/** Cover gradients for songs (they have no artwork); picked from the song's id. */
const COVERS = [
  ["#7c3aed", "#9d174d"],
  ["#38bdf8", "#312e81"],
  ["#f97316", "#4d7c0f"],
  ["#ec4899", "#b91c1c"],
  ["#34d399", "#155e75"],
  ["#facc15", "#3f6212"],
  ["#6b41ff", "#ea4bff"],
  ["#a78bfa", "#1e3a8a"],
] as const;

function hash(text: string) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function songCover(id: string): string {
  const [from, to] = COVERS[hash(id) % COVERS.length];
  return `radial-gradient(120% 80% at 20% 0%, rgba(255,255,255,0.18), transparent 55%), linear-gradient(160deg, ${from}, ${to})`;
}

interface SongInput {
  prompt?: string;
  mode?: string;
  vibe?: { genres?: string[]; moods?: string[] };
}

const labels = (options: { id: string; label: string }[], ids: unknown) =>
  Array.isArray(ids) ? options.filter((o) => ids.includes(o.id)).map((o) => o.label) : [];

/** "A cozy late-night rap about…" → a short title; else from the genre. */
export function songTitle(input: SongInput | null | undefined): string {
  const prompt = typeof input?.prompt === "string" ? input.prompt.trim() : "";
  if (prompt && input?.mode !== "plan") {
    if (prompt.length <= 36) return prompt;
    const cut = prompt.slice(0, 36);
    return `${cut.slice(0, cut.lastIndexOf(" ") > 16 ? cut.lastIndexOf(" ") : 36)}…`;
  }
  const genre = labels(GENRES, input?.vibe?.genres)[0];
  return genre ? `${genre} track` : "Untitled song";
}

/** "Lo-fi · Chill": the song's first genre and mood. */
export function songSubtitle(input: SongInput | null | undefined): string {
  const parts = [labels(GENRES, input?.vibe?.genres)[0], labels(MOODS, input?.vibe?.moods)[0]].filter(Boolean);
  return parts.length ? parts.join(" · ") : "Smpl Artist";
}

export function mediaToTrack(m: Media): Track {
  const input = m.input as SongInput;
  return {
    id: m.id,
    url: m.url,
    title: songTitle(input),
    subtitle: songSubtitle(input),
    cover: songCover(m.id),
    mediaId: m.id,
    liked: !!m.liked,
  };
}

/** Song templates keep their audio file in `videos`. */
export function templateToTrack(t: Template): Track | null {
  const url = t.videos[t.videos.length - 1];
  if (!url) return null;
  const input = (t.input ?? t.generation?.input ?? null) as SongInput | null;
  return { id: t.id, url, title: songTitle(input), subtitle: songSubtitle(input), cover: songCover(t.id) };
}
