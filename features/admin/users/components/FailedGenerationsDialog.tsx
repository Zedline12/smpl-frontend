"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { FailedGeneration } from "../types/types";

function formatKey(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}

function isImageUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    return /\.(jpg|jpeg|png|gif|webp|avif|svg)(\?|$)/i.test(url.pathname) || url.hostname.includes("cdn") || url.hostname.includes("storage") || url.hostname.includes("blob");
  } catch {
    return false;
  }
}

function isUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function InputValue({ value }: { value: unknown }) {
  if (isImageUrl(value)) {
    return (
      <img
        src={value}
        alt="Input"
        className="max-h-48 rounded-lg object-contain"
      />
    );
  }
  if (isUrl(value)) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 text-sm break-all underline"
      >
        {value}
      </a>
    );
  }
  return (
    <p className="text-white/80 text-sm leading-relaxed">{String(value)}</p>
  );
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  failedGenerations: FailedGeneration[];
}

export function FailedGenerationsDialog({ open, onOpenChange, failedGenerations }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full p-0 bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden max-h-[85vh] flex flex-col gap-0">
        <DialogTitle className="px-6 py-4 border-b border-white/10 text-base font-semibold text-white flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 text-red-400">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
          Failed Generations
          <span className="ml-auto text-xs font-normal text-white/40">{failedGenerations.length} total</span>
        </DialogTitle>

        <div className="overflow-y-auto flex flex-col divide-y divide-white/5">
          {failedGenerations.map((gen, idx) => {
            const inputEntries = Object.entries(gen.input ?? {}).filter(
              ([, v]) => v !== null && v !== undefined && v !== ""
            );

            return (
              <div key={gen.id ?? idx} className="px-6 py-5 space-y-4">
                {/* Category + message */}
                <div className="space-y-1.5">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/20">
                    {gen.category}
                  </span>
                  <p className="text-base text-white/90 leading-snug">{gen.clientMessage}</p>
                  {gen.createdAt && (
                    <p className="text-xs text-white/30 mt-3">{gen.createdAt}</p>
                  )}
                </div>

                {/* Model */}
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Model</p>
                  <p className="text-sm text-white/80 font-medium">{gen.model}</p>
                </div>

                {/* Input */}
                {inputEntries.length > 0 && (
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest mb-3">Input</p>
                    <div className="flex flex-col gap-3">
                      {inputEntries.map(([key, value]) => (
                        <div key={key}>
                          <p className="text-[11px] text-white/40 mb-1">{formatKey(key)}</p>
                          <InputValue value={value} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
