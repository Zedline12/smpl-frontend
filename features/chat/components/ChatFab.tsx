"use client";

import Image from "next/image";
import { X } from "lucide-react";

const TRI_GRADIENT =
  "linear-gradient(135deg, #6b41ff 0%, #ea4bff 50%, #ff6b00 100%)";

interface ChatFabProps {
  isOpen: boolean;
  onClick: () => void;
}

export function ChatFab({ isOpen, onClick }: ChatFabProps) {
  return (
    // The wrapper owns the positioning so the button's hover scale can't
    // interfere with the centring translate.
    <div className="fixed top-1/2 right-4 z-[110] -translate-y-1/2 sm:right-6">
      <button
        type="button"
        onClick={onClick}
        aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
        aria-expanded={isOpen}
        style={{
          background: TRI_GRADIENT,
          backgroundSize: "200% 200%",
        }}
        className="animate-tri-glow block cursor-pointer rounded-full p-[1.5px] transition-transform duration-300 hover:scale-105 active:scale-95"
      >
        <span
          className="flex size-14 items-center justify-center rounded-full leading-none"
          style={{ background: "#080808" }}
        >
          {isOpen ? (
            <X className="size-6 text-white" />
          ) : (
            // block: an inline <img> picks up baseline descender space.
            // object-contain: the source is 286x273, so a square box would
            // squash it — this letterboxes and centres the artwork instead.
            <Image
              src="/robot.png"
              alt=""
              width={56}
              height={56}
              className="animate-robot-glow block size-7 object-contain"
            />
          )}
        </span>
      </button>
    </div>
  );
}
