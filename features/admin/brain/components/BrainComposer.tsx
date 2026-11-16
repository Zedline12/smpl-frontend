"use client";

import { KeyboardEvent, forwardRef, useImperativeHandle, useLayoutEffect, useRef } from "react";
import { ArrowUp, Square } from "lucide-react";
import { cn } from "@/lib/utils";

export const MAX_BRAIN_MESSAGE = 4000;
const MAX_HEIGHT = 200;

export interface BrainComposerHandle {
  focus: () => void;
}

/** Enter sends (Shift+Enter for a new line); while Brain works the button stops it. */
export const BrainComposer = forwardRef<
  BrainComposerHandle,
  { value: string; onChange: (v: string) => void; onSubmit: () => void; onStop: () => void; busy: boolean }
>(function BrainComposer({ value, onChange, onSubmit, onStop, busy }, ref) {
  const textarea = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(ref, () => ({ focus: () => textarea.current?.focus() }), []);

  // Auto-grow (globals.css pads bare textareas, hence the zeroed padding below).
  useLayoutEffect(() => {
    const el = textarea.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  }, [value]);

  const canSend = value.trim().length > 0 && !busy;

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter" || e.shiftKey) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if ((e.nativeEvent as unknown as { isComposing?: boolean }).isComposing) return;
    e.preventDefault();
    if (canSend) onSubmit();
  };

  return (
    <div className="px-4 pb-4 pt-2 md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-end gap-2 rounded-2xl border border-white/[0.1] bg-[#151515] px-3.5 py-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-colors focus-within:border-[#6b41ff]/50">
          <textarea
            ref={textarea}
            rows={1}
            value={value}
            maxLength={MAX_BRAIN_MESSAGE}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about users, revenue, usage, errors, support…"
            aria-label="Ask Smpl Brain"
            className="custom-scrollbar max-h-[200px] flex-1 resize-none border-0! bg-transparent! px-0! py-1.5! text-[14px]! rounded-none! outline-none! placeholder:text-white/30"
          />
          {busy ? (
            <button
              type="button"
              onClick={onStop}
              aria-label="Stop"
              title="Stop"
              className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/[0.08] text-white hover:bg-white/[0.14]"
            >
              <Square className="size-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onSubmit}
              disabled={!canSend}
              aria-label="Send"
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-xl transition-opacity",
                canSend ? "bg-gradient-primary text-white hover:opacity-90" : "cursor-not-allowed bg-white/[0.06] text-white/30",
              )}
            >
              <ArrowUp className="size-4" />
            </button>
          )}
        </div>
        <p className="mt-1.5 flex justify-between px-1 text-[11px] text-white/30">
          <span>Reads live data. Changes always wait for your confirmation.</span>
          {value.length > MAX_BRAIN_MESSAGE - 500 && (
            <span className={value.length >= MAX_BRAIN_MESSAGE ? "text-red-400" : ""}>
              {value.length} / {MAX_BRAIN_MESSAGE}
            </span>
          )}
        </p>
      </div>
    </div>
  );
});
