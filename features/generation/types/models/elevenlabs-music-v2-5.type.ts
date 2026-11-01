import { z } from "zod";

/** ElevenLabs composition-plan limits for music_v2_5 (kept in sync with the backend). */
export const MusicLimits = {
  maxChunks: 30,
  minChunkSec: 3,
  maxChunkSec: 120,
  minTotalSec: 3,
  maxTotalSec: 600,
  maxStylesPerList: 50,
  maxLinesPerChunk: 30,
  maxCharsPerLine: 200,
  maxSectionNameLength: 100,
  maxPromptLength: 2000,
  maxIdeaLength: 2000,
  maxPromptStyles: 40,
  billingBlockSec: 30,
} as const;

/** "prompt": text + picked styles with a fixed length. "plan": full section-by-section plan. */
export type MusicMode = "prompt" | "plan";

export const CONTEXT_ADHERENCE = ["low", "medium", "high"] as const;
export type ContextAdherence = (typeof CONTEXT_ADHERENCE)[number];

export interface MusicChunk {
  text: string;
  durationMs: number;
  positiveStyles: string[];
  negativeStyles?: string[];
  contextAdherence?: ContextAdherence;
}

export interface MusicCompositionPlan {
  chunks: MusicChunk[];
}

export type Tempo = "slow" | "medium" | "fast";
export type Vocals = "male" | "female" | "duet" | "choir" | "instrumental";

/** The song-wide choices, applied to every section. Every one is optional. */
export interface MusicVibe {
  genres: string[];
  moods: string[];
  tempo: Tempo | null;
  vocals: Vocals | null;
  instruments: string[];
  extraStyles: string[];
  avoid: string[];
}

export interface MusicSection {
  id: string;
  /** A preset section type id, or "custom" when `customName` is used. */
  type: string;
  customName?: string;
  durationSec: number;
  lyrics: string;
  instrumental: boolean;
  extraStyles: string[];
  adherence: ContextAdherence;
}

export interface IMusicV25Input {
  mode: MusicMode;
  /** The user's description of the song (prompt mode). */
  prompt: string;
  /** Prompt mode: song length. */
  musicLengthMs: number;
  /** Prompt mode: style tags derived from the vibe. */
  styles: string[];
  /** Prompt mode: no vocals. */
  instrumental: boolean;
  vibe: MusicVibe;
  sections: MusicSection[];
  /** Plan mode: derived from vibe + sections; what the API receives. */
  compositionPlan: MusicCompositionPlan;
}

/** Returns the first problem with a plan, or null when it is within every limit. */
export function findMusicPlanError(plan: MusicCompositionPlan | undefined): string | null {
  const l = MusicLimits;
  const chunks = plan?.chunks ?? [];
  if (chunks.length === 0) return "Add at least one section";
  if (chunks.length > l.maxChunks) return `A song can have at most ${l.maxChunks} sections`;
  let totalMs = 0;
  for (const [i, chunk] of chunks.entries()) {
    const at = `Section ${i + 1}`;
    const lines = chunk.text.split("\n");
    const header = lines[0].match(/^\[(.*)\]$/)?.[1];
    if (header !== undefined && (header.length < 1 || header.length > l.maxSectionNameLength)) {
      return `${at}: the name must be 1-${l.maxSectionNameLength} characters`;
    }
    const lyricLines = header !== undefined ? lines.slice(1) : lines;
    if (lyricLines.length > l.maxLinesPerChunk) return `${at}: at most ${l.maxLinesPerChunk} lyric lines`;
    if (lyricLines.some((line) => line.length > l.maxCharsPerLine)) {
      return `${at}: lyric lines can be at most ${l.maxCharsPerLine} characters`;
    }
    if (chunk.durationMs < l.minChunkSec * 1000 || chunk.durationMs > l.maxChunkSec * 1000) {
      return `${at}: length must be ${l.minChunkSec}-${l.maxChunkSec} seconds`;
    }
    if (chunk.positiveStyles.length === 0) return `${at}: pick at least one style`;
    if (
      chunk.positiveStyles.length > l.maxStylesPerList ||
      (chunk.negativeStyles?.length ?? 0) > l.maxStylesPerList
    ) {
      return `${at}: at most ${l.maxStylesPerList} styles`;
    }
    totalMs += chunk.durationMs;
  }
  if (totalMs < l.minTotalSec * 1000 || totalMs > l.maxTotalSec * 1000) {
    return `The song must be ${l.minTotalSec} seconds to ${l.maxTotalSec / 60} minutes long`;
  }
  return null;
}

/** Returns the first problem with the input for its mode, or null. */
export function findMusicInputError(input: IMusicV25Input): string | null {
  if (input.prompt.length > MusicLimits.maxPromptLength) {
    return `The description can be at most ${MusicLimits.maxPromptLength} characters`;
  }
  if (input.mode === "plan") return findMusicPlanError(input.compositionPlan);
  if (!input.prompt.trim() && input.styles.length === 0) {
    return "Describe your song or pick a genre, mood or instrument";
  }
  const sec = input.musicLengthMs / 1000;
  if (sec < MusicLimits.minTotalSec || sec > MusicLimits.maxTotalSec) {
    return `The song must be ${MusicLimits.minTotalSec} seconds to ${MusicLimits.maxTotalSec / 60} minutes long`;
  }
  return null;
}

export const musicV25ValidationSchema = z.custom<IMusicV25Input>(
  (input) => findMusicInputError(input as IMusicV25Input) === null,
);
