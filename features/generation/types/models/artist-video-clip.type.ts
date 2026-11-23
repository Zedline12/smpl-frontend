import { z } from "zod";

/**
 * Artist Video Clip (Smpl), two types:
 * - "lipsync": OmniHuman v2 makes the character from one image sing the song part, either
 *   the photo as is ("original") or a Nano Banana 16:9 scene made from it ("song").
 *   Lyrics can be burned in at the bottom.
 * - "lyrics": no character; a picture (the background photo, or a scene from the picks)
 *   slowly zooms in with the song part and its lyrics.
 * The scene picks describe generated scenes; a background image replaces location,
 * weather and time. Kept in sync with the backend.
 */
export const ArtistVideoClipInputConst = {
  types: ["lipsync", "lyrics"] as const,
  scenes: ["song", "original"] as const,
  locations: [
    "beach",
    "street",
    "mountain",
    "boat",
    "desert",
    "rooftop",
    "forest",
    "field",
    "room",
    "warehouse",
  ] as const,
  weathers: ["sunny", "cloudy", "rainy", "foggy", "snowy", "stormy"] as const,
  times: ["sunrise", "morning", "afternoon", "sunset", "dusk", "night"] as const,
  /** The song-creation moods (MOODS in features/artist/data/presets.ts). */
  moods: [
    "calm",
    "cozy",
    "dreamy",
    "uplifting",
    "energetic",
    "romantic",
    "sad",
    "dark",
    "aggressive",
    "harsh",
  ] as const,
  lyricsPositions: ["center", "bottom"] as const,
  /** The lyric fonts; the first is the default. */
  /** Text size, a scale on the base size (same numbers as the backend). */
  lyricsSizes: ["small", "medium", "large", "xl"] as const,
  lyricsFonts: ["anton", "bebas", "marker", "script", "comic", "classic"] as const,
  maxImages: 1,
  minSeconds: 4,
  maxSeconds: 30,
  /** Lyrics type: one Kling 3 text-to-video, at most 15 s. */
  lyricsMaxSeconds: 15,
  /** The "Describe the place" text (same as the backend). */
  maxPlacePromptLength: 500,
  /** Lyrics text opacity, % (same as the backend). */
  lyricsOpacity: { min: 10, max: 100, default: 100 },
  /** How much darker the video is under the lyrics, %. */
  backgroundDim: { min: 0, max: 80, lyricsDefault: 35, lipsyncDefault: 0 },
  maxPromptLength: 2000,
};

type Of<T extends readonly string[]> = T[number];
export type ArtistVideoClipType = Of<typeof ArtistVideoClipInputConst.types>;
export type ArtistVideoClipScene = Of<typeof ArtistVideoClipInputConst.scenes>;
export type ArtistVideoClipLocation = Of<typeof ArtistVideoClipInputConst.locations>;
export type ArtistVideoClipWeather = Of<typeof ArtistVideoClipInputConst.weathers>;
export type ArtistVideoClipTime = Of<typeof ArtistVideoClipInputConst.times>;
export type ArtistVideoClipMood = Of<typeof ArtistVideoClipInputConst.moods>;
export type ArtistVideoClipLyricsPosition = Of<typeof ArtistVideoClipInputConst.lyricsPositions>;
export type ArtistVideoClipLyricsSize = Of<typeof ArtistVideoClipInputConst.lyricsSizes>;
export type ArtistVideoClipLyricsFont = Of<typeof ArtistVideoClipInputConst.lyricsFonts>;

/** The four scene picks (location, weather, time: admin-editable option keys). */
export interface ArtistVideoClipScenePicks {
  location: string;
  weather: string;
  time: string;
  mood: ArtistVideoClipMood;
}

export interface IArtistVideoClipInput extends ArtistVideoClipScenePicks {
  type: ArtistVideoClipType;
  /** Generated scenes only. */
  prompt: string;
  /** Lip sync: the character image (one). Lyrics: empty. */
  images: string[];
  /** Uploaded on Generate: the chosen song part (also the clip length). */
  audioUrl: string;
  /** Lip sync: "song" (default), a generated scene; "original", the photo as is. */
  scene: ArtistVideoClipScene;
  /** The place in the user's own words, instead of location, weather and time. */
  placePrompt: string;
  /** The place instead of location, weather and time (generated scenes, Lyrics). */
  backgroundImage: string | null;
  /** Lyrics type: a ready-made background video (its id) instead of generating one. */
  backgroundVideoId: string | null;
  /** Lip sync: burn the lyrics in at the bottom. Lyrics: always on. */
  lyrics: boolean;
  /** Lyrics type: where the lines sit. */
  lyricsPosition: ArtistVideoClipLyricsPosition;
  /** The lyrics text opacity, 10-100 % (either type). */
  lyricsOpacity: number;
  /** Darkens the video under the lyrics, 0-80 % (Lyrics default 35, lip sync 0). */
  backgroundDim: number | null;
  /** The lyrics text size (either type). */
  lyricsSize: ArtistVideoClipLyricsSize;
  /** The lyrics font (either type). */
  lyricsFont: ArtistVideoClipLyricsFont;
  /** The chosen song part's length; only used for the price preview. */
  duration: number;
}

const c = ArtistVideoClipInputConst;
/** An option key (admins add picks in the Catalog). */
const PICK_KEY = /^[a-z0-9-]{1,40}$/;
export const artistVideoClipValidationSchema = z
  .object({
    type: z.enum(c.types).default("lipsync"),
    prompt: z.string().max(c.maxPromptLength).optional(),
    // Older saved inputs may have up to 3 images: keep the first.
    images: z.preprocess(
      (v) => (Array.isArray(v) ? v.slice(0, c.maxImages) : v),
      z.array(z.string().url()).max(c.maxImages),
    ),
    audioUrl: z.string().url().nonempty(),
    scene: z.enum(c.scenes).default("song"),
    location: z.string().regex(PICK_KEY).default("mountain"),
    weather: z.string().regex(PICK_KEY).default("sunny"),
    time: z.string().regex(PICK_KEY).default("sunrise"),
    mood: z.enum(c.moods).default("uplifting"),
    backgroundImage: z.string().url().nullable().optional(),
    placePrompt: z.string().max(c.maxPlacePromptLength).optional(),
    backgroundVideoId: z.string().nullable().optional(),
    lyrics: z.boolean().default(true),
    lyricsPosition: z.enum(c.lyricsPositions).default("center"),
    lyricsFont: z.enum(c.lyricsFonts).default("anton"),
    lyricsSize: z.enum(c.lyricsSizes).default("medium"),
    lyricsOpacity: z.number().min(c.lyricsOpacity.min).max(c.lyricsOpacity.max).default(100),
    backgroundDim: z.number().min(c.backgroundDim.min).max(c.backgroundDim.max).nullable().optional(),
    duration: z.number().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.type === "lipsync" && v.images.length < 1)
      ctx.addIssue({ code: "custom", path: ["images"], message: "Add your character" });
    if (v.type === "lyrics" && (v.duration ?? 0) > c.lyricsMaxSeconds)
      ctx.addIssue({
        code: "custom",
        path: ["duration"],
        message: `A lyrics video can be at most ${c.lyricsMaxSeconds} seconds`,
      });
  }) as unknown as z.ZodType<IArtistVideoClipInput>;
