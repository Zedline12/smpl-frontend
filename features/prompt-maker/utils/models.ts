import {
  AUDIO_MODELS,
  AiModelsEnum,
  IMAGE_MODELS,
  Model,
  VIDEO_MODELS,
  isEditTool,
} from "@/features/generation/enums/models.enum";
import { GenerationTypeEnum } from "@/features/generation/types/generation";
import { offeringName, withCatalog } from "@/features/catalog/catalog";

/**
 * Models that take a prompt (the edit tools don't), with the catalog's names; ones an
 * admin turned off are left out. Components showing these should call useCatalog().
 */
export function modelsFor(mediaType: GenerationTypeEnum): Model[] {
  switch (mediaType) {
    case GenerationTypeEnum.VIDEO:
      return withCatalog(VIDEO_MODELS.filter((m) => !isEditTool(m.id)));
    case GenerationTypeEnum.AUDIO:
      return withCatalog(AUDIO_MODELS);
    default:
      return withCatalog(IMAGE_MODELS.filter((m) => !isEditTool(m.id)));
  }
}

const ALL_MODELS = [...IMAGE_MODELS, ...VIDEO_MODELS, ...AUDIO_MODELS];

export function modelName(id: AiModelsEnum): string {
  return offeringName(id, ALL_MODELS.find((model) => model.id === id)?.name ?? id);
}
