"use client";

import React from "react";

interface ImageSlotsProps {
  imageSlots:(File | null)[];
  onChange: (imageSlots:(File | null)[]) => void;
}
export default function ImageSlots({ imageSlots, onChange }: ImageSlotsProps) {
      const fileInputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
     const handleAddSlot = () => {
        if (imageSlots.length < 5) {
          onChange([...imageSlots, null]);
        }
      };
    
      const handleRemoveSlot = () => {
        if (imageSlots.length >= 1) {
          onChange(imageSlots.slice(0, -1));
          console.log(imageSlots.length)
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
            onChange(newSlots);
        }
    };
    return (
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
        </div>
    )
}