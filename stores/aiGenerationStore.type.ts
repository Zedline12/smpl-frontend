import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import { GenerationTypeEnum } from "@/features/generation/types/generation";
import { GeminiFlashImageInput } from "@/features/generation/types/models/gemini-flash-image.type";
import { KlingO3ImageInput } from "@/features/generation/types/models/kling-o3-image.type";
import { Veo3Input } from "@/features/generation/types/models/veo-3.type";
import { IKlingV3ProMotionControlInput } from "@/features/generation/types/models/kling-v3-pro-motion-control";
import { IKlingV3ImageToVideoInput } from "@/features/generation/types/models/kling-v3-image-to-video.type";
import { IKlingV3TextToVideoInput } from "@/features/generation/types/models/kling-v3-text-to-video.type";
import { IElevenLabsV3Input, ElevenLabsV3ApplyTextNormalization, ElevenLabsV3Voice } from "@/features/generation/types/models/elevenlabs-v3.type";
import { ISeedreamV45Input } from "@/features/generation/types/models/seedream-v4-5.type";
import { ISeedance20Input } from "@/features/generation/types/models/seedance-2.0.type";
import { ISeedance25Input } from "@/features/generation/types/models/seedance-2.5.type";
import { IGptImage2Input } from "@/features/generation/types/models/gpt-image-2.type";
import { IGrokImagineVideo15Input } from "@/features/generation/types/models/grok-imagine-video-1.5.type";
import { IGensuInput } from "@/features/generation/types/models/gensu.type";
import { IRemixInput } from "@/features/generation/types/models/remix.type";
import { IArtistInput } from "@/features/generation/types/models/artist.type";
import { IAiInfluencerInput } from "@/features/generation/types/models/higgsfield-ai-influencer.type";
import { IAdsStudioInput } from "@/features/generation/types/models/higgsfield-ads-studio.type";
import { IKatanaInput } from "@/features/generation/types/models/higgsfield-katana.type";
import { IMusicV25Input } from "@/features/generation/types/models/elevenlabs-music-v2-5.type";
import { createMusicInput } from "@/features/artist/utils/composition-plan";
import { ISeedance25RefToVideoInput } from "@/features/generation/types/models/seedance-2.5-ref-to-video.type";
import { IAdsMultiplierInput } from "@/features/generation/types/models/ads-multiplier.type";

