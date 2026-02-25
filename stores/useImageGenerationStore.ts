// stores/useGenerationStore.ts
import { AspectRatio, ImageResolution } from "@/features/media/types/media";
import { create } from "zustand";

type ImageGenerationState = {
  prompt: string;
  aspectRatio: AspectRatio;
  resolution: ImageResolution;
  referenceImages: string[];
  setReferenceImages: (v: string[]) => void;
  setPrompt: (v: string) => void;
  setAspectRatio: (v: AspectRatio) => void;
  setResolution: (v: ImageResolution) => void;
  projectId: string | null;
  setProjectId: (id: string | null) => void;
  reset: () => void;
};

export const useImageGenerationStore = create<ImageGenerationState>((set) => ({
  prompt: "",
  aspectRatio: "1:1",
  resolution: "1K",
  referenceImages: [],
  projectId: null,
  setReferenceImages: (referenceImages) => set({ referenceImages }),
  setPrompt: (prompt) => set({ prompt }),
  setAspectRatio: (aspectRatio) => set({ aspectRatio }),
  setResolution: (resolution) => set({ resolution }),
  setProjectId: (projectId) => set({ projectId }),

  reset: () =>
    set({
      prompt: "",
      aspectRatio: "1:1",
      resolution: "1K",
      referenceImages: [],
      projectId: null,
    }),
}));
