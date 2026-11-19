import { create } from "zustand";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import { GenerationTypeEnum } from "@/features/generation/types/generation";
import { MediaTypeDefaultModel, ModelDefaults, ModelStateMap } from "./aiGenerationStore.type";
import type { RecreatedFrom } from "@/features/generation/lib/origin";

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
  /** The picked style (sent as input.styleId to models that take styles). */
  styleId: string | null;
  setStyleId: (styleId: string | null) => void;
  /** The create pages' explorer tab, shared so the sidebar's Style card can open Styles. */
  explorerView: "explore" | "history" | "styles";
  setExplorerView: (view: "explore" | "history" | "styles") => void;
  /** What Recreate loaded (sent with the next generation for analytics). */
  recreatedFrom: RecreatedFrom | null;
  setRecreatedFrom: (recreatedFrom: RecreatedFrom | null) => void;
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
    [AiModelsEnum.SMPL_RIPPER]:
      ModelDefaults[AiModelsEnum.SMPL_RIPPER],
    [AiModelsEnum.SMPL_ARTIST]:
      ModelDefaults[AiModelsEnum.SMPL_ARTIST],
    [AiModelsEnum.SMPL_AI_INFLUENCER]:
      ModelDefaults[AiModelsEnum.SMPL_AI_INFLUENCER],
    [AiModelsEnum.SMPL_ADS_STUDIO]:
      ModelDefaults[AiModelsEnum.SMPL_ADS_STUDIO],
    [AiModelsEnum.ELEVENLABS_MUSIC_V2_5]:
      ModelDefaults[AiModelsEnum.ELEVENLABS_MUSIC_V2_5],
    [AiModelsEnum.FAL_SEEDANCE_2_5]:
      ModelDefaults[AiModelsEnum.FAL_SEEDANCE_2_5],
    [AiModelsEnum.SMPL_AD_MULTIPLIER]:
      ModelDefaults[AiModelsEnum.SMPL_AD_MULTIPLIER],
    [AiModelsEnum.SMPL_VOICE_CHANGER]:
      ModelDefaults[AiModelsEnum.SMPL_VOICE_CHANGER],
    [AiModelsEnum.SMPL_IMAGE_REFRAME]: ModelDefaults[AiModelsEnum.SMPL_IMAGE_REFRAME],
    [AiModelsEnum.SMPL_IMAGE_UPSCALE]: ModelDefaults[AiModelsEnum.SMPL_IMAGE_UPSCALE],
    [AiModelsEnum.SMPL_VIDEO_REFRAME]: ModelDefaults[AiModelsEnum.SMPL_VIDEO_REFRAME],
    [AiModelsEnum.SMPL_VIDEO_FPS_BOOST]: ModelDefaults[AiModelsEnum.SMPL_VIDEO_FPS_BOOST],
    [AiModelsEnum.SMPL_VIDEO_UPSCALE]: ModelDefaults[AiModelsEnum.SMPL_VIDEO_UPSCALE],
    [AiModelsEnum.KLING_4_0]: ModelDefaults[AiModelsEnum.KLING_4_0],
    [AiModelsEnum.KLING_4_0_FLASH]: ModelDefaults[AiModelsEnum.KLING_4_0_FLASH],
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
    setModel: (model) =>
      set((s) => ({
        model,
        sidebarView: "default",
        // Another model: not a remake any more.
        recreatedFrom: s.recreatedFrom?.model === model ? s.recreatedFrom : null,
      })),
    setProjectId: (projectId: string) => set({ projectId }),
    setMediaType: (mediaType) => set({ mediaType, model: MediaTypeDefaultModel[mediaType] }),
    templateMode: false,
    setTemplateMode: (templateMode) => set({ templateMode }),
    sidebarView: "default",
    setSidebarView: (sidebarView) => set({ sidebarView }),
    styleId: null,
    setStyleId: (styleId) => set({ styleId }),
    explorerView: "explore",
    setExplorerView: (explorerView) => set({ explorerView }),
    recreatedFrom: null,
    setRecreatedFrom: (recreatedFrom) => set({ recreatedFrom }),
  }),
);
