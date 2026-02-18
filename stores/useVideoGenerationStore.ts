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
  referenceImages: (File | null)[];

  setPrompt: (v: string) => void;
  setAspectRatio: (v: VideoAspectRatio) => void;
  setResolution: (v: VideoResolution) => void;
  setDurationSeconds: (v: VideoDuration) => void;
  setReferenceImages: (v: (File | null)[]) => void;
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
      } else if (referenceImages.some((img) => img !== null)) {
        newDuration = 8;
      }

      set({ resolution, durationSeconds: newDuration });
    },

    setDurationSeconds: (durationSeconds) => {
      // If resolution is high or ref images exist, force 8?
      // The requirement says "if resolution... is choosed then duration... is set to 8".
      // It implies forcing it. But if the user TRIES to change duration back, should we allow it?
      // "if resolution ... is choosed ... then duration is set to 8". Usually this means a constraint.
      // However, usually stores don't prevent setting if the user explicitly sets it, unless it's a strict constraint.
      // Given "if ... then ... is set to 8", I'll enforce it in the other setters, but here I should probably check the constraints too
      // or just trust the UI to disable it?
      // Better to check constraints here too to be safe/consistent.

      const { resolution, referenceImages } = get();
      if (
        (resolution === "1080p" ||
          resolution === "4k" ||
          referenceImages.some((img) => img !== null)) &&
        durationSeconds !== 8
      ) {
        // If constraints apply, we might want to prevent changing it to something else, or just set it.
        // For now I will just set it, but the UI might be the better place to disable the interaction.
        // But strict interpretation: 'setDurationSeconds' is called when user clicks.
        // If I force it to 8, the user click does nothing if they click 4.
        // I will assume strict constraint: you CANNOT have 4s if 4k.
        return;
      }
      set({ durationSeconds });
    },

    setReferenceImages: (referenceImages) => {
      let newDuration = get().durationSeconds;
      const hasImages = referenceImages.some((img) => img !== null);
      const { resolution } = get();

      if (hasImages || resolution === "1080p" || resolution === "4k") {
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
