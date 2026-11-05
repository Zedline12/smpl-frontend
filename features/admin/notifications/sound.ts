import type { NotificationLevel } from "./api";

// Notification tones synthesised with the Web Audio API — no audio files needed.
// Browsers only allow audio after the user has interacted with the page, so the
// AudioContext is created/resumed on the first click or key press.

let ctx: AudioContext | null = null;
let unlockInstalled = false;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

/** Call once on mount; resumes audio on the admin's first interaction. */
export function installAudioUnlock() {
  if (unlockInstalled || typeof window === "undefined") return;
  unlockInstalled = true;
  const unlock = () => {
    void getContext()?.resume();
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
}

function tone(ac: AudioContext, freq: number, start: number, duration: number, volume: number, type: OscillatorType = "sine") {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

/** critical: urgent triple beep · important: two-note chime · ordinary: soft ping */
export function playNotificationSound(level: NotificationLevel) {
  const ac = getContext();
  if (!ac || ac.state !== "running") return;
  const t = ac.currentTime + 0.01;

  if (level === "critical") {
    [0, 0.18, 0.36].forEach((offset) => tone(ac, 1046, t + offset, 0.14, 0.25, "square"));
  } else if (level === "important") {
    tone(ac, 784, t, 0.22, 0.22, "triangle");
    tone(ac, 1175, t + 0.16, 0.32, 0.22, "triangle");
  } else {
    tone(ac, 880, t, 0.35, 0.12, "sine");
  }
}
