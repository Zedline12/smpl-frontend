import {
  AUDIO_MODELS,
  AiModelsEnum,
  IMAGE_MODELS,
  Model,
  VIDEO_MODELS,
  isEditTool,
} from "@/features/generation/enums/models.enum";
import { GenerationTypeEnum } from "@/features/generation/types/generation";

/** Models that take a prompt (the edit tools don't). */
export function modelsFor(mediaType: GenerationTypeEnum): Model[] {
  switch (mediaType) {
    case GenerationTypeEnum.VIDEO:
      return VIDEO_MODELS.filter((m) => !isEditTool(m.id));
    case GenerationTypeEnum.AUDIO:
      return AUDIO_MODELS;
    default:
      return IMAGE_MODELS.filter((m) => !isEditTool(m.id));
  }
}

const ALL_MODELS = [...IMAGE_MODELS, ...VIDEO_MODELS, ...AUDIO_MODELS];

export function modelName(id: AiModelsEnum): string {
  return ALL_MODELS.find((model) => model.id === id)?.name ?? id;
}
