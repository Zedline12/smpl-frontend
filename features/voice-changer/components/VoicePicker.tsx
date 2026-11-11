"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { AudioLines, Check, Loader2, Mic, Pause, Play, SlidersHorizontal, X } from "lucide-react";
import { RequirementTag, SlotIcon } from "@/components/CreateSidebar";
import { cn } from "@/lib/utils";
import type { VoiceChangerVoice } from "@/features/generation/types/models/voice-changer.type";

async function fetchVoices(): Promise<VoiceChangerVoice[]> {
  const res = await fetch("/api/generation/voice-changer/voices");
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error || "Couldn't load voices");
  return (json?.data ?? json) as VoiceChangerVoice[];
}

export function useVoiceChangerVoices() {
  return useQuery({ queryKey: ["voice-changer-voices"], queryFn: fetchVoices, staleTime: 60 * 60 * 1000 });
}

/** "Female", "Male"… */
function genderLabel(v: VoiceChangerVoice) {
  return v.gender === "female" ? "Female" : v.gender === "male" ? "Male" : "Neutral";
}

/** "Young woman", "Older man"… */
export function voiceTag(v: VoiceChangerVoice) {
  const who = v.gender === "female" ? "woman" : v.gender === "male" ? "man" : "voice";
  const age = v.age === "young" ? "Young" : v.age === "old" ? "Older" : "Adult";
  return `${age} ${who}`;
}

const ACCENT = "var(--primary)";

/** One colour per voice, so voices are easy to tell apart at a glance. */
const ORB_GRADIENTS = [
  ["#f5d36b", "#b8860b"],
  ["#ffcf8a", "#c96b1d"],
  ["#ffe2a8", "#d99a3a"],
  ["#6ff2c4", "#14a37f"],
  ["#ffd27a", "#f08c1a"],
  ["#e9a24a", "#9a4f12"],
  ["#7fb2ff", "#2c5fd8"],
  ["#7ff0e0", "#1aa6a0"],
  ["#ffe08a", "#d6a11f"],
  ["#c79bff", "#6d3fd6"],
  ["#ff9db5", "#d63b6e"],
  ["#9ef07a", "#3f9a1f"],
  ["#ffb38a", "#e0532b"],
  ["#8ad8ff", "#1f84c7"],
  ["#f7f08a", "#b3a51a"],
  ["#ff8ad1", "#b52f8f"],
  ["#a8b8ff", "#4a5bd6"],
  ["#ffc9e0", "#d06c98"],
  ["#b5f5d0", "#2f9a6a"],
  ["#d6d6d6", "#6b6b6b"],
] as const;

function orbStyle(index: number) {
  const [a, b] = ORB_GRADIENTS[index % ORB_GRADIENTS.length];
  return { background: `radial-gradient(circle at 30% 25%, ${a}, ${b} 75%)` };
}

/** Bar heights (0..1) that look like a voice clip, the same every time for a voice. */
function waveform(seed: string, bars = 34): number[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const out: number[] = [];
  for (let i = 0; i < bars; i++) {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    const noise = ((h ^= h >>> 16) >>> 0) / 4294967295;
    const envelope = Math.sin((Math.PI * (i + 0.5)) / bars) * 0.55 + 0.35;
    out.push(Math.max(0.12, Math.min(1, envelope * (0.45 + noise * 0.75))));
  }
  return out;
}

// One sample plays at a time across the page.
const player: { current: HTMLAudioElement | null } = { current: null };
function stopSample() {
  player.current?.pause();
  player.current = null;
}
function startSample(url: string): HTMLAudioElement {
  stopSample();
  const audio = new Audio(url);
  player.current = audio;
  return audio;
}

type Filter = "all" | "female" | "male" | "young" | "older";
const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All voices" },
  { key: "female", label: "Female" },
  { key: "male", label: "Male" },
  { key: "young", label: "Young" },
  { key: "older", label: "Mature" },
];

// ─── sidebar button ───────────────────────────────────────────────────────────

