import type {
  ArtistVideoClipLocation,
  ArtistVideoClipMood,
  ArtistVideoClipScenePicks,
  ArtistVideoClipTime,
  ArtistVideoClipWeather,
} from "@/features/generation/types/models/artist-video-clip.type";

/** A scene choice shown as a 16:9 card: the thumbnail, or the gradient and emoji until it has one. */
export interface ClipSceneOption<Id extends string> {
  id: Id;
  label: string;
  emoji: string;
  /** A 16:9 image URL; empty shows the gradient with the emoji. */
  thumbnail: string;
  /** The fallback gradient (from → to). */
  accent: [string, string];
}

export const CLIP_LOCATIONS: ClipSceneOption<ArtistVideoClipLocation>[] = [
  { id: "beach", label: "Beach", emoji: "🏖️", thumbnail: "https://royal-violet-313a.smplappteam.workers.dev/generations/images/6af53e03ae8301d1c4acdef6/6b038d479c31d753383a3079-77844666-e364-4f24-9b22-2dbe72689b1c", accent: ["#38bdf8", "#f59e0b"] },
  { id: "street", label: "Street", emoji: "🏙️", thumbnail: "https://royal-violet-313a.smplappteam.workers.dev/generations/images/6af53e03ae8301d1c4acdef6/6b038d4a9c31d753383a30f4-7140ee49-c37b-4c79-9749-b15f5783b6d6", accent: ["#6366f1", "#0f172a"] },
  { id: "mountain", label: "Mountains", emoji: "🏔️", thumbnail: "https://royal-violet-313a.smplappteam.workers.dev/generations/images/6af53e03ae8301d1c4acdef6/6b038d489c31d753383a30a5-f0d795a0-506a-4e99-824e-21de4de30806", accent: ["#60a5fa", "#334155"] },
  { id: "boat", label: "Boat at sea", emoji: "⛵", thumbnail: "https://royal-violet-313a.smplappteam.workers.dev/generations/images/6af53e03ae8301d1c4acdef6/6b038d4a9c31d753383a30e0-ae0c0bb1-5758-428a-bcaf-4c47b26c9f2e", accent: ["#0ea5e9", "#1e3a8a"] },
  { id: "desert", label: "Desert", emoji: "🏜️", thumbnail: "https://royal-violet-313a.smplappteam.workers.dev/generations/images/6af53e03ae8301d1c4acdef6/6b038d4a9c31d753383a30e5-4d5b458a-5be1-404c-9e24-43cd25ea6df1", accent: ["#f59e0b", "#9a3412"] },
  { id: "rooftop", label: "Rooftop", emoji: "🏢", thumbnail: "https://royal-violet-313a.smplappteam.workers.dev/generations/images/6af53e03ae8301d1c4acdef6/6b038d4e9c31d753383a31ad-f376c951-337f-4465-8485-c7b96e2645e6", accent: ["#a78bfa", "#1e1b4b"] },
  { id: "forest", label: "Forest", emoji: "🌲", thumbnail: "https://royal-violet-313a.smplappteam.workers.dev/generations/images/6af53e03ae8301d1c4acdef6/6b038d4c9c31d753383a316b-13712ffa-66ab-4a45-868c-112a7c8d9d59", accent: ["#22c55e", "#14532d"] },
  { id: "field", label: "Flower field", emoji: "🌼", thumbnail: "https://royal-violet-313a.smplappteam.workers.dev/generations/images/6af53e03ae8301d1c4acdef6/6b038d4e9c31d753383a31b9-934697e1-0479-4c5b-881e-e4a741198c0f", accent: ["#facc15", "#65a30d"] },
  { id: "room", label: "Cozy room", emoji: "🛋️", thumbnail: "https://royal-violet-313a.smplappteam.workers.dev/generations/images/6af53e03ae8301d1c4acdef6/6b038d4f9c31d753383a31e0-162ab55e-6ed5-4ed3-97a0-cb64147533a9", accent: ["#fb923c", "#7c2d12"] },
  { id: "warehouse", label: "Warehouse", emoji: "🏭", thumbnail: "https://royal-violet-313a.smplappteam.workers.dev/generations/images/6af53e03ae8301d1c4acdef6/6b038d509c31d753383a320f-fec396cc-b9bd-4bfd-b1aa-5f0136e74a6f", accent: ["#71717a", "#18181b"] },
];

