"use client";

import { KeyboardEvent, useEffect, useLayoutEffect, useRef } from "react";
import { Loader2, SendHorizonal } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_MESSAGE_LENGTH } from "../types/chat";

const MAX_TEXTAREA_HEIGHT = 160;
const COUNTER_THRESHOLD = MAX_MESSAGE_LENGTH - 500;

interface ComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSending: boolean;
}

export function Composer({
  value,
  onChange,
  onSubmit,
  isSending,
}: ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow. The global bare-`textarea` rule bakes 9px/12px padding into
  // scrollHeight, which is why the padding is zeroed out in the classes below.
  useLayoutEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }, [value]);

  useEffect(() => {
    // Don't pop the soft keyboard open on touch devices.
    if (window.matchMedia("(pointer: fine)").matches) {
      textareaRef.current?.focus();
    }
  }, []);

  const canSend = value.trim().length > 0 && !isSending;

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    // Enter inserts a newline on touch keyboards, and must never interrupt an
    // IME composition.
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if ((event.nativeEvent as unknown as { isComposing?: boolean }).isComposing)
      return;

    event.preventDefault();
    if (canSend) onSubmit();
  };

  return (
    <div className="border-border bg-card shrink-0 border-t p-3">
      <div className="border-border bg-background-light focus-within:border-primary/50 flex items-end gap-2 rounded-2xl border px-3 py-2 transition-colors">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          maxLength={MAX_MESSAGE_LENGTH}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the assistant…"
          aria-label="Message"
          // The `!` suffixes are required: app/globals.css styles bare
          // textareas outside any @layer, so it outranks plain utilities.
          className={cn(
            "custom-scrollbar max-h-40 flex-1 resize-none",
            "border-0! bg-transparent! px-0! py-1! text-sm! rounded-none! outline-none!",
            "placeholder:text-muted-foreground",
          )}
        />

        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSend}
          aria-label="Send message"
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 transition-opacity",
            canSend
              ? "bg-gradient-primary cursor-pointer text-white hover:opacity-90"
              : "bg-background-lighter text-muted-foreground cursor-not-allowed",
          )}
        >
          {isSending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <SendHorizonal className="size-4" />
          )}
        </button>
      </div>

      {value.length > COUNTER_THRESHOLD && (
        <p
          className={cn(
            "mt-1.5 text-right text-[11px]",
            value.length >= MAX_MESSAGE_LENGTH
              ? "text-red-400"
              : "text-muted-foreground",
          )}
        >
          {value.length} / {MAX_MESSAGE_LENGTH}
        </p>
      )}
    </div>
  );
}
