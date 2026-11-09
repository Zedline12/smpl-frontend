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
  /** Admin template page: Create makes a template instead of a user generation. */
  templateMode: boolean;
  setTemplateMode: (templateMode: boolean) => void;
  /** Which view is shown in the main content area of the create section. */
  sidebarView: "default" | "howItWorks";
  setSidebarView: (view: "default" | "howItWorks") => void;
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
    [AiModelsEnum.SEEDREAM_V4_5]: ModelDefaults[AiModelsEnum.SEEDREAM_V4_5],
    [AiModelsEnum.SEEDANCE_2_0]: ModelDefaults[AiModelsEnum.SEEDANCE_2_0],
    [AiModelsEnum.SEEDANCE_2_5]: ModelDefaults[AiModelsEnum.SEEDANCE_2_5],
    [AiModelsEnum.GPT_IMAGE_2]: ModelDefaults[AiModelsEnum.GPT_IMAGE_2],
    [AiModelsEnum.GROK_IMAGINE_VIDEO_1_5]:
      ModelDefaults[AiModelsEnum.GROK_IMAGINE_VIDEO_1_5],
    [AiModelsEnum.SMPL_GENSU]:
      ModelDefaults[AiModelsEnum.SMPL_GENSU],
    [AiModelsEnum.SMPL_REMIX]:
      ModelDefaults[AiModelsEnum.SMPL_REMIX],
    [AiModelsEnum.SMPL_ARTIST]:
      ModelDefaults[AiModelsEnum.SMPL_ARTIST],
    [AiModelsEnum.HIGGSFIELD_AI_INFLUENCER]:
      ModelDefaults[AiModelsEnum.HIGGSFIELD_AI_INFLUENCER],
    [AiModelsEnum.HIGGSFIELD_ADS_STUDIO]:
      ModelDefaults[AiModelsEnum.HIGGSFIELD_ADS_STUDIO],
    [AiModelsEnum.HIGGSFIELD_KATANA]:
      ModelDefaults[AiModelsEnum.HIGGSFIELD_KATANA],
    [AiModelsEnum.ELEVENLABS_MUSIC_V2_5]:
      ModelDefaults[AiModelsEnum.ELEVENLABS_MUSIC_V2_5],
    [AiModelsEnum.SEEDANCE_2_5_REF_TO_VIDEO]:
      ModelDefaults[AiModelsEnum.SEEDANCE_2_5_REF_TO_VIDEO],
    [AiModelsEnum.ADS_MULTIPLIER]:
      ModelDefaults[AiModelsEnum.ADS_MULTIPLIER],
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
    setModel: (model) => set({ model, sidebarView: "default" }),
    setProjectId: (projectId: string) => set({ projectId }),
    setMediaType: (mediaType) => set({ mediaType, model: MediaTypeDefaultModel[mediaType] }),
    templateMode: false,
    setTemplateMode: (templateMode) => set({ templateMode }),
    sidebarView: "default",
    setSidebarView: (sidebarView) => set({ sidebarView }),
  }),
);
