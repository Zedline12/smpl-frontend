"use client";
import { RefObject, useEffect, useState } from "react";

const peaksCache = new Map<string, number[]>();
const pending = new Map<string, Promise<number[]>>();

/** Stable, wave-shaped placeholder peaks so a card never looks empty. */
function pseudoPeaks(seed: string, bars: number): number[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return Array.from({ length: bars }, (_, i) => {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    const noise = ((h >>> 0) % 1000) / 1000;
    const envelope = 0.45 + 0.35 * Math.sin((i / bars) * Math.PI);
    return Math.min(1, Math.max(0.12, envelope * (0.55 + noise * 0.6)));
  });
}

async function decodePeaks(url: string, bars: number): Promise<number[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load audio (${res.status})`);
  const data = await res.arrayBuffer();
  const ctx = new AudioContext();
  try {
    const audio = await ctx.decodeAudioData(data);
    const channel = audio.getChannelData(0);
    const bucket = Math.max(1, Math.floor(channel.length / bars));
    const peaks: number[] = [];
    for (let b = 0; b < bars; b++) {
      let max = 0;
      const end = Math.min(channel.length, (b + 1) * bucket);
      // Sampling every 16th value is plenty for a bar height and keeps long songs fast.
      for (let i = b * bucket; i < end; i += 16) {
        const v = Math.abs(channel[i]);
        if (v > max) max = v;
      }
      peaks.push(max);
    }
    const top = Math.max(...peaks, 0.01);
    return peaks.map((p) => Math.max(0.06, p / top));
  } finally {
    ctx.close();
  }
}

function loadPeaks(url: string, bars: number): Promise<number[]> {
  const key = `${bars}:${url}`;
  const cached = peaksCache.get(key);
  if (cached) return Promise.resolve(cached);
  let job = pending.get(key);
  if (!job) {
    job = decodePeaks(url, bars)
      .then((peaks) => {
        peaksCache.set(key, peaks);
        return peaks;
      })
      .finally(() => pending.delete(key));
    pending.set(key, job);
  }
  return job;
}

/**
 * Real waveform peaks (0..1) for an audio URL, decoded once the element is near
 * the viewport. Until then, or if decoding fails, returns placeholder peaks.
 */
export function useWaveformPeaks(
  url: string,
  bars: number,
  containerRef: RefObject<Element | null>,
): number[] {
  const [peaks, setPeaks] = useState<number[]>(
    () => peaksCache.get(`${bars}:${url}`) ?? pseudoPeaks(url, bars),
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el || peaksCache.has(`${bars}:${url}`)) return;
    let cancelled = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        loadPeaks(url, bars)
          .then((real) => !cancelled && setPeaks(real))
          .catch(() => undefined);
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [url, bars, containerRef]);

  return peaks;
}
