"use client";

import React, { useState } from "react";
import { aiMediaService } from "@/lib/api/services/ai-media.service";
import { toast } from "sonner";
import { ResolutionSelector } from "./resolution-selector";
import { AspectRatioSelector } from "./aspect-ratio-selector";
import { MediaType, Resolution, AspectRatio } from "@/lib/types/ai-media.type";
import { useMediaCost } from "../hooks/use-media-cost";

import { ProjectSelector } from "@/features/projects/components/project-selector";

interface PromptInputProps {
  projectId?: string;
}

export function PromptInput({ projectId }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [mediaType, setMediaType] = useState<MediaType>("IMAGE");
  const [resolution, setResolution] = useState<Resolution>("1k");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [imageSlots, setImageSlots] = useState<(File | null)[]>([null]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(
    "694ecece580530ed4e35bb0c",
  );
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const containerRef = React.useRef<HTMLDivElement>(null);

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

  const currentProjectId = projectId || selectedProjectId;
  const { creditsCost } = useMediaCost(resolution);

  const handleAddSlot = () => {
    if (imageSlots.length < 5) {
      setImageSlots([...imageSlots, null]);
    }
  };

  const handleRemoveSlot = () => {
    if (imageSlots.length > 1) {
      setImageSlots(imageSlots.slice(0, -1));
    }
  };

  const handleFileChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const newSlots = [...imageSlots];
      newSlots[index] = file;
      setImageSlots(newSlots);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    if (!currentProjectId) {
      toast.error("Please select a project first");
      return;
    }

    setIsGenerating(true);
    try {
      const referenceImages = imageSlots.filter(
        (slot): slot is File => slot !== null,
      );
      await aiMediaService.generateMedia({
        prompt,
        mediaType,
        projectId: currentProjectId,
        resolution,
        aspectRatio,
        referenceImages,
      });
      toast.success("Generation started!");
      setPrompt("");
      setImageSlots([null]);
    } catch (error: any) {
      // Error handled by apiFetch
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      ref={containerRef}
      onFocus={handleFocus}
      onClick={handleFocus}
      className="w-full bg-black/50 backdrop-blur-lg   rounded-2xl shadow-xl border border-white/30  transition-all duration-100"
    >
      <form onSubmit={handleSubmit} className="relative flex flex-col">
        {/* Navbar-like Header */}
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isFocused ? "max-h-[100px] " : "max-h-0 "
          }`}
        >
          <div className="flex items-center justify-between gap-4 backdrop-blur-3xl border-b border-black/10 px-4 py-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMediaType("IMAGE")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  mediaType === "IMAGE"
                    ? " text-secondary shadow-sm backdrop-blur-sm"
                    : "text-white hover:text-gray-800 hover:bg-white/20"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Image
              </button>
              <button
                type="button"
                onClick={() => setMediaType("VIDEO")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  mediaType === "VIDEO"
                    ? "text-secondary shadow-sm backdrop-blur-sm"
                    : "text-white hover:text-gray-800 hover:bg-white/20"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Video
              </button>
            </div>

            <ProjectSelector
              selectedProjectId={currentProjectId}
              onSelect={setSelectedProjectId}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="p-2 text-white">
          <div className="flex flex-row  gap-4">
            <div className="flex flex-row items-center  p-2 bg-gradient-to-r from-primary to-tertiary rounded-lg h-20 self-start">
              <button
                type="button"
                onClick={handleRemoveSlot}
                className="  hover:bg-white/20 rounded transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 12h14"
                  />
                </svg>
              </button>
              <span className="w-8 text-center font-bold">
                {imageSlots.length}
              </span>
              <button
                type="button"
                onClick={handleAddSlot}
                className=" hover:bg-white/20 rounded transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </button>
            </div>

            {imageSlots.map((slot, index) => (
              <div
                key={index}
                className="relative group w-20 h-20 bg-gray-600/50 hover:bg-gray-500/50 rounded-xl flex items-center justify-center cursor-pointer overflow-hidden border border-white/10 transition-all"
                onClick={() => fileInputRefs.current[index]?.click()}
              >
                {slot ? (
                  <img
                    src={URL.createObjectURL(slot)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6 text-gray-400 group-hover:text-white transition-colors"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                    />
                  </svg>
                )}
                <input
                  type="file"
                  ref={(el) => {
                    fileInputRefs.current[index] = el;
                  }}
                  onChange={(e) => handleFileChange(index, e)}
                  className="hidden"
                  accept="image/*"
                />
              </div>
            ))}

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Describe what ${mediaType} you want to create...`}
              className="flex-1 min-h-[100px] text-lg text-white  bg-transparent border-none focus:ring-0 resize-none outline-none pt-2"
            />
          </div>

          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              isFocused ? "max-h-[100px] " : "max-h-0 "
            }`}
          >
            <div className="flex items-center justify-between pt-4 border-t border-white/20 ">
              <div className="flex items-center gap-2">
                <ResolutionSelector
                  value={resolution}
                  onChange={setResolution}
                  disabled={isGenerating}
                />
                <AspectRatioSelector
                  value={aspectRatio}
                  onChange={setAspectRatio}
                  disabled={isGenerating}
                />
              </div>

              <button
                type="submit"
                disabled={!prompt.trim() || isGenerating}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600/90 hover:bg-blue-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none backdrop-blur-sm"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Generate {creditsCost !== null ? `(${creditsCost})` : ""}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