/** "Pick a voice" button for the sidebar; opens the voice menu. */
export function VoicePickerButton({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  // Stable, so the menu's effect (which stops the sample) doesn't re-run on every render.
  const close = useCallback(() => setOpen(false), []);
  const { data: voices } = useVoiceChangerVoices();
  const index = voices?.findIndex((v) => v.id === value) ?? -1;
  const selected = index >= 0 && voices ? voices[index] : null;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative flex w-full flex-col items-center overflow-hidden rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.035] px-4 pt-7 pb-5 text-center transition-colors hover:border-white/25 hover:bg-white/[0.05]"
      >
        <RequirementTag />
        {selected ? (
          <span className="size-10 rounded-full shadow-inner transition-transform group-hover:scale-105" style={orbStyle(index)} />
        ) : (
          <SlotIcon>
            <AudioLines className="size-4" />
          </SlotIcon>
        )}
        <span className="mt-3 text-[14px] font-bold text-white">{selected ? selected.name : "Pick a voice"}</span>
        <span className="mt-1 text-[12px] leading-snug text-white/45">
          {selected ? `${voiceTag(selected)} · ${selected.accent} · tap to change` : "Choose a preset voice for your clip"}
        </span>
      </button>
      {open && (
        <VoiceMenu
          value={value}
          onChange={(id) => {
            onChange(id);
            setOpen(false);
          }}
          onClose={close}
        />
      )}
    </div>
  );
}

// ─── side menu ────────────────────────────────────────────────────────────────

