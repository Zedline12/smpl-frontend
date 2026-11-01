/**
 * Browser-side audio helpers for the video clip builder: decode a song once,
 * draw its waveform, and cut a short window to a WAV file for upload.
 */

// Decoded songs are big (a 3-minute stereo song is ~60 MB of samples), so keep only the last one.
let cached: { key: string; buffer: Promise<AudioBuffer> } | null = null;

export function decodeAudio(src: string): Promise<AudioBuffer> {
  if (cached?.key === src) return cached.buffer;
  const buffer = (async () => {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`Could not load audio (${res.status})`);
    const data = await res.arrayBuffer();
    const ctx = new AudioContext();
    try {
      return await ctx.decodeAudioData(data);
    } finally {
      ctx.close();
    }
  })();
  cached = { key: src, buffer };
  buffer.catch(() => {
    if (cached?.key === src) cached = null;
  });
  return buffer;
}

/** Normalized (0..1) peak per bar across the whole buffer. */
export function peaksFromBuffer(buffer: AudioBuffer, bars: number): number[] {
  const channel = buffer.getChannelData(0);
  const bucket = Math.max(1, Math.floor(channel.length / bars));
  const peaks: number[] = [];
  for (let b = 0; b < bars; b++) {
    let max = 0;
    const end = Math.min(channel.length, (b + 1) * bucket);
    for (let i = b * bucket; i < end; i += 16) {
      const v = Math.abs(channel[i]);
      if (v > max) max = v;
    }
    peaks.push(max);
  }
  const top = Math.max(...peaks, 0.01);
  return peaks.map((p) => Math.max(0.06, p / top));
}

/** 16-bit PCM WAV of [startSec, endSec), at most two channels, with short fades so it doesn't click. */
export function cutToWav(buffer: AudioBuffer, startSec: number, endSec: number): Blob {
  const rate = buffer.sampleRate;
  const start = Math.max(0, Math.floor(startSec * rate));
  const end = Math.min(buffer.length, Math.floor(endSec * rate));
  const frames = Math.max(0, end - start);
  const channels = Math.min(2, buffer.numberOfChannels);
  const fade = Math.min(Math.floor(rate * 0.02), Math.floor(frames / 2));

  const bytesPerSample = 2;
  const dataSize = frames * channels * bytesPerSample;
  const view = new DataView(new ArrayBuffer(44 + dataSize));
  const writeText = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };

  writeText(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeText(8, "WAVE");
  writeText(12, "fmt ");
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, channels, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * channels * bytesPerSample, true);
  view.setUint16(32, channels * bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeText(36, "data");
  view.setUint32(40, dataSize, true);

  const data = Array.from({ length: channels }, (_, c) => buffer.getChannelData(c));
  let offset = 44;
  for (let i = 0; i < frames; i++) {
    const gain = fade ? Math.min(1, i / fade, (frames - 1 - i) / fade) : 1;
    for (let c = 0; c < channels; c++) {
      const s = Math.max(-1, Math.min(1, data[c][start + i] * gain));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += bytesPerSample;
    }
  }
  return new Blob([view], { type: "audio/wav" });
}

/** Reads a video's length from its metadata; null if it can't be loaded. */
export function readVideoDuration(url: string): Promise<number | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    const done = (value: number | null) => {
      video.removeAttribute("src");
      video.load();
      resolve(value);
    };
    video.onloadedmetadata = () =>
      done(Number.isFinite(video.duration) ? video.duration : null);
    video.onerror = () => done(null);
    video.src = url;
  });
}
