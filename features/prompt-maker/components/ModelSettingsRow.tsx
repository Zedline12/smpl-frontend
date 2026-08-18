"use client";

import { Menu, MenuItem } from "@/components/menu";
import AspectRatioSelectorComponent from "@/features/generation/components/selectors/AspectRatioSelector";
import ResolutionSelector from "@/features/generation/components/selectors/ResolutionSelector";
import DurationSelector from "@/features/generation/components/selectors/DurationSelector";
import GenerateAudioSelector from "@/features/generation/components/selectors/GenerateAudioSelector";
import QualitySelector from "@/features/generation/components/selectors/QualitySelector";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import { settingsSpecFor } from "../types/model-settings";
import { PromptMakerSettings } from "../types/prompt-maker";

const TRIGGER_CLASS =
  "flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background-light px-3 py-1.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-background-lightest";

interface ModelSettingsRowProps {
  model: AiModelsEnum;
  settings: PromptMakerSettings;
  onChange: (key: string, value: unknown) => void;
}

export function ModelSettingsRow({
  model,
  settings,
  onChange,
}: ModelSettingsRowProps) {
  const spec = settingsSpecFor(model);
  const hasAny = Object.keys(spec).length > 0;

  if (!hasAny) {
    return (
      <p className="text-muted-foreground text-xs">
        No adjustable settings for this model.
      </p>
    );
  }

  const durationKey = spec.duration?.key;
  const durationValue = durationKey
    ? (settings[durationKey] as number)
    : undefined;

  return (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2">
      {spec.aspectRatio && (
        <Menu
          trigger={
            <div className={TRIGGER_CLASS}>
              {(settings.aspectRatio as string) ?? spec.aspectRatio[0]}
            </div>
          }
          align="left"
        >
          <MenuItem className="p-0 m-0 sm:w-100 w-[200px]">
            <AspectRatioSelectorComponent
              options={spec.aspectRatio as any}
              value={
                ((settings.aspectRatio as string) ?? spec.aspectRatio[0]) as any
              }
              onChange={(value: any) => onChange("aspectRatio", value)}
            />
          </MenuItem>
        </Menu>
      )}

      {spec.resolution && (
        <Menu
          trigger={
            <div className={TRIGGER_CLASS}>
              {(settings.resolution as string) ?? spec.resolution[0]}
            </div>
          }
          align="left"
        >
          <MenuItem className="p-0 m-0 sm:w-100 w-[max-content]">
            <ResolutionSelector
              options={spec.resolution as any}
              value={
                ((settings.resolution as string) ?? spec.resolution[0]) as any
              }
              onChange={(value) => onChange("resolution", value)}
            />
          </MenuItem>
        </Menu>
      )}

      {spec.duration && durationKey && (
        <Menu
          trigger={
            <div className={TRIGGER_CLASS}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-4 shrink-0"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z"
                  clipRule="evenodd"
                />
              </svg>
              Duration: {durationValue ?? spec.duration.options[0]}s
            </div>
          }
          align="left"
        >
          <MenuItem className="p-0 m-0 sm:w-100 w-[max-content]">
            <DurationSelector
              options={spec.duration.options}
              value={durationValue ?? spec.duration.options[0]}
              onChange={(value) => onChange(durationKey, value)}
            />
          </MenuItem>
        </Menu>
      )}

      {spec.quality && (
        <Menu
          trigger={
            <div className={`${TRIGGER_CLASS} capitalize`}>
              Quality: {(settings.quality as string) ?? spec.quality[0]}
            </div>
          }
          align="left"
        >
          <MenuItem className="p-0 m-0 sm:w-100 w-[240px]">
            <QualitySelector
              options={spec.quality}
              value={(settings.quality as string) ?? spec.quality[0]}
              onChange={(value) => onChange("quality", value)}
            />
          </MenuItem>
        </Menu>
      )}

      {spec.generateAudio && (
        <Menu
          trigger={
            <div className={TRIGGER_CLASS}>
              Audio: {settings.generateAudio ? "Yes" : "No"}
            </div>
          }
          align="left"
        >
          <MenuItem className="p-0 m-0 sm:w-100 w-[240px]">
            <GenerateAudioSelector
              value={Boolean(settings.generateAudio)}
              onChange={(value) => onChange("generateAudio", value)}
            />
          </MenuItem>
        </Menu>
      )}
    </div>
  );
}
