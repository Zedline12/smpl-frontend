"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const [anchor, setAnchor] = useState<{ top: number; left: number } | null>(null);
  const currentModel = useAiGenerationControlStore((state) => state.model);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const open = (type: GenerationTypeEnum, target?: HTMLElement) => {
    clearCloseTimer();
    if (target) {
      const rect = target.getBoundingClientRect();
      setAnchor({ top: rect.bottom + 8, left: Math.max(12, Math.min(rect.left, window.innerWidth - 472)) });
    }
    setOpenType(type);
  };

  // Delayed so the pointer can cross the gap between the trigger and the card.
  const scheduleClose = () => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpenType(null), CLOSE_DELAY);
  };

  useEffect(() => clearCloseTimer, []);

  // Never let the card survive a navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpenType(null);
  }

  useEffect(() => {
    if (!openType) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenType(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openType]);

  const goTo = (href: string) => {
    clearCloseTimer();
    setOpenType(null);
    router.push(href);
  };

  const handleTypeClick = (type: GenerationTypeEnum) => {
    // setMediaType already selects that type's default model.
    setMediaType(type);
    goTo(`/create/${type}`);
  };

  const handleModelSelect = (type: GenerationTypeEnum, selected: Model) => {
    // Order matters — setMediaType resets the model to the type's default.
    setMediaType(type);
    setModel(selected.id);
    // The model in the URL too, so the page opens on it (and the link can be shared).
    goTo(`/create/${type}?model=${encodeURIComponent(selected.id)}`);
  };

  const activeCard = MEDIA_TYPES.find((type) => type.value === openType);

  return (
    <div
      className="relative flex shrink-0 items-center gap-0.5 sm:gap-1"
      onMouseEnter={clearCloseTimer}
      onMouseLeave={scheduleClose}
    >
      {MEDIA_TYPES.map((type) => {
        const isOpen = openType === type.value;
        // Ads Studio lives on the image page but has its own navbar link.
        const isCurrent =
          pathname.startsWith(`/create/${type.value}`) &&
          !(type.value === GenerationTypeEnum.IMAGE && currentModel === "higgsfield-ads-studio");

        return (
          <button
            key={type.value}
            type="button"
            onClick={() => handleTypeClick(type.value)}
            onMouseEnter={(e) => open(type.value, e.currentTarget)}
            onFocus={(e) => open(type.value, e.currentTarget)}
            aria-expanded={isOpen}
            className={cn(
              "shrink-0 cursor-pointer rounded-lg px-2 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors sm:px-2.5 sm:text-sm",
              isCurrent
                ? "text-primary"
                : isOpen
                  ? "bg-accent text-foreground"
                  : "text-foreground/55 hover:text-foreground",
            )}
          >
            {type.label}
          </button>
        );
      })}

      {activeCard &&
        anchor &&
        createPortal(
          <ModelCard
            models={activeCard.models}
            style={{ top: anchor.top, left: anchor.left }}
            onMouseEnter={clearCloseTimer}
            onMouseLeave={scheduleClose}
            onSelect={(selected) => handleModelSelect(activeCard.value, selected)}
          />,
          document.body,
        )}
    </div>
  );
}
