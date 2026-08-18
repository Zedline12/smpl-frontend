"use client";

import { Menu, MenuItem } from "@/components/menu";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import { GenerationTypeEnum } from "@/features/generation/types/generation";
import { cn } from "@/lib/utils";
import { ChevronDown, Loader2, Sparkles } from "lucide-react";
import {
  MAX_DESCRIPTION_LENGTH,
  MIN_DESCRIPTION_LENGTH,
  PromptMakerSettings,
  VisualStyleEnum,
} from "../types/prompt-maker";
import { modelName, modelsFor } from "../utils/models";
import { ModelSettingsRow } from "./ModelSettingsRow";
import { ReferenceImagesField } from "./ReferenceImagesField";
import { VisualStylePicker } from "./VisualStylePicker";

const MEDIA_TYPES: { value: GenerationTypeEnum; label: string }[] = [
  { value: GenerationTypeEnum.IMAGE, label: "Image" },
  { value: GenerationTypeEnum.VIDEO, label: "Video" },
  { value: GenerationTypeEnum.AUDIO, label: "Audio" },
];

const COUNTER_THRESHOLD = MAX_DESCRIPTION_LENGTH - 200;

const TRI_GRADIENT =
  "linear-gradient(135deg, #6b41ff 0%, #ea4bff 50%, #ff6b00 100%)";

interface PromptMakerFormProps {
  description: string;
  onDescriptionChange: (value: string) => void;
  mediaType: GenerationTypeEnum;
  onMediaTypeChange: (value: GenerationTypeEnum) => void;
  model: AiModelsEnum;
  onModelChange: (value: AiModelsEnum) => void;
  settings: PromptMakerSettings;
  onSettingChange: (key: string, value: unknown) => void;
  referenceImages: string[];
  onReferenceImagesChange: (images: string[]) => void;
  visualStyle: VisualStyleEnum | null;
  onVisualStyleChange: (value: VisualStyleEnum | null) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function PromptMakerForm({
  description,
  onDescriptionChange,
  mediaType,
  onMediaTypeChange,
  model,
  onModelChange,
  settings,
  onSettingChange,
  referenceImages,
  onReferenceImagesChange,
  visualStyle,
  onVisualStyleChange,
  onSubmit,
  isSubmitting,
}: PromptMakerFormProps) {
  const models = modelsFor(mediaType);
  const currentModel = models.find((option) => option.id === model);
  const canSubmit =
    description.trim().length >= MIN_DESCRIPTION_LENGTH && !isSubmitting;

  return (
    <div className="flex flex-col gap-5">
      {/* Media type */}
      <div className="flex items-center gap-2">
        {MEDIA_TYPES.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => onMediaTypeChange(type.value)}
            className={cn(
              "cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              mediaType === type.value
                ? "bg-background-lightest text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Description */}
      <div className="border-border bg-card rounded-2xl border p-4">
        <label
          htmlFor="prompt-maker-description"
          className="text-muted-foreground mb-1.5 block text-xs font-medium"
        >
          Describe what you want to create
        </label>
        <textarea
          id="prompt-maker-description"
          value={description}
          maxLength={MAX_DESCRIPTION_LENGTH}
          onChange={(event) => onDescriptionChange(event.target.value)}
          placeholder="A skateboarder mid-trick on a rain-slicked street at night…"
          rows={5}
          // The `!` suffixes are required: globals.css styles bare textareas
          // outside any @layer, which outranks plain utilities.
          className="custom-scrollbar text-foreground placeholder:text-muted-foreground min-h-[140px] w-full resize-none rounded-none! border-0! bg-transparent! px-0! py-0! text-base! outline-none!"
        />
        {description.length > COUNTER_THRESHOLD && (
          <p
            className={cn(
              "mt-1 text-right text-[11px]",
              description.length >= MAX_DESCRIPTION_LENGTH
                ? "text-red-400"
                : "text-muted-foreground",
            )}
          >
            {description.length} / {MAX_DESCRIPTION_LENGTH}
          </p>
        )}
      </div>

      {/* Model + settings */}
      <div className="border-border bg-card flex flex-col gap-3 rounded-2xl border p-4">
        <span className="text-muted-foreground text-xs font-medium">
          Choose your model
        </span>

        <Menu
          align="left"
          trigger={
            <div className="border-border bg-background-light hover:border-primary/50 flex w-[260px] max-w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors sm:w-[340px]">
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-white"
                style={{ background: TRI_GRADIENT }}
              >
                {currentModel?.svg}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-foreground truncate text-sm font-semibold">
                  {modelName(model)}
                </span>
                <span className="text-muted-foreground truncate text-[11px]">
                  {currentModel?.description}
                </span>
              </span>
              <ChevronDown className="text-muted-foreground ml-auto size-4 shrink-0" />
            </div>
          }
          menuClassName="max-h-[320px] overflow-y-auto custom-scrollbar w-[300px]"
        >
          {models.map((option) => (
            <MenuItem
              key={option.id}
              onClick={() => onModelChange(option.id)}
              className={cn(option.id === model && "bg-accent")}
            >
              <span className="flex size-5 shrink-0 items-center justify-center">
                {option.svg}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-sm">{option.name}</span>
                <span className="text-muted-foreground text-[11px]">
                  {option.description}
                </span>
              </span>
            </MenuItem>
          ))}
        </Menu>

        <div className="border-border/60 mt-1 flex flex-col gap-2 border-t pt-3">
          <span className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
            Model settings
          </span>
          <ModelSettingsRow
            model={model}
            settings={settings}
            onChange={onSettingChange}
          />
        </div>
      </div>

      {/* Visual style */}
      <div className="border-border bg-card flex flex-col gap-3 rounded-2xl border p-4">
        <span className="text-muted-foreground text-xs font-medium">
          Visual style
        </span>
        <VisualStylePicker value={visualStyle} onChange={onVisualStyleChange} />
      </div>

      {/* Reference images */}
      <div className="border-border flex flex-col gap-3 bg-card rounded-2xl border p-4">
        <span className="text-muted-foreground text-xs font-medium">
          Reference images
        </span>
        <ReferenceImagesField
          images={referenceImages}
          onChange={onReferenceImagesChange}
        />
      </div>

      {/* Submit */}
      <div className="relative group/btn self-start">
        <div
          className={cn(
            "pointer-events-none absolute -inset-2 rounded-full blur-xl transition-opacity duration-500",
            canSubmit
              ? "opacity-50 group-hover/btn:opacity-80"
              : "opacity-[0.07]",
          )}
          style={{ background: "var(--gradient-create)" }}
        />
        <div
          className="relative rounded-full p-px"
          style={{ background: "var(--gradient-create)" }}
        >
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            className={cn(
              "bg-background relative flex cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-200 disabled:cursor-not-allowed",
              canSubmit
                ? "text-foreground group-hover/btn:bg-background-light"
                : "text-muted-foreground",
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Create prompt
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