function VoiceMenu({
  value,
  onChange,
  onClose,
}: {
  value: string;
  onChange: (id: string) => void;
  onClose: () => void;
}) {
  const { data: voices, isLoading, error } = useVoiceChangerVoices();
  const [filter, setFilter] = useState<Filter>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [pending, setPending] = useState(value);
  const [playing, setPlaying] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Escape closes; stop the sample when the menu closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      stopSample();
    };
  }, [onClose]);

  const indexed = useMemo(() => (voices ?? []).map((v, i) => ({ v, i })), [voices]);
  const shown = indexed.filter(({ v }) => {
    if (filter === "female" || filter === "male") return v.gender === filter;
    if (filter === "young") return v.age === "young";
    if (filter === "older") return v.age !== "young";
    return true;
  });
  const playingVoice = voices?.find((v) => v.id === playing);
  const pendingIndex = indexed.find(({ v }) => v.id === pending);

  const toggleSample = (v: VoiceChangerVoice) => {
    if (!v.previewUrl) return;
    if (playing === v.id) {
      stopSample();
      setPlaying(null);
      return;
    }
    const audio = startSample(v.previewUrl);
    setLoadingId(v.id);
    setProgress(0);
    audio.onplaying = () => {
      setLoadingId(null);
      setPlaying(v.id);
    };
    audio.ontimeupdate = () => setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
    audio.onended = audio.onpause = () => {
      setPlaying((cur) => (cur === v.id ? null : cur));
      setProgress(0);
    };
    audio.onerror = () => {
      setLoadingId(null);
      setPlaying(null);
    };
    audio.play().catch(() => setLoadingId(null));
  };

  return createPortal(
    <div className="fixed inset-0 z-[80] flex justify-end">
      <style>{`
        @keyframes vm-slide { from { transform: translateX(32px); opacity: 0 } to { transform: none; opacity: 1 } }
        @keyframes vm-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes vm-bar { 0%, 100% { transform: scaleY(.45) } 50% { transform: scaleY(1) } }
        @keyframes vm-float { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-5px) } }
      `}</style>
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        style={{ animation: "vm-fade .2s ease-out" }}
        onClick={onClose}
      />

      <aside
        role="dialog"
        aria-label="Pick a voice"
        className="relative flex h-full w-full max-w-[680px] flex-col overflow-hidden border-l border-white/[0.08] bg-[#121316] shadow-2xl"
        style={{ animation: "vm-slide .28s cubic-bezier(.2,.8,.2,1)" }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/10 hover:text-white"
        >
          <X className="size-4" />
        </button>

        {/* Hero */}
        <div className="relative flex shrink-0 items-center gap-4 overflow-hidden px-7 pt-8 pb-7">
          <div
            className="pointer-events-none absolute -top-24 right-10 size-72 rounded-full opacity-20 blur-3xl"
            style={{ background: ACCENT }}
          />
          <div className="relative z-[1] min-w-0 flex-1">
            <h2 className="text-[26px] leading-tight font-black tracking-tight text-white uppercase sm:text-[30px]">
              Pick a voice
            </h2>
            <p className="mt-2 max-w-[260px] text-[13px] leading-relaxed text-white/55">
              Hear each voice, then choose who speaks in your video. Same words and timing, new voice.
            </p>
            <div
              className="mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_4px_0_rgba(0,0,0,.35)]"
              style={{ background: ACCENT }}
            >
              <Mic className="size-4" />
              {voices ? `${voices.length} voices` : "Voices"}
            </div>
          </div>
          <HeroVisual voices={voices ?? []} playing={playingVoice} />
        </div>

        {/* Voices */}
        <div className="flex min-h-0 flex-1 flex-col rounded-t-2xl border-t border-white/[0.06] bg-[#191a1e]">
          <div className="relative flex shrink-0 items-center justify-between px-5 pt-4 pb-3">
            <p className="text-[14px] font-semibold text-white/60">
              Voices
              {filter !== "all" && (
                <span className="ml-2 text-white/35">· {FILTERS.find((f) => f.key === filter)?.label}</span>
              )}
            </p>
            <button
              onClick={() => setFilterOpen((o) => !o)}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[13px] font-semibold transition-colors",
                filterOpen || filter !== "all"
                  ? "border-white/25 bg-white/[0.08] text-white"
                  : "border-white/10 bg-white/[0.04] text-white/75 hover:text-white",
              )}
            >
              <SlidersHorizontal className="size-3.5" /> Filter
            </button>
            {filterOpen && (
              <div className="absolute top-full right-5 z-10 -mt-1 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#222327] p-1 shadow-xl">
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => {
                      setFilter(f.key);
                      setFilterOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[13px] text-white/80 hover:bg-white/[0.06]"
                  >
                    {f.label}
                    {filter === f.key && <Check className="size-3.5" style={{ color: ACCENT }} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-1.5 pb-5">
            {isLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="h-[118px] animate-pulse rounded-2xl bg-white/[0.04]" />
                ))}
              </div>
            ) : error ? (
              <p className="py-10 text-center text-sm text-red-400">{(error as Error).message}</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {shown.map(({ v, i }) => (
                  <VoiceCard
                    key={v.id}
                    voice={v}
                    index={i}
                    selected={pending === v.id}
                    playing={playing === v.id}
                    loading={loadingId === v.id}
                    progress={playing === v.id ? progress : 0}
                    onSelect={() => setPending(v.id)}
                    onToggle={() => toggleSample(v)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex shrink-0 items-center gap-3 border-t border-white/[0.06] bg-[#16171a] px-5 py-3.5">
            {pendingIndex ? (
              <>
                <span className="size-8 shrink-0 rounded-full" style={orbStyle(pendingIndex.i)} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-white">{pendingIndex.v.name}</span>
                  <span className="block truncate text-[11px] text-white/45">
                    {voiceTag(pendingIndex.v)} · {pendingIndex.v.accent}
                  </span>
                </span>
              </>
            ) : (
              <span className="flex-1 text-[13px] text-white/45">Tap a voice to choose it</span>
            )}
            <button
              disabled={!pending}
              onClick={() => onChange(pending)}
              className="rounded-xl px-5 py-2.5 text-[13px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-30"
              style={{ background: ACCENT }}
            >
              Use this voice
            </button>
          </div>
        </div>
      </aside>
    </div>,
    document.body,
  );
}

const HERO_SPOTS = [
  { top: "6%", left: "34%", size: 26, delay: "0s" },
  { top: "70%", left: "8%", size: 34, delay: ".6s" },
  { top: "10%", left: "86%", size: 28, delay: "1.1s" },
  { top: "76%", left: "88%", size: 24, delay: ".3s" },
];
const HERO_LEFT = waveform("hero-left", 12);
const HERO_RIGHT = waveform("hero-right", 12);

/** Mic with waveforms either side and a few voices floating around it. */
function HeroVisual({ voices, playing }: { voices: VoiceChangerVoice[]; playing?: VoiceChangerVoice }) {
  return (
    <div className="relative hidden h-[160px] w-[270px] shrink-0 sm:block">
      <div className="absolute inset-0 flex items-center justify-center">
        <Bars heights={HERO_LEFT} active={!!playing} />
        <div
          className="mx-3 flex size-[86px] shrink-0 items-center justify-center rounded-full shadow-[0_0_40px_color-mix(in_srgb,var(--primary)_45%,transparent)]"
          style={{ background: ACCENT }}
        >
          <Mic className="size-8 text-white" />
        </div>
        <Bars heights={HERO_RIGHT} active={!!playing} />
      </div>
      {HERO_SPOTS.map((s, k) =>
        voices[k * 4] ? (
          <span
            key={k}
            className="absolute rounded-full border-2 border-[#121316]"
            style={{
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              animation: `vm-float 3.4s ease-in-out ${s.delay} infinite`,
              ...orbStyle(k * 4),
            }}
          />
        ) : null,
      )}
      <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-[#1d1e22] px-3 py-1.5 text-[11px] font-medium whitespace-nowrap text-white/85">
        <span className={cn("size-2 rounded-full", playing ? "animate-pulse bg-red-500" : "bg-white/30")} />
        {playing ? `Previewing ${playing.name}` : "Tap play to preview"}
      </div>
    </div>
  );
}

function Bars({ heights, active }: { heights: number[]; active: boolean }) {
  return (
    <div className="flex h-16 items-center gap-[3px]">
      {heights.map((h, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-white/35"
          style={{
            height: `${Math.round(h * 100)}%`,
            animation: active ? `vm-bar ${0.7 + (i % 4) * 0.15}s ease-in-out ${i * 0.05}s infinite` : undefined,
          }}
        />
      ))}
    </div>
  );
}

function VoiceCard({
  voice,
  index,
  selected,
  playing,
  loading,
  progress,
  onSelect,
  onToggle,
}: {
  voice: VoiceChangerVoice;
  index: number;
  selected: boolean;
  playing: boolean;
  loading: boolean;
  progress: number;
  onSelect: () => void;
  onToggle: () => void;
}) {
  const bars = useMemo(() => waveform(voice.id), [voice.id]);
  const played = Math.round(progress * bars.length);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "relative cursor-pointer rounded-2xl border bg-[#141518] p-1.5 transition-all",
        selected ? "border-transparent" : "border-white/[0.06] hover:border-white/20",
      )}
      style={selected ? { boxShadow: `0 0 0 2px ${ACCENT}` } : undefined}
    >
      {selected && (
        <span
          className="absolute -top-1.5 -right-1.5 z-[1] flex size-5 items-center justify-center rounded-full text-white"
          style={{ background: ACCENT }}
        >
          <Check className="size-3" strokeWidth={3} />
        </span>
      )}
      <div className="flex items-center gap-3 rounded-xl bg-[#202125] p-2.5">
        <span
          className="size-10 shrink-0 rounded-full shadow-[inset_0_-4px_8px_rgba(0,0,0,.25)]"
          style={orbStyle(index)}
        />
        <span className="min-w-0">
          <span className="block truncate text-[14px] font-bold text-white">{voice.name}</span>
          <span className="block truncate text-[12px] text-white/45">{genderLabel(voice)}</span>
        </span>
      </div>
      <div className="flex items-center gap-2 px-1.5 pt-2.5 pb-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          disabled={!voice.previewUrl}
          aria-label={playing ? `Pause ${voice.name}` : `Play ${voice.name} sample`}
          title={voice.previewUrl ? "Hear a sample" : "No sample available"}
          className="flex size-6 shrink-0 items-center justify-center text-white transition-transform hover:scale-110 disabled:opacity-30"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : playing ? (
            <Pause className="size-4 fill-white" />
          ) : (
            <Play className="size-4 fill-white" />
          )}
        </button>
        <div className="flex h-7 min-w-0 flex-1 items-center gap-[2px]">
          {bars.map((h, i) => (
            <span
              key={i}
              className="min-w-[2px] flex-1 rounded-full transition-colors"
              style={{
                height: `${Math.round(h * 100)}%`,
                background: playing && i < played ? ACCENT : "rgba(255,255,255,.28)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
