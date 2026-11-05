"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { Media } from "@/features/media/types/media";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import { InfluencerParams } from "@/features/ai-influencer/components/InfluencerParams";
import { copyText } from "../utils/media-actions";

export function isUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function formatKey(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}

function formatValue(value: unknown): string {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ");
  if (value && typeof value === "object") {
    return Object.entries(value)
      .map(([k, v]) => `${formatKey(k)}: ${formatValue(v)}`)
      .join(" · ");
  }
  return String(value);
}

/** Skips empty values and defaults that say nothing (e.g. variation 0). */
export function isEmptyParam(key: string, value: unknown) {
  if (value === null || value === undefined || value === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === "object" && !Array.isArray(value) && !Object.keys(value).length)
    return true;
  return key === "variationIndex" && value === 0;
}

export function ReferenceThumb({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all text-xs text-blue-400 underline hover:text-blue-300"
      >
        {url}
      </a>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Reference"
        onError={() => setFailed(true)}
        className="h-20 w-20 rounded-lg border border-white/10 object-cover transition-opacity hover:opacity-80"
      />
    </a>
  );
}

export function ParamsSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] tracking-widest text-white/40 uppercase">{title}</p>
        {action}
      </div>
      {children}
    </div>
  );
}

export function ParamRows({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <div className="flex flex-col divide-y divide-white/5 rounded-xl border border-white/5 bg-white/[0.03]">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-start justify-between gap-4 px-3 py-2">
          <span className="shrink-0 text-xs text-white/45">{label}</span>
          <span className="text-right text-xs break-words text-white/85">{value}</span>
        </div>
      ))}
    </div>
  );
}

/** The inputs a media item was generated with: prompt, settings and references. */
export function MediaParams({ media }: { media: Media }) {
  const input = (media.input ?? {}) as Record<string, unknown>;

  if (media.model === AiModelsEnum.HIGGSFIELD_AI_INFLUENCER) {
    return <InfluencerParams input={input} />;
  }

  const prompt = typeof input.prompt === "string" ? input.prompt : "";

  // Split the remaining inputs into reference media and plain settings.
  const references: string[] = [];
  const settings: [string, React.ReactNode][] = [];
  Object.entries(input).forEach(([key, value]) => {
    if (key === "prompt" || isEmptyParam(key, value)) return;
    if (isUrl(value)) references.push(value);
    else if (Array.isArray(value) && value.every(isUrl)) references.push(...value);
    else settings.push([formatKey(key), formatValue(value)]);
  });

  return (
    <>
      {prompt && (
        <ParamsSection
          title="Prompt"
          action={
            <button
              type="button"
              onClick={() => copyText(prompt, "Prompt copied")}
              title="Copy prompt"
              className="text-white/40 transition-colors hover:text-white"
            >
              <Copy className="size-3.5" />
            </button>
          }
        >
          <p className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-sm leading-relaxed whitespace-pre-wrap text-white/85">
            {prompt}
          </p>
        </ParamsSection>
      )}

      {settings.length > 0 && (
        <ParamsSection title="Settings">
          <ParamRows rows={settings} />
        </ParamsSection>
      )}

      {references.length > 0 && (
        <ParamsSection title="References">
          <div className="flex flex-wrap gap-2">
            {references.map((url, i) => (
              <ReferenceThumb key={url + i} url={url} />
            ))}
          </div>
        </ParamsSection>
      )}
    </>
  );
}
