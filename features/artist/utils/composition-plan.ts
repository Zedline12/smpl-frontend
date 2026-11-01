import {
  IMusicV25Input,
  ContextAdherence,
  CONTEXT_ADHERENCE,
  MusicChunk,
  MusicCompositionPlan,
  MusicLimits,
  MusicSection,
  MusicVibe,
} from "@/features/generation/types/models/elevenlabs-music-v2-5.type";
import {
  GENRES,
  INSTRUMENTS,
  MOODS,
  NO_VOCAL_STYLES,
  SECTION_TYPES,
  StyleOption,
  TEMPOS,
  VOCALS,
} from "../data/presets";

export const DEFAULT_VIBE: MusicVibe = {
  genres: [],
  moods: [],
  tempo: null,
  vocals: null,
  instruments: [],
  extraStyles: [],
  avoid: [],
};

let nextId = 0;
export const newSectionId = () => `s${Date.now().toString(36)}${(nextId++).toString(36)}`;

export function createSection(typeId: string): MusicSection {
  const type = SECTION_TYPES.find((t) => t.id === typeId);
  return {
    id: newSectionId(),
    type: type ? type.id : "custom",
    customName: type ? undefined : typeId,
    durationSec: type?.defaultSec ?? 20,
    lyrics: "",
    instrumental: type?.instrumental ?? false,
    extraStyles: [],
    adherence: "high",
  };
}

export const DEFAULT_SECTIONS = (): MusicSection[] =>
  ["intro", "verse", "chorus", "verse", "chorus", "outro"].map(createSection);

export function sectionName(section: MusicSection): string {
  if (section.type === "custom") return section.customName?.trim() || "Section";
  return SECTION_TYPES.find((t) => t.id === section.type)?.label ?? "Section";
}

export const totalSeconds = (sections: MusicSection[]) =>
  sections.reduce((sum, s) => sum + s.durationSec, 0);

export function formatDuration(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

const pick = (options: StyleOption[], ids: string[]) =>
  options.filter((o) => ids.includes(o.id)).flatMap((o) => o.styles);

/** Styles every section shares, in priority order (genre first sets the tone). */
export function vibeStyles(vibe: MusicVibe): { positive: string[]; negative: string[] } {
  const instrumental = vibe.vocals === "instrumental";
  return {
    positive: [
      ...pick(GENRES, vibe.genres),
      ...pick(MOODS, vibe.moods),
      ...(vibe.tempo ? pick(TEMPOS, [vibe.tempo]) : []),
      ...(vibe.vocals ? pick(VOCALS, [vibe.vocals]) : []),
      ...pick(INSTRUMENTS, vibe.instruments),
      ...vibe.extraStyles,
    ],
    negative: [...vibe.avoid, ...(instrumental ? NO_VOCAL_STYLES : [])],
  };
}

/** Trims, de-duplicates (case-insensitive, first wins) and caps a style list. */
function cleanStyles(styles: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of styles) {
    const style = raw.trim();
    const key = style.toLowerCase();
    if (!style || seen.has(key)) continue;
    seen.add(key);
    out.push(style);
  }
  return out.slice(0, MusicLimits.maxStylesPerList);
}

/** Vocal sections with empty lyrics stay vocal: the model improvises the words. */
export function isSectionInstrumental(vibe: MusicVibe, section: MusicSection) {
  return vibe.vocals === "instrumental" || section.instrumental;
}

export function buildCompositionPlan(
  vibe: MusicVibe,
  sections: MusicSection[],
): MusicCompositionPlan {
  const global = vibeStyles(vibe);
  return {
    chunks: sections.map((section): MusicChunk => {
      const instrumental = isSectionInstrumental(vibe, section);
      const lyrics = instrumental ? "" : section.lyrics.replace(/\r/g, "").trimEnd();
      const negative = cleanStyles([...global.negative, ...(instrumental ? NO_VOCAL_STYLES : [])]);
      return {
        text: lyrics ? `[${sectionName(section)}]\n${lyrics}` : `[${sectionName(section)}]`,
        durationMs: Math.round(section.durationSec * 1000),
        // Section-specific styles first so they survive the 50-style cap.
        positiveStyles: cleanStyles([...section.extraStyles, ...global.positive]),
        ...(negative.length > 0 && { negativeStyles: negative }),
        contextAdherence: section.adherence,
      };
    }),
  };
}

