"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const TRI_GRADIENT =
  "linear-gradient(135deg, #6b41ff 0%, #ea4bff 50%, #ff6b00 100%)";

interface ChatFabProps {
  isOpen: boolean;
  onClick: () => void;
  /** px offset that clears a fixed prompt composer, when there is one. */
  bottomOffset: number | null;
}

export function ChatFab({ isOpen, onClick, bottomOffset }: ChatFabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
      aria-expanded={isOpen}
      style={{
        background: TRI_GRADIENT,
        backgroundSize: "200% 200%",
        ...(bottomOffset !== null ? { bottom: bottomOffset } : null),
      }}
      className={cn(
        "animate-tri-glow fixed right-4 bottom-24 z-[110] cursor-pointer rounded-full p-[1.5px]",
        "transition-transform duration-300 hover:scale-105 active:scale-95",
        "sm:right-6 sm:bottom-6",
      )}
    >
      <span
        className="flex size-14 items-center justify-center rounded-full"
        style={{ background: "#080808" }}
      >
        {isOpen ? (
          <X className="size-6 text-white" />
        ) : (
          <Image
            src="/robot.png"
            alt=""
            width={28}
            height={28}
            className="animate-robot-glow"
          />
        )}
      </span>
    </button>
  );
}
