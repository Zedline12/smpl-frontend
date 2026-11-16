import { create } from "zustand";

/** One song in the player bar. */
export interface Track {
  id: string;
  url: string;
  title: string;
  subtitle: string;
  /** CSS background for the cover. */
  cover: string;
  /** The user's own media (can be liked); templates can't. */
  mediaId?: string;
  liked?: boolean;
}

export type RepeatMode = "off" | "all" | "one";

interface ArtistPlayerState {
  queue: Track[];
  index: number;
  playing: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  volume: number;
  muted: boolean;
  /** Plays `queue[index]`, replacing the queue (the shelf the song was clicked in). */
  playQueue: (queue: Track[], index: number) => void;
  setPlaying: (playing: boolean) => void;
  toggle: () => void;
  /** `ended`: called by the audio when a song finishes (respects repeat off). */
  next: (ended?: boolean) => void;
  prev: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setLiked: (id: string, liked: boolean) => void;
  reset: () => void;
}

const REPEAT_ORDER: RepeatMode[] = ["off", "all", "one"];

const randomOther = (length: number, current: number) => {
  if (length < 2) return current;
  const i = Math.floor(Math.random() * (length - 1));
  return i >= current ? i + 1 : i;
};

/** The Artist page's Spotify-style player: one queue, one song at a time. */
export const useArtistPlayerStore = create<ArtistPlayerState>((set, get) => ({
  queue: [],
  index: 0,
  playing: false,
  shuffle: false,
  repeat: "off",
  volume: 0.8,
  muted: false,

  playQueue: (queue, index) => set({ queue, index, playing: true }),
  setPlaying: (playing) => set({ playing }),
  toggle: () => set((s) => ({ playing: s.queue.length > 0 && !s.playing })),

  next: (ended = false) => {
    const { queue, index, shuffle, repeat } = get();
    if (!queue.length) return;
    if (shuffle) return set({ index: randomOther(queue.length, index), playing: true });
    const last = index === queue.length - 1;
    if (last && ended && repeat === "off") return set({ playing: false });
    set({ index: last ? 0 : index + 1, playing: true });
  },
  prev: () => {
    const { queue, index } = get();
    if (!queue.length) return;
    set({ index: index === 0 ? queue.length - 1 : index - 1, playing: true });
  },

  toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),
  cycleRepeat: () =>
    set((s) => ({ repeat: REPEAT_ORDER[(REPEAT_ORDER.indexOf(s.repeat) + 1) % REPEAT_ORDER.length] })),
  setVolume: (volume) => set({ volume, muted: volume === 0 }),
  // Unmuting from a volume dragged to 0 brings it back to a hearable level.
  toggleMute: () => set((s) => (s.muted && s.volume === 0 ? { muted: false, volume: 0.5 } : { muted: !s.muted })),
  setLiked: (id, liked) =>
    set((s) => ({ queue: s.queue.map((t) => (t.id === id ? { ...t, liked } : t)) })),
  reset: () => set({ queue: [], index: 0, playing: false }),
}));

/** The song in the bar, if any. */
export const useCurrentTrack = () =>
  useArtistPlayerStore((s) => (s.queue.length ? s.queue[s.index] : undefined));