export const CLIP_WEATHER: ClipSceneOption<ArtistVideoClipWeather>[] = [
  { id: "sunny", label: "Sunny", emoji: "☀️", thumbnail: "https://royal-violet-313a.smplappteam.workers.dev/generations/images/6af53e03ae8301d1c4acdef6/6b038d519c31d753383a323e-acafde44-4c80-405c-8c43-881825401c2f", accent: ["#fde047", "#f97316"] },
  { id: "cloudy", label: "Cloudy", emoji: "☁️", thumbnail: "https://royal-violet-313a.smplappteam.workers.dev/generations/images/6af53e03ae8301d1c4acdef6/6b038d529c31d753383a3266-c516cd1f-52f5-412c-ab30-e3749197e08f", accent: ["#cbd5e1", "#475569"] },
  { id: "rainy", label: "Rainy", emoji: "🌧️", thumbnail: "https://royal-violet-313a.smplappteam.workers.dev/generations/images/6af53e03ae8301d1c4acdef6/6b038d539c31d753383a3281-d641cf7d-6b0c-4f26-877f-ef2af2265c3e", accent: ["#60a5fa", "#1e293b"] },
  { id: "foggy", label: "Foggy", emoji: "🌫️", thumbnail: "https://royal-violet-313a.smplappteam.workers.dev/generations/images/6af53e03ae8301d1c4acdef6/6b038d549c31d753383a3293-ba503cd4-1a9b-4943-b557-5a6ec9d6f0a4", accent: ["#e2e8f0", "#64748b"] },
  { id: "snowy", label: "Snowy", emoji: "❄️", thumbnail: "https://royal-violet-313a.smplappteam.workers.dev/generations/images/6af53e03ae8301d1c4acdef6/6b038d559c31d753383a32cb-22fdb389-b2d8-486f-9f4a-ddafa70be20e", accent: ["#f8fafc", "#7dd3fc"] },
  { id: "stormy", label: "Stormy", emoji: "⛈️", thumbnail: "https://royal-violet-313a.smplappteam.workers.dev/generations/images/6af53e03ae8301d1c4acdef6/6b038d579c31d753383a32ee-b5b01dc0-3e11-4049-a311-5ce141cf7922", accent: ["#6d28d9", "#0f172a"] },
];

export const CLIP_TIMES: ClipSceneOption<ArtistVideoClipTime>[] = [
  { id: "sunrise", label: "Sunrise", emoji: "🌅", thumbnail: "https://royal-violet-313a.smplappteam.workers.dev/generations/images/6af53e03ae8301d1c4acdef6/6b038d589c31d753383a32ff-64fdc73d-d50e-4572-a9d7-c3e41bfe8c22", accent: ["#f9a8d4", "#f59e0b"] },
  { id: "morning", label: "Morning", emoji: "🌤️", thumbnail: "https://royal-violet-313a.smplappteam.workers.dev/generations/images/6af53e03ae8301d1c4acdef6/6b038d589c31d753383a3312-c9d1c447-d303-44b4-b93a-0ac7a35ba941", accent: ["#bae6fd", "#38bdf8"] },
  { id: "afternoon", label: "Afternoon", emoji: "🌞", thumbnail: "https://royal-violet-313a.smplappteam.workers.dev/generations/images/6af53e03ae8301d1c4acdef6/6b038d5a9c31d753383a3350-3bdd74b6-a150-4957-8584-54e04308827d", accent: ["#fde68a", "#0ea5e9"] },
  { id: "sunset", label: "Sunset", emoji: "🌇", thumbnail: "https://royal-violet-313a.smplappteam.workers.dev/generations/images/6af53e03ae8301d1c4acdef6/6b038d5a9c31d753383a3354-add11ed1-1009-4dac-8c7f-14ae4ff2aebe", accent: ["#fb923c", "#be185d"] },
  { id: "dusk", label: "Dusk", emoji: "🌆", thumbnail: "https://royal-violet-313a.smplappteam.workers.dev/generations/images/6af53e03ae8301d1c4acdef6/6b038d5b9c31d753383a3381-f02fb618-f467-44f9-beea-d0879cf46857", accent: ["#818cf8", "#1e1b4b"] },
  { id: "night", label: "Night", emoji: "🌃", thumbnail: "https://royal-violet-313a.smplappteam.workers.dev/generations/images/6af53e03ae8301d1c4acdef6/6b038d5d9c31d753383a33af-9c3dda01-ce65-455c-86ae-374f3f405af7", accent: ["#312e81", "#020617"] },
];

