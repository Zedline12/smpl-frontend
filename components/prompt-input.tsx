"use client";

import React, { useState } from "react";
import { aiMediaService, MediaType } from "@/lib/api/services/ai-media.service";
import { toast } from "sonner";

interface PromptInputProps {
  projectId?: string;
}

export function PromptInput({ projectId }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [mediaType, setMediaType] = useState<MediaType>("image");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    if (!projectId) {
      toast.error("Please select a project first");
      return;
    }

    setIsGenerating(true);
    try {
      await aiMediaService.generateMedia({
        prompt,
        mediaType,
        projectId,
      });
      toast.success("Generation started!");
      setPrompt("");
    } catch (error: any) {
      // Error handled by apiFetch
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 p-1 rounded-2xl shadow-lg border border-blue-100">
      <div className="bg-white rounded-xl p-4">
        <form onSubmit={handleSubmit} className="relative">
          <div className="mb-4 flex items-center gap-4 border-b border-gray-100 pb-2">
            <button
              type="button"
              onClick={() => setMediaType("image")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                mediaType === "image"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
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
              onClick={() => setMediaType("video")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                mediaType === "video"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
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

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`Describe what ${mediaType} you want to create...`}
            className="w-full min-h-[120px] p-4 text-lg text-gray-700 placeholder-gray-400 bg-transparent border-none focus:ring-0 resize-none outline-none"
          />

          <div className="flex items-center justify-between pt-4 border-t border-gray-100/50 mt-2">
            <div className="flex items-center gap-2">
              {/* Optional: Add extra controls like reference upload here later */}
            </div>

            <button
              type="submit"
              disabled={!prompt.trim() || isGenerating}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-md shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
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
                  Generate
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
