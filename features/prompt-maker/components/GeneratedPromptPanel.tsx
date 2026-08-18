"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Check, Copy, Wand2 } from "lucide-react";
import { PromptMaker } from "../types/prompt-maker";

interface GeneratedPromptPanelProps {
  result: PromptMaker;
  onUseInComposer: () => void;
}

export function GeneratedPromptPanel({
  result,
  onUseInComposer,
}: GeneratedPromptPanelProps) {
  const promptRef = useRef<HTMLParagraphElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // navigator.clipboard needs a secure context — `next dev` binds 0.0.0.0, so
    // it is undefined when the app is opened over plain http on a LAN address.
    if (!navigator.clipboard?.writeText) {
      const node = promptRef.current;
      if (node) {
        const range = document.createRange();
        range.selectNodeContents(node);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      toast.info("Select the prompt and press Ctrl+C to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(result.generatedPrompt);
      setCopied(true);
      toast.success("Prompt copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy the prompt");
    }
  };

  return (
    <div className="border-border bg-card rounded-2xl border p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-foreground text-sm font-semibold">
          Generated prompt
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="border-border hover:bg-background-light text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors"
          >
            {copied ? (
              <Check className="size-3.5" />
            ) : (
              <Copy className="size-3.5" />
            )}
            Copy
          </button>
          <button
            type="button"
            onClick={onUseInComposer}
            className="bg-gradient-primary flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Wand2 className="size-3.5" />
            Use in create composer
          </button>
        </div>
      </div>

      <p
        ref={promptRef}
        className="text-foreground text-sm leading-relaxed whitespace-pre-wrap"
      >
        {result.generatedPrompt}
      </p>
    </div>
  );
}
