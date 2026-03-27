"use client";

import { Menu, MenuItem } from "@/components/menu";
import ResolutionSelectorComponent from "@/features/generation/components/selectors/ResolutionSelector"
import { ImageResolution, VideoResolution } from "@/features/media/types/media";
interface ResolutionSelectorProps {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}

export function ResolutionSelector({
  options,
  value,
  onChange,
}: ResolutionSelectorProps) {
  return (
    <Menu
      direction="up"
      trigger={
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-colors backdrop-blur-sm bg-white/10 border border-white/20">
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
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
          {value.toUpperCase()}
        </div>
      }
      align="left"
    >
      <MenuItem>
        <ResolutionSelectorComponent options={options as (ImageResolution | VideoResolution)[]} value={value as (ImageResolution | VideoResolution)} onChange={onChange} />
      </MenuItem>
      {/* {options.map((option) => (
        <MenuItem
          key={option}
          onClick={() => onChange(option)}
          className={
            value === option
              ? "bg-blue-50/10 text-blue-400"
              : "text-gray-300 hover:bg-white/10"
          }
        >
          {option.toUpperCase()}
        </MenuItem>
      ))} */}
    </Menu>
  );
}
