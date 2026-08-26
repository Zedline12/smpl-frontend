"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  AUDIO_MODELS,
  IMAGE_MODELS,
  Model,
  VIDEO_MODELS,
} from "@/features/generation/enums/models.enum";
import { GenerationTypeEnum } from "@/features/generation/types/generation";
import { useAiGenerationControlStore } from "@/stores/useAiGenerationControlStore";
import { ModelCard } from "./ModelCard";

const CLOSE_DELAY = 120;

const MEDIA_TYPES: {
  value: GenerationTypeEnum;
  label: string;
  models: Model[];
}[] = [
  { value: GenerationTypeEnum.IMAGE, label: "Image", models: IMAGE_MODELS },
  { value: GenerationTypeEnum.VIDEO, label: "Video", models: VIDEO_MODELS },
  { value: GenerationTypeEnum.AUDIO, label: "Audio", models: AUDIO_MODELS },
];

export function MediaTypeLauncher() {
  const router = useRouter();
  const pathname = usePathname();

  // Deliberately does not read `mediaType` / `model` — the launcher is a
  // shortcut, not a mirror of the composer's current selection.
  const setMediaType = useAiGenerationControlStore(
    (state) => state.setMediaType,
  );
  const setModel = useAiGenerationControlStore((state) => state.setModel);

  const [openType, setOpenType] = useState<GenerationTypeEnum | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const open = (type: GenerationTypeEnum) => {
    clearCloseTimer();
    setOpenType(type);
  };

  // Delayed so the pointer can cross the gap between the trigger and the card.
  const scheduleClose = () => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpenType(null), CLOSE_DELAY);
  };

  useEffect(() => clearCloseTimer, []);

  // Never let the card survive a navigation.
  useEffect(() => {
    clearCloseTimer();
    setOpenType(null);
  }, [pathname]);

  useEffect(() => {
    if (!openType) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenType(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openType]);

  const goToCreate = () => {
    clearCloseTimer();
    setOpenType(null);
    router.push("/create");
  };

  const handleTypeClick = (type: GenerationTypeEnum) => {
    // setMediaType already selects that type's default model.
    setMediaType(type);
    goToCreate();
  };

  const handleModelSelect = (type: GenerationTypeEnum, selected: Model) => {
    // Order matters — setMediaType resets the model to the type's default.
    setMediaType(type);
    setModel(selected.id);
    goToCreate();
  };

  const activeCard = MEDIA_TYPES.find((type) => type.value === openType);

  return (
    <div
      className="relative hidden md:flex md:items-center md:gap-1"
      onMouseEnter={clearCloseTimer}
      onMouseLeave={scheduleClose}
    >
      {MEDIA_TYPES.map((type) => {
        const isOpen = openType === type.value;

        return (
          <button
            key={type.value}
            type="button"
            onClick={() => handleTypeClick(type.value)}
            onMouseEnter={() => open(type.value)}
            onFocus={() => open(type.value)}
            aria-expanded={isOpen}
            className={cn(
              "cursor-pointer rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors",
              isOpen
                ? "bg-accent text-foreground"
                : "text-foreground/75 hover:text-foreground",
            )}
          >
            {type.label}
          </button>
        );
      })}

      {activeCard && (
        <ModelCard
          models={activeCard.models}
          onSelect={(selected) => handleModelSelect(activeCard.value, selected)}
        />
      )}
    </div>
  );
}
