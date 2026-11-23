"use client";
import { useQuery } from "@tanstack/react-query";
import {
  CLIP_LOCATIONS,
  CLIP_TIMES,
  CLIP_WEATHER,
  type ClipSceneOption,
} from "../data/clip-scene";

/** A ready-made Lyrics background video (admin list). */
export interface ClipBackgroundVideo {
  id: string;
  title: string;
  videoUrl: string;
  thumbnail: string;
  durationSec: number;
  location: string;
  weather: string;
  time: string;
  mood: string;
}

export interface ClipScenes {
  locations: ClipSceneOption<string>[];
  weathers: ClipSceneOption<string>[];
  times: ClipSceneOption<string>[];
  videos: ClipBackgroundVideo[];
}

/** Until the list loads (or if it fails): the built-in picks, no videos. */
const FALLBACK: ClipScenes = {
  locations: CLIP_LOCATIONS,
  weathers: CLIP_WEATHER,
  times: CLIP_TIMES,
  videos: [],
};

async function fetchClipScenes(): Promise<ClipScenes> {
  const res = await fetch("/api/artist-clip-scenes");
  const json = await res.json().catch(() => null);
  if (!res.ok || !json) throw new Error(json?.error ?? "Couldn't load the clip scenes");
  const fix = (list: ClipSceneOption<string>[] | undefined, fallback: ClipSceneOption<string>[]) =>
    list?.length
      ? list.map((o) => ({
          ...o,
          emoji: o.emoji || "🎬",
          accent: (o.accent?.length === 2 ? o.accent : ["#6366f1", "#0f172a"]) as [string, string],
        }))
      : fallback;
  return {
    locations: fix(json.locations, CLIP_LOCATIONS),
    weathers: fix(json.weathers, CLIP_WEATHER),
    times: fix(json.times, CLIP_TIMES),
    videos: json.videos ?? [],
  };
}

/** The Location / Weather / Time picks and ready-made videos, edited in the admin Catalog. */
export function useClipScenes(): ClipScenes {
  const { data } = useQuery({
    queryKey: ["artist-clip-scenes"],
    queryFn: fetchClipScenes,
    staleTime: 60_000,
  });
  return data ?? FALLBACK;
}
