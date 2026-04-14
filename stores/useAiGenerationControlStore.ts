import { create } from "zustand";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import { GenerationTypeEnum } from "@/features/generation/types/generation";
import { MediaTypeDefaultModel, ModelDefaults, ModelStateMap } from "./aiGenerationStore.type";

type AiGenerationControlStore = {
  model: AiModelsEnum;
  projectId: string;
  mediaType: GenerationTypeEnum;
  setModel: (model: AiModelsEnum) => void;
  setProjectId: (projectId: string) => void;
  setMediaType: (mediaType: GenerationTypeEnum) => void;
};
type AiModelStore = {
  states: Partial<{
    [M in AiModelsEnum]: ModelStateMap[M];
  }>;
  setField: (model: AiModelsEnum, key: string, value: any) => void;
};
export const useAiModelStore = create<AiModelStore>((set, get) => ({
  states: {
    [AiModelsEnum.GEMINI_FLASH_IMAGE]:
      ModelDefaults[AiModelsEnum.GEMINI_FLASH_IMAGE],
    [AiModelsEnum.KLING_O3_IMAGE]: ModelDefaults[AiModelsEnum.KLING_O3_IMAGE],
    [AiModelsEnum.VEO_3]: ModelDefaults[AiModelsEnum.VEO_3],
    [AiModelsEnum.KLING_V3_PRO_MOTION_CONTROL]: ModelDefaults[AiModelsEnum.KLING_V3_PRO_MOTION_CONTROL],
    [AiModelsEnum.KLING_V3_IMAGE_TO_VIDEO]: ModelDefaults[AiModelsEnum.KLING_V3_IMAGE_TO_VIDEO],
    [AiModelsEnum.KLING_V3_TEXT_TO_VIDEO]: ModelDefaults[AiModelsEnum.KLING_V3_TEXT_TO_VIDEO],
    [AiModelsEnum.ELEVEN_LABS_V3_TTS]: ModelDefaults[AiModelsEnum.ELEVEN_LABS_V3_TTS],
  },
  setField: (model: AiModelsEnum, key: any, value: any) => {
    const { states } = get();
    const current = states[model];
    if (!(key in current!)) return;
    set({
      states: {
        ...states,
        [model]: {
          ...current,
          [key]: value,
        },
      },
    });
  },
}));
export const useAiGenerationControlStore = create<AiGenerationControlStore>(
  (set, get) => ({
    model: AiModelsEnum.GEMINI_FLASH_IMAGE,
    projectId: "",
    mediaType: GenerationTypeEnum.IMAGE,
    setModel: (model) => set({ model }),
    setProjectId: (projectId: string) => set({ projectId }),
    setMediaType: (mediaType) => set({ mediaType, model: MediaTypeDefaultModel[mediaType] }),
  }),
);
