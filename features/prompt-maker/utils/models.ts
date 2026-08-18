import {
  AUDIO_MODELS,
  AiModelsEnum,
  IMAGE_MODELS,
  Model,
  VIDEO_MODELS,
} from "@/features/generation/enums/models.enum";
import { GenerationTypeEnum } from "@/features/generation/types/generation";

export function modelsFor(mediaType: GenerationTypeEnum): Model[] {
  switch (mediaType) {
    case GenerationTypeEnum.VIDEO:
      return VIDEO_MODELS;
    case GenerationTypeEnum.AUDIO:
      return AUDIO_MODELS;
    default:
      return IMAGE_MODELS;
  }
}

const ALL_MODELS = [...IMAGE_MODELS, ...VIDEO_MODELS, ...AUDIO_MODELS];

export function modelName(id: AiModelsEnum): string {
  return ALL_MODELS.find((model) => model.id === id)?.name ?? id;
}
