"use client";

import { AspectRatio } from "@/features/media/types/media";
import { useState, useRef, useEffect } from "react";

interface AspectRatioSelectorProps {
  value: AspectRatio;
  options: readonly AspectRatio[];
  onChange: (value: AspectRatio) => void;
}

export function AspectRatioSelector({
  value,
  options,
  onChange,
}: AspectRatioSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const ratios: { label: AspectRatio; width: number; height: number }[] = [
    { label: "16:9", width: 32, height: 18 },
    { label: "4:3", width: 24, height: 18 },
    { label: "1:1", width: 24, height: 24 },
    { label: "3:4", width: 18, height: 24 },
    { label: "9:16", width: 18, height: 32 },
    { label: "5:4", width: 25, height: 20 },
  ];
  const validRatios = ratios.filter((ratio) => options.includes(ratio.label));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-colors backdrop-blur-sm bg-white/10 border border-white/20"
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
        {value}
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 w-72 bg-white/80 backdrop-blur-xl rounded-xl shadow-xl border border-white/40 p-3 z-50 animate-fade-in-up">
          <div className="grid grid-cols-3 gap-2">
            {validRatios.map((ratio) => (
              <button
                key={ratio.label}
                type="button"
                onClick={() => {
                  onChange(ratio.label);
                  setIsOpen(false);
                }}
                className={`flex flex-col items-center gap-2 p-2 rounded-lg transition-colors ${
                  value === ratio.label
                    ? "bg-blue-50 text-blue-600"
                    : "hover:bg-gray-50 text-gray-600"
                }`}
              >
                <div
                  className={`border-2 rounded-sm ${
                    value === ratio.label
                      ? "border-blue-500 bg-blue-100"
                      : "border-gray-300 bg-gray-100"
                  }`}
                  style={{
                    width: `${ratio.width}px`,
                    height: `${ratio.height}px`,
                  }}
                />
                <span className="text-xs font-medium">{ratio.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
