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
import { IOmniHumanV2Input } from "@/features/generation/types/models/omnihuman-v2.type";
import { IGensuInput } from "@/features/generation/types/models/gensu.type";
import { IRemixInput } from "@/features/generation/types/models/remix.type";
import { IRipperInput } from "@/features/generation/types/models/ripper.type";
import { IArtistInput } from "@/features/generation/types/models/artist.type";
import { IArtistVideoClipInput } from "@/features/generation/types/models/artist-video-clip.type";
import { IAiInfluencerInput } from "@/features/generation/types/models/ai-influencer.type";
import { IAdsStudioInput } from "@/features/generation/types/models/ads-studio.type";
import { IMusicV25Input } from "@/features/generation/types/models/elevenlabs-music-v2-5.type";
import { createMusicInput } from "@/features/artist/utils/composition-plan";
import { ISeedance25RefToVideoInput } from "@/features/generation/types/models/seedance-2.5-ref-to-video.type";
import { IKling40Input } from "@/features/generation/types/models/kling-4-0.type";
import { IAdsMultiplierInput } from "@/features/generation/types/models/ads-multiplier.type";
import { IVoiceChangerInput } from "@/features/generation/types/models/voice-changer.type";
import {
  IImageReframeInput,
  IImageUpscaleInput,
  IVideoFpsBoostInput,
  IVideoReframeInput,
  IVideoUpscaleInput,
} from "@/features/generation/types/models/media-edit-tools.type";

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
  [AiModelsEnum.OMNIHUMAN_V2]: IOmniHumanV2Input;
  [AiModelsEnum.SMPL_GENSU]: IGensuInput;
  [AiModelsEnum.SMPL_REMIX]: IRemixInput;
  [AiModelsEnum.SMPL_RIPPER]: IRipperInput;
  [AiModelsEnum.SMPL_ARTIST]: IArtistInput;
  [AiModelsEnum.SMPL_ARTIST_VIDEO_CLIP]: IArtistVideoClipInput;
  [AiModelsEnum.SMPL_AI_INFLUENCER]: IAiInfluencerInput;
  [AiModelsEnum.SMPL_ADS_STUDIO]: IAdsStudioInput;
  [AiModelsEnum.ELEVENLABS_MUSIC_V2_5]: IMusicV25Input;
  [AiModelsEnum.FAL_SEEDANCE_2_5]: ISeedance25RefToVideoInput;
  [AiModelsEnum.SMPL_AD_MULTIPLIER]: IAdsMultiplierInput;
  [AiModelsEnum.KLING_4_0]: IKling40Input;
  [AiModelsEnum.KLING_4_0_FLASH]: IKling40Input;
  [AiModelsEnum.SMPL_VOICE_CHANGER]: IVoiceChangerInput;
  [AiModelsEnum.SMPL_IMAGE_REFRAME]: IImageReframeInput;
  [AiModelsEnum.SMPL_IMAGE_UPSCALE]: IImageUpscaleInput;
  [AiModelsEnum.SMPL_VIDEO_REFRAME]: IVideoReframeInput;
  [AiModelsEnum.SMPL_VIDEO_FPS_BOOST]: IVideoFpsBoostInput;
  [AiModelsEnum.SMPL_VIDEO_UPSCALE]: IVideoUpscaleInput;
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
    generateAudio: true,
    images: [],
    videos: [],
    audios: [],
  },
  [AiModelsEnum.GPT_IMAGE_2]: {
    prompt: "",
    images: [],
    aspectRatio: "1:1",
    quality: "auto",
  },
  [AiModelsEnum.GROK_IMAGINE_VIDEO_1_5]: {
    prompt: "",
    images: [],
    duration: 5,
    resolution: "720p",
    aspectRatio: "16:9",
  },
  [AiModelsEnum.OMNIHUMAN_V2]: {
    prompt: "",
    imageUrl: "",
    audioUrl: "",
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
  [AiModelsEnum.SMPL_RIPPER]: {
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
  [AiModelsEnum.SMPL_ARTIST_VIDEO_CLIP]: {
    type: "lipsync",
    prompt: "",
    images: [],
    audioUrl: "",
    scene: "song",
    // An uploaded song's defaults; a song from My songs sets its own (sceneFromSong).
    location: "mountain",
    weather: "sunny",
    time: "sunrise",
    mood: "uplifting",
    backgroundImage: null,
    backgroundVideoId: null,
    placePrompt: "",
    lyrics: true,
    lyricsPosition: "center",
    lyricsFont: "anton",
    lyricsSize: "medium",
    lyricsOpacity: 100,
    // null: the clip type's default (Lyrics 35 %, lip sync 0).
    backgroundDim: null,
    duration: 10,
  },
  [AiModelsEnum.SMPL_AI_INFLUENCER]: {
    prompt: "",
    tier: "normal",
    selection: {},
    brief: "",
    imageUrl: "",
    itemImageUrls: [],
    seed: null,
    variationIndex: 0,
    bodyColor: "",
    resolution: "1K",
  },
  [AiModelsEnum.SMPL_ADS_STUDIO]: {
    prompt: "",
    images: [],
    niche: "",
    targetAudience: "",
    language: "",
    aspectRatio: "1:1",
    resolution: "2K",
    batchSize: 1,
  },
  [AiModelsEnum.ELEVENLABS_MUSIC_V2_5]: createMusicInput(),
  [AiModelsEnum.FAL_SEEDANCE_2_5]: {
    prompt: "",
    images: [],
    videos: [],
    audios: [],
    resolution: "720p",
    duration: 10,
    aspectRatio: "auto",
    generateAudio: true,
  },
  [AiModelsEnum.KLING_4_0]: {
    prompt: "",
    images: [],
    videos: [],
    resolution: "1080p",
    duration: 5,
    aspectRatio: "16:9",
    audio: "native",
  },
  [AiModelsEnum.KLING_4_0_FLASH]: {
    prompt: "",
    images: [],
    videos: [],
    resolution: "720p",
    duration: 5,
    aspectRatio: "16:9",
    audio: "native",
  },
  [AiModelsEnum.SMPL_AD_MULTIPLIER]: {
    prompt: "",
    videoUrl: "",
    images: [],
    hook: "",
    cta: "",
    resolution: "720p",
    duration: 8,
  },
  [AiModelsEnum.SMPL_VOICE_CHANGER]: {
    prompt: "",
    videoUrl: "",
    voiceId: "",
    removeBackgroundNoise: false,
    duration: 0,
  },
  [AiModelsEnum.SMPL_IMAGE_REFRAME]: {
    prompt: "",
    imageUrl: "",
    aspectRatio: "9:16",
    fit: "crop",
    position: "center",
  },
  [AiModelsEnum.SMPL_IMAGE_UPSCALE]: {
    prompt: "",
    imageUrl: "",
    scale: 2,
    aspectRatio: "",
  },
  [AiModelsEnum.SMPL_VIDEO_REFRAME]: {
    prompt: "",
    videoUrl: "",
    aspectRatio: "9:16",
    fit: "crop",
    position: "center",
    duration: 0,
  },
  [AiModelsEnum.SMPL_VIDEO_FPS_BOOST]: {
    prompt: "",
    videoUrl: "",
    fps: 60,
    mode: "smooth",
    aspectRatio: "",
    duration: 0,
  },
  [AiModelsEnum.SMPL_VIDEO_UPSCALE]: {
    prompt: "",
    videoUrl: "",
    resolution: "1080p",
    aspectRatio: "",
    duration: 0,
  },
};
