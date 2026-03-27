import { create } from "zustand";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import { ModelDefaults, ModelStateMap } from "./aiGenerationStore.type";
import { GenerationTypeEnum } from "@/features/generation/types/generation";

type AiGenerationStore = {
  model: AiModelsEnum;
  state: ModelStateMap[keyof ModelStateMap];
  generationType: GenerationTypeEnum;
  setModel: <M extends AiModelsEnum>(model: M) => void;
  setGenerationType: (generationType: GenerationTypeEnum) => void;
  reset: () => void;

  // Generic setter for any key in the current model's state
  setField: <
    K extends keyof (typeof ModelDefaults)[keyof typeof ModelDefaults],
  >(
    key: K,
    value: any,
  ) => void;
};

const useAiGenerationtore = create<AiGenerationStore>((set, get) => ({
  model: AiModelsEnum.GEMINI_FLASH_IMAGE,

  state: ModelDefaults[AiModelsEnum.GEMINI_FLASH_IMAGE],
  generationType: GenerationTypeEnum.IMAGE,
  setModel: <M extends AiModelsEnum>(model: M) =>
    set({ model, state: ModelDefaults[model] }),
  setGenerationType: (generationType: GenerationTypeEnum) =>
    set({ generationType }),
  reset: () => {
    const { model } = get();
    set({ state: ModelDefaults[model] });
  },

  setField: (key, value) => {
    set((state) => ({
      state: { ...state.state, [key]: value },
    }));
  },
}));
export function useAiGenerationStore<M extends AiModelsEnum>(expectedModel: M) {
  const store = useAiGenerationtore();

  return store as {
    model: M;
    state: ModelStateMap[M];
    generationType: GenerationTypeEnum;
    setModel: (model: M) => void;
    setGenerationType: (generationType: GenerationTypeEnum) => void;
    reset: () => void;
    setField: <K extends keyof ModelStateMap[M]>(
      key: K,
      value: ModelStateMap[M][K],
    ) => void;
  };
}