/** Recomputes the fields the API reads (styles, instrumental, plan) from the editor state. */
export function deriveMusicInput(input: IMusicV25Input): IMusicV25Input {
  return {
    ...input,
    styles: cleanStyles(vibeStyles(input.vibe).positive).slice(0, MusicLimits.maxPromptStyles),
    instrumental: input.vibe.vocals === "instrumental",
    compositionPlan: buildCompositionPlan(input.vibe, input.sections),
  };
}

export const DEFAULT_MUSIC_LENGTH_SEC = 60;

export function createMusicInput(): IMusicV25Input {
  return deriveMusicInput({
    mode: "prompt",
    prompt: "",
    musicLengthMs: DEFAULT_MUSIC_LENGTH_SEC * 1000,
    styles: [],
    instrumental: false,
    vibe: DEFAULT_VIBE,
    sections: DEFAULT_SECTIONS(),
    compositionPlan: { chunks: [] },
  });
}

/** Inline problems for one section card. */
export function sectionIssues(section: MusicSection, instrumental: boolean): string[] {
  const issues: string[] = [];
  if (section.type === "custom") {
    const name = section.customName?.trim() ?? "";
    if (!name || name.length > MusicLimits.maxSectionNameLength) {
      issues.push(`Name must be 1-${MusicLimits.maxSectionNameLength} characters`);
    }
  }
  if (!instrumental) {
    const lines = section.lyrics.split("\n");
    if (lines.length > MusicLimits.maxLinesPerChunk) {
      issues.push(`At most ${MusicLimits.maxLinesPerChunk} lines`);
    }
    if (lines.some((l) => l.length > MusicLimits.maxCharsPerLine)) {
      issues.push(`Lines can be at most ${MusicLimits.maxCharsPerLine} characters`);
    }
  }
  return issues;
}

/**
 * Loads a generated plan into the editor: the `[Name]` header becomes the section
 * type, and styles every chunk shares become song-wide extra styles.
 */
export function planToSong(
  plan: MusicCompositionPlan,
  vocals: MusicVibe["vocals"],
): { vibe: MusicVibe; sections: MusicSection[] } {
  const chunks = plan.chunks ?? [];
  const lower = (list: string[] | undefined) => (list ?? []).map((s) => s.toLowerCase());
  const shared = chunks.length
    ? (chunks[0].positiveStyles ?? []).filter((style) =>
        chunks.every((c) => lower(c.positiveStyles).includes(style.toLowerCase())),
      )
    : [];
  const sharedKeys = new Set(lower(shared));

  const sections = chunks.slice(0, MusicLimits.maxChunks).map((chunk): MusicSection => {
    const lines = (chunk.text ?? "").split("\n");
    const header = lines[0].match(/^\[(.*)\]$/)?.[1]?.trim();
    const lyrics = (header !== undefined ? lines.slice(1) : lines).join("\n").trim();
    const known = header
      ? SECTION_TYPES.find((t) => t.label.toLowerCase() === header.replace(/\s*\d+$/, "").toLowerCase())
      : undefined;
    const adherence = (CONTEXT_ADHERENCE as readonly string[]).includes(chunk.contextAdherence ?? "")
      ? (chunk.contextAdherence as ContextAdherence)
      : "high";
    return {
      id: newSectionId(),
      type: known ? known.id : "custom",
      customName: known ? undefined : header || "Section",
      durationSec: Math.min(
        MusicLimits.maxChunkSec,
        Math.max(MusicLimits.minChunkSec, Math.round((chunk.durationMs ?? 0) / 1000)),
      ),
      lyrics,
      instrumental: !lyrics,
      extraStyles: (chunk.positiveStyles ?? []).filter((s) => !sharedKeys.has(s.toLowerCase())),
      adherence,
    };
  });

  return {
    vibe: {
      ...DEFAULT_VIBE,
      vocals,
      extraStyles: shared,
      // Vocal negatives are re-added per section from the instrumental flag.
      avoid: (chunks[0]?.negativeStyles ?? []).filter(
        (s) => !NO_VOCAL_STYLES.includes(s.toLowerCase()),
      ),
    },
    sections,
  };
}
