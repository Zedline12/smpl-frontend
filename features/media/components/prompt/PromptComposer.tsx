"use client";
import React, { useRef, useState } from "react";
import PromptInputHeader from "@/features/media/components/prompt/PromptComposerHeader";
import { MediaType } from "@/features/media/types/media";
import { GenerateMediaRequest } from "@/features/media/types/api";
import { useImageGenerationMutation } from "@/features/generation/hooks/generation";
import {
  GenerateImageRequest,
  GenerateVideoRequest,
} from "@/features/generation/types/api";
import ImageComposer from "./ImageComposer";
import VideoComposer from "./VideoComposer";
import { useImageGenerationStore } from "@/stores/useImageGenerationStore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
export interface MediaComposerHandle {
  isValid: boolean;
  getPayload(): GenerateImageRequest | GenerateVideoRequest;
  reset(): void;
}

interface PromptComposerProps {
  isGenerating: boolean;
  onGeneration: (data: GenerateMediaRequest) => void;
}
export default function PromptComposer() {
  const router = useRouter();
  const [mediaType, setMediaType] = useState<MediaType>("image");
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const imageGeneration = useImageGenerationMutation();

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFocus = () => setIsFocused(true);

  return (
    <div
      ref={containerRef}
      onFocus={handleFocus}
      onClick={handleFocus}
      className="w-full bg-black/50 backdrop-blur-lg   rounded-2xl shadow-xl   transition-all duration-100"
    >
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isFocused ? "max-h-[100px] " : "max-h-0 "
        }`}
      >
        <PromptInputHeader mediaType={mediaType} onSelect={setMediaType} />
      </div>

      <div className="p-2 ">
        {mediaType === "image" && (
          <ImageComposer
            isFocused={isFocused}
          />
        )}
        {mediaType === "video" && (
          <VideoComposer
            isFocused={isFocused}
          />
        )}
      </div>
    </div>
  );
}
