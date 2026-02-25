import {
  VideoAspectRatio,
  VideoDuration,
  VideoResolution,
} from "@/features/media/types/media";
import { create } from "zustand";

type VideoGenerationState = {
  prompt: string;
  aspectRatio: VideoAspectRatio;
  resolution: VideoResolution;
  durationSeconds: VideoDuration;
  referenceImages: string[];

  setPrompt: (v: string) => void;
  setAspectRatio: (v: VideoAspectRatio) => void;
  setResolution: (v: VideoResolution) => void;
  setDurationSeconds: (v: VideoDuration) => void;
  setReferenceImages: (v: string[]) => void;
  projectId: string | null;
  setProjectId: (id: string | null) => void;
  reset: () => void;
};

export const useVideoGenerationStore = create<VideoGenerationState>(
  (set, get) => ({
    prompt: "",
    aspectRatio: "16:9",
    resolution: "720p",
    durationSeconds: 4,
    referenceImages: [],

    setPrompt: (prompt) => set({ prompt }),

    setAspectRatio: (aspectRatio) => set({ aspectRatio }),

    setResolution: (resolution) => {
      const { referenceImages } = get();
      let newDuration = get().durationSeconds;

      if (resolution === "1080p" || resolution === "4k") {
        newDuration = 8;
      } else if (referenceImages.length > 0) {
        newDuration = 8;
      }

      set({ resolution, durationSeconds: newDuration });
    },

    setDurationSeconds: (durationSeconds) => {
      const { resolution, referenceImages } = get();
      if (
        (resolution === "1080p" ||
          resolution === "4k" ||
          referenceImages.length > 0) &&
        durationSeconds !== 8
      ) {
        return;
      }
      set({ durationSeconds });
    },

    setReferenceImages: (referenceImages) => {
      let newDuration = get().durationSeconds;
      const { resolution } = get();

      if (
        referenceImages.length > 0 ||
        resolution === "1080p" ||
        resolution === "4k"
      ) {
        newDuration = 8;
      }
      set({ referenceImages, durationSeconds: newDuration });
    },

    projectId: null,
    setProjectId: (projectId) => set({ projectId }),

    reset: () =>
      set({
        prompt: "",
        aspectRatio: "16:9",
        resolution: "720p",
        durationSeconds: 4,
        referenceImages: [],
        projectId: null,
      }),
  }),
);
