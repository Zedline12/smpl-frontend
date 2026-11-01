import { Tempo, Vocals } from "@/features/generation/types/models/elevenlabs-music-v2-5.type";

/** A selectable chip; `styles` are the English tags it adds to the composition plan. */
export interface StyleOption<Id extends string = string> {
  id: Id;
  label: string;
  styles: string[];
  /** Shown on the Genre / Mood disc. */
  emoji?: string;
}

export const GENRES: StyleOption[] = [
  { id: "hip-hop", label: "Hip-Hop", emoji: "🎤", styles: ["hip-hop", "boom bap drums", "groovy bassline"] },
  { id: "rap", label: "Rap", emoji: "🗣️", styles: ["rap", "rhythmic rap vocals", "hard-hitting beat"] },
  { id: "trap", label: "Trap", emoji: "🔥", styles: ["trap", "808 bass", "rolling hi-hats"] },
  { id: "drill", label: "Drill", emoji: "⛓️", styles: ["drill", "sliding 808s", "dark sparse melody"] },
  { id: "rnb", label: "R&B", emoji: "💜", styles: ["r&b", "smooth soulful vocals", "lush chords"] },
  { id: "pop", label: "Pop", emoji: "🍭", styles: ["pop", "catchy hook", "polished production"] },
  { id: "rock", label: "Rock", emoji: "🎸", styles: ["rock", "electric guitars", "live drums"] },
  { id: "indie", label: "Indie", emoji: "📼", styles: ["indie", "jangly guitars", "warm lo-fi texture"] },
  { id: "edm", label: "EDM", emoji: "⚡", styles: ["edm", "festival synths", "big build-ups"] },
  { id: "house", label: "House", emoji: "🏠", styles: ["house", "four-on-the-floor kick", "groovy bass"] },
  { id: "lofi", label: "Lo-fi", emoji: "☕", styles: ["lo-fi hip-hop", "dusty drums", "mellow keys"] },
  { id: "jazz", label: "Jazz", emoji: "🎷", styles: ["jazz", "swing feel", "extended chords"] },
  { id: "afrobeats", label: "Afrobeats", emoji: "🥁", styles: ["afrobeats", "syncopated percussion", "bright melodies"] },
  { id: "reggaeton", label: "Reggaeton", emoji: "🌴", styles: ["reggaeton", "dembow rhythm", "latin pop"] },
  { id: "country", label: "Country", emoji: "🤠", styles: ["country", "acoustic guitar", "storytelling"] },
  { id: "cinematic", label: "Cinematic", emoji: "🎬", styles: ["cinematic", "orchestral", "epic"] },
  { id: "ambient", label: "Ambient", emoji: "🌌", styles: ["ambient", "evolving textures", "spacious"] },
];

export const MOODS: StyleOption[] = [
  { id: "calm", label: "Calm", emoji: "🌊", styles: ["calm", "relaxed"] },
  { id: "cozy", label: "Cozy", emoji: "🧸", styles: ["cozy", "warm", "intimate"] },
  { id: "dreamy", label: "Dreamy", emoji: "☁️", styles: ["dreamy", "ethereal"] },
  { id: "uplifting", label: "Uplifting", emoji: "🌈", styles: ["uplifting", "hopeful"] },
  { id: "energetic", label: "Energetic", emoji: "🚀", styles: ["energetic", "driving"] },
  { id: "romantic", label: "Romantic", emoji: "💘", styles: ["romantic", "tender"] },
  { id: "sad", label: "Sad", emoji: "😢", styles: ["sad", "melancholic"] },
  { id: "dark", label: "Dark", emoji: "🌑", styles: ["dark", "moody"] },
  { id: "aggressive", label: "Aggressive", emoji: "😤", styles: ["aggressive", "intense"] },
  { id: "harsh", label: "Harsh", emoji: "💢", styles: ["harsh", "gritty", "distorted"] },
];

export const TEMPOS: StyleOption<Tempo>[] = [
  { id: "slow", label: "Slow", styles: ["slow tempo", "70-85 bpm"] },
  { id: "medium", label: "Medium", styles: ["mid tempo", "90-110 bpm"] },
  { id: "fast", label: "Fast", styles: ["fast tempo", "125-150 bpm"] },
];

export const VOCALS: StyleOption<Vocals>[] = [
  { id: "male", label: "Male", styles: ["male vocals"] },
  { id: "female", label: "Female", styles: ["female vocals"] },
  { id: "duet", label: "Duet", styles: ["male and female duet vocals"] },
  { id: "choir", label: "Choir", styles: ["choir vocals"] },
  { id: "instrumental", label: "Instrumental", styles: ["instrumental"] },
];

/** Negative styles that keep a section free of singing. */
export const NO_VOCAL_STYLES = ["vocals", "lyrics", "singing"];

export const INSTRUMENTS: StyleOption[] = [
  { id: "piano", label: "Piano", styles: ["piano"] },
  { id: "808", label: "808s", styles: ["808 bass"] },
  { id: "acoustic-guitar", label: "Acoustic guitar", styles: ["acoustic guitar"] },
  { id: "electric-guitar", label: "Electric guitar", styles: ["electric guitar"] },
  { id: "strings", label: "Strings", styles: ["string section"] },
  { id: "synth-pads", label: "Synth pads", styles: ["synth pads"] },
  { id: "live-drums", label: "Live drums", styles: ["live drums"] },
  { id: "bass", label: "Bass", styles: ["bass guitar"] },
  { id: "brass", label: "Brass", styles: ["brass section"] },
  { id: "vinyl", label: "Vinyl crackle", styles: ["vinyl crackle"] },
  { id: "rain", label: "Rain ambience", styles: ["rain ambience"] },
];

export interface SectionType {
  id: string;
  label: string;
  defaultSec: number;
  /** Instrumental by default (no lyrics box shown until toggled). */
  instrumental?: boolean;
}

export const SECTION_TYPES: SectionType[] = [
  { id: "intro", label: "Intro", defaultSec: 10, instrumental: true },
  { id: "verse", label: "Verse", defaultSec: 30 },
  { id: "pre-chorus", label: "Pre-Chorus", defaultSec: 10 },
  { id: "chorus", label: "Chorus", defaultSec: 20 },
  { id: "hook", label: "Hook", defaultSec: 15 },
  { id: "bridge", label: "Bridge", defaultSec: 15 },
  { id: "drop", label: "Drop", defaultSec: 20, instrumental: true },
  { id: "breakdown", label: "Breakdown", defaultSec: 15, instrumental: true },
  { id: "outro", label: "Outro", defaultSec: 10, instrumental: true },
];

/** Song lengths offered in prompt mode, in seconds. */
export const LENGTH_PRESETS = [15, 30, 60, 90, 120, 180, 240, 300, 420, 600];

export const MAX_GENRES = 3;
export const MAX_MOODS = 3;