type Place = Omit<ArtistVideoClipScenePicks, "mood">;

/** The place each song mood suggests. */
const MOOD_SCENES: Record<ArtistVideoClipMood, Place> = {
  calm: { location: "boat", weather: "sunny", time: "sunset" },
  cozy: { location: "room", weather: "cloudy", time: "night" },
  dreamy: { location: "field", weather: "foggy", time: "sunrise" },
  uplifting: { location: "mountain", weather: "sunny", time: "sunrise" },
  energetic: { location: "beach", weather: "sunny", time: "sunrise" },
  romantic: { location: "beach", weather: "sunny", time: "sunset" },
  sad: { location: "street", weather: "cloudy", time: "night" },
  dark: { location: "forest", weather: "foggy", time: "night" },
  aggressive: { location: "warehouse", weather: "stormy", time: "night" },
  harsh: { location: "desert", weather: "stormy", time: "afternoon" },
};

/** An uploaded song (or one with no mood): mountains, sunny, sunrise. */
export const UPLOAD_SCENE_DEFAULTS: ArtistVideoClipScenePicks = {
  location: "mountain",
  weather: "sunny",
  time: "sunrise",
  mood: "uplifting",
};

/** What a song made in the app tells us about itself (its input's vibe and prompt). */
export interface ClipSongInfo {
  moods: string[];
  /** The song's "Background" sounds (INSTRUMENTS ids, e.g. "rain"). */
  instruments: string[];
  prompt: string;
}

const isMood = (id: string): id is ArtistVideoClipMood => id in MOOD_SCENES;

/**
 * The scene picks for a song: its first mood sets the place, and rain in its Background
 * sounds (or its description) makes it rainy. Uploads get UPLOAD_SCENE_DEFAULTS.
 */
export function sceneFromSong(song: ClipSongInfo | null | undefined): ArtistVideoClipScenePicks {
  if (!song) return UPLOAD_SCENE_DEFAULTS;
  const mood = song.moods.find(isMood);
  const picks: ArtistVideoClipScenePicks = mood
    ? { ...MOOD_SCENES[mood], mood }
    : { ...UPLOAD_SCENE_DEFAULTS };
  if (song.instruments.includes("rain") || /\brain(y|ing|s)?\b/i.test(song.prompt))
    picks.weather = "rainy";
  return picks;
}

/** A media item's input → ClipSongInfo (missing fields are empty). */
export function clipSongInfo(input: Record<string, unknown> | null | undefined): ClipSongInfo {
  const vibe = (input?.vibe ?? {}) as { moods?: unknown; instruments?: unknown };
  const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
  return {
    moods: strings(vibe.moods),
    instruments: strings(vibe.instruments),
    prompt: typeof input?.prompt === "string" ? input.prompt : "",
  };
}