export type ModelStateMap = {
  [AiModelsEnum.VEO_3]: Veo3Input;
  [AiModelsEnum.KLING_O3_IMAGE]: KlingO3ImageInput;
  [AiModelsEnum.GEMINI_FLASH_IMAGE]: GeminiFlashImageInput;
  [AiModelsEnum.KLING_V3_PRO_MOTION_CONTROL]: IKlingV3ProMotionControlInput;
  [AiModelsEnum.KLING_V3_IMAGE_TO_VIDEO]: IKlingV3ImageToVideoInput;
  [AiModelsEnum.KLING_V3_TEXT_TO_VIDEO]: IKlingV3TextToVideoInput;
  [AiModelsEnum.ELEVEN_LABS_V3_TTS]: IElevenLabsV3Input;
  [AiModelsEnum.SEEDREAM_V4_5]: ISeedreamV45Input;
  [AiModelsEnum.SEEDANCE_2_0]: ISeedance20Input;
  [AiModelsEnum.SEEDANCE_2_5]: ISeedance25Input;
  [AiModelsEnum.GPT_IMAGE_2]: IGptImage2Input;
  [AiModelsEnum.GROK_IMAGINE_VIDEO_1_5]: IGrokImagineVideo15Input;
  [AiModelsEnum.SMPL_GENSU]: IGensuInput;
  [AiModelsEnum.SMPL_REMIX]: IRemixInput;
  [AiModelsEnum.SMPL_ARTIST]: IArtistInput;
  [AiModelsEnum.HIGGSFIELD_AI_INFLUENCER]: IAiInfluencerInput;
  [AiModelsEnum.HIGGSFIELD_ADS_STUDIO]: IAdsStudioInput;
  [AiModelsEnum.HIGGSFIELD_KATANA]: IKatanaInput;
  [AiModelsEnum.ELEVENLABS_MUSIC_V2_5]: IMusicV25Input;
  [AiModelsEnum.SEEDANCE_2_5_REF_TO_VIDEO]: ISeedance25RefToVideoInput;
  [AiModelsEnum.ADS_MULTIPLIER]: IAdsMultiplierInput;
};
export const MediaTypeDefaultModel: Record<GenerationTypeEnum, AiModelsEnum> = {
  [GenerationTypeEnum.VIDEO]: AiModelsEnum.VEO_3,
  [GenerationTypeEnum.IMAGE]: AiModelsEnum.GEMINI_FLASH_IMAGE,
  [GenerationTypeEnum.AUDIO]: AiModelsEnum.ELEVEN_LABS_V3_TTS,
};
export const ModelDefaults: { [M in AiModelsEnum]: ModelStateMap[M] } = {
  [AiModelsEnum.VEO_3]: {
    prompt: "",
    aspectRatio: "16:9",
    resolution: "720p",
    durationSeconds: 4,
    images: [],
    generateAudio: false,
  },
  [AiModelsEnum.KLING_V3_IMAGE_TO_VIDEO]: {
    prompt: "",
    startImageUrl: "",
    duration: 4,
    generateAudio: false,
    endImageUrl: "",
    multiPrompt: undefined,
    elements: undefined,
  },
  [AiModelsEnum.KLING_V3_TEXT_TO_VIDEO]: {
    prompt: "",
    duration: 4,
    aspectRatio: "16:9",
    generateAudio: false,
  },
  [AiModelsEnum.KLING_O3_IMAGE]: {
    prompt: "",
    aspectRatio: "1:1",
    images: [],
    resolution: "1K",
  },
  [AiModelsEnum.GEMINI_FLASH_IMAGE]: {
    prompt: "",
    aspectRatio: "1:1",
    images: [],
    resolution: "1K",
  },
  [AiModelsEnum.KLING_V3_PRO_MOTION_CONTROL]: {
    prompt: "",
    videoUrl: "",
    imageUrl: "",
    keepOriginalSound: false,
    characterOrientation: "image",
  },
  [AiModelsEnum.ELEVEN_LABS_V3_TTS]: {
    prompt: "",
    voice: ElevenLabsV3Voice.ARIA,
    applyTextNormalization: ElevenLabsV3ApplyTextNormalization.AUTO,
    stability: 0.5,
    languageCode: "en",
  },
  [AiModelsEnum.SEEDREAM_V4_5]: {
    prompt: "",
    images: [],
    aspectRatio: "1:1",
  },
  [AiModelsEnum.SEEDANCE_2_0]: {
    prompt: "",
    resolution: "720p",
    duration: 5,
    aspectRatio: "16:9",
    generateAudio: false,
    imageUrl: "",
    endImageUrl: "",
  },
  [AiModelsEnum.SEEDANCE_2_5]: {
    prompt: "",
    resolution: "720p",
    duration: 5,
    aspectRatio: "16:9",
    generateAudio: false,
    imageUrl: "",
    endImageUrl: "",
  },
  [AiModelsEnum.GPT_IMAGE_2]: {
    prompt: "",
    images: [],
    aspectRatio: "auto",
    quality: "auto",
  },
  [AiModelsEnum.GROK_IMAGINE_VIDEO_1_5]: {
    prompt: "",
    images: [],
    duration: 5,
    resolution: "720p",
    aspectRatio: "16:9",
  },
  [AiModelsEnum.SMPL_GENSU]: {
    prompt: "",
    videoUrl: "",
    images: [],
    resolution: "720p",
  },
  [AiModelsEnum.SMPL_REMIX]: {
    prompt: "",
    videoUrl: "",
    image: "",
    resolution: "720p",
  },
  [AiModelsEnum.SMPL_ARTIST]: {
    prompt: "",
    images: [],
    videoUrl: "",
    audioUrl: "",
    duration: 10,
    resolution: "720p",
    aspectRatio: "auto",
  },
  [AiModelsEnum.HIGGSFIELD_AI_INFLUENCER]: {
    prompt: "",
    tier: "normal",
    selection: {},
    brief: "",
    imageUrl: "",
    itemImageUrls: [],
    seed: null,
    variationIndex: 0,
    bodyColor: "",
    resolution: "2K",
  },
  [AiModelsEnum.HIGGSFIELD_ADS_STUDIO]: {
    prompt: "",
    images: [],
    niche: "",
    targetAudience: "",
    language: "",
    aspectRatio: "1:1",
    resolution: "2K",
    batchSize: 1,
  },
  [AiModelsEnum.HIGGSFIELD_KATANA]: {
    prompt: "",
    videoUrl: "",
    images: [],
    resolution: "720p",
  },
  [AiModelsEnum.ELEVENLABS_MUSIC_V2_5]: createMusicInput(),
  [AiModelsEnum.SEEDANCE_2_5_REF_TO_VIDEO]: {
    prompt: "",
    images: [],
    videos: [],
    audios: [],
    resolution: "720p",
    duration: 10,
    aspectRatio: "auto",
    generateAudio: true,
  },
  [AiModelsEnum.ADS_MULTIPLIER]: {
    prompt: "",
    videoUrl: "",
    images: [],
    hook: "",
    cta: "",
    resolution: "720p",
    duration: 8,
  },
};
