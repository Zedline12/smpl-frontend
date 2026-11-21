import { create } from "zustand";
import type { AudioWindow } from "../components/AudioWindowPicker";

/**
 * The video clip's chosen song part and its upload state. In a store, not the hook,
 * because the desktop panel and the phone dock are both mounted and must agree.
 */
interface ClipAudioState {
  audio: AudioWindow | null;
  preparing: boolean;
  setAudio: (audio: AudioWindow | null) => void;
  setPreparing: (preparing: boolean) => void;
}

export const useClipAudioStore = create<ClipAudioState>((set) => ({
  audio: null,
  preparing: false,
  setAudio: (audio) => set({ audio }),
  setPreparing: (preparing) => set({ preparing }),
}));
