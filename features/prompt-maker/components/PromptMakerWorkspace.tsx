"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import { GenerationTypeEnum } from "@/features/generation/types/generation";
import { MediaTypeDefaultModel } from "@/stores/aiGenerationStore.type";
import {
  useAiGenerationControlStore,
  useAiModelStore,
} from "@/stores/useAiGenerationControlStore";
import { useCreatePromptMutation } from "../hooks/use-prompt-maker";
import { defaultSettingsFor } from "../types/model-settings";
import {
  CreatePromptMakerRequest,
  PromptMaker,
  PromptMakerSettings,
  VisualStyleEnum,
} from "../types/prompt-maker";
import { GeneratedPromptPanel } from "./GeneratedPromptPanel";
import { PromptHistoryList } from "./PromptHistoryList";
import { PromptMakerForm } from "./PromptMakerForm";

const INITIAL_MEDIA_TYPE = GenerationTypeEnum.IMAGE;
const INITIAL_MODEL = MediaTypeDefaultModel[INITIAL_MEDIA_TYPE];

/** Keeps only the keys this model actually exposes, so stored input can't
 *  reintroduce fields the settings row doesn't render. */
function mergeSettings(
  model: AiModelsEnum,
  stored?: PromptMakerSettings,
): PromptMakerSettings {
  const base = defaultSettingsFor(model);
  if (!stored) return base;

  const merged: PromptMakerSettings = { ...base };
  Object.keys(base).forEach((key) => {
    if (key in stored) merged[key] = stored[key];
  });
  return merged;
}

export default function PromptMakerWorkspace() {
  const router = useRouter();
  const createPrompt = useCreatePromptMutation();

  const setModelInStore = useAiGenerationControlStore((state) => state.setModel);
  const setMediaTypeInStore = useAiGenerationControlStore(
    (state) => state.setMediaType,
  );
  const setField = useAiModelStore((state) => state.setField);

  const [description, setDescription] = useState("");
  const [mediaType, setMediaType] =
    useState<GenerationTypeEnum>(INITIAL_MEDIA_TYPE);
  const [model, setModel] = useState<AiModelsEnum>(INITIAL_MODEL);
  const [settings, setSettings] = useState<PromptMakerSettings>(() =>
    defaultSettingsFor(INITIAL_MODEL),
  );
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [visualStyle, setVisualStyle] = useState<VisualStyleEnum | null>(null);
  const [result, setResult] = useState<PromptMaker | null>(null);

  const handleMediaTypeChange = (next: GenerationTypeEnum) => {
    const nextModel = MediaTypeDefaultModel[next];
    setMediaType(next);
    setModel(nextModel);
    setSettings(defaultSettingsFor(nextModel));
  };

  const handleModelChange = (next: AiModelsEnum) => {
    setModel(next);
    setSettings(defaultSettingsFor(next));
  };

  const handleSettingChange = (key: string, value: unknown) => {
    setSettings((previous) => ({ ...previous, [key]: value }));
  };

  const handleSubmit = () => {
    const trimmed = description.trim();
    if (!trimmed || createPrompt.isPending) return;

    const payload: CreatePromptMakerRequest = {
      description: trimmed,
      model,
      mediaType,
      ...(Object.keys(settings).length ? { input: settings } : {}),
      ...(referenceImages.length ? { referenceImages } : {}),
      ...(visualStyle ? { visualStyle } : {}),
    };

    createPrompt.mutate(payload, { onSuccess: setResult });
  };

  /** Loads a past prompt back into the form so it can be iterated on. */
  const handleSelectHistory = (prompt: PromptMaker) => {
    setDescription(prompt.description);
    setMediaType(prompt.mediaType);
    setModel(prompt.model);
    setSettings(mergeSettings(prompt.model, prompt.input));
    setReferenceImages(prompt.referenceImages ?? []);
    setVisualStyle(prompt.visualStyle ?? null);
    setResult(prompt);
  };

  const handleUseInComposer = () => {
    if (!result) return;

    // Order matters: setMediaType also resets the model to that media type's
    // default, so it has to run before setModel.
    setMediaTypeInStore(result.mediaType);
    setModelInStore(result.model);

    setField(result.model, "prompt", result.generatedPrompt);

    const usedSettings = mergeSettings(result.model, result.input);
    Object.entries(usedSettings).forEach(([key, value]) =>
      setField(result.model, key, value),
    );

    // No-ops for models whose defaults have no `images` key.
    if (result.referenceImages?.length) {
      setField(result.model, "images", result.referenceImages);
    }

    router.push("/create");
  };

  return (
    <div className="custom-scrollbar flex h-full min-h-0 flex-col-reverse overflow-y-auto lg:flex-row lg:overflow-hidden">
      <aside className="border-border shrink-0 border-t lg:h-full lg:w-[300px] lg:border-t-0 lg:border-r xl:w-[340px]">
        <PromptHistoryList
          selectedId={result?.id}
          onSelect={handleSelectHistory}
        />
      </aside>

      <section className="custom-scrollbar flex-1 lg:h-full lg:min-h-0 lg:overflow-y-auto">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 p-5 md:p-8">
          <header>
            <h1 className="text-foreground text-2xl font-bold">Prompt Maker</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Describe your idea and get a detailed prompt tuned to the model
              you plan to generate with.
            </p>
          </header>

          <PromptMakerForm
            description={description}
            onDescriptionChange={setDescription}
            mediaType={mediaType}
            onMediaTypeChange={handleMediaTypeChange}
            model={model}
            onModelChange={handleModelChange}
            settings={settings}
            onSettingChange={handleSettingChange}
            referenceImages={referenceImages}
            onReferenceImagesChange={setReferenceImages}
            visualStyle={visualStyle}
            onVisualStyleChange={setVisualStyle}
            onSubmit={handleSubmit}
            isSubmitting={createPrompt.isPending}
          />

          {result && (
            <GeneratedPromptPanel
              result={result}
              onUseInComposer={handleUseInComposer}
            />
          )}
        </div>
      </section>
    </div>
  );
}
