"use client";

import {
  AiInfluencerInputConst,
  AiInfluencerTier,
  TIER_LABELS,
} from "@/features/generation/types/models/higgsfield-ai-influencer.type";
import {
  ParamRows,
  ParamsSection,
  ReferenceThumb,
} from "@/features/media/components/MediaParams";
import { categoriesForTier, useAiInfluencerOptions } from "../hooks/useAiInfluencerOptions";

const isTier = (value: unknown): value is AiInfluencerTier =>
  (AiInfluencerInputConst.tier as readonly unknown[]).includes(value);

function Swatch({ color }: { color: string }) {
  return (
    <span
      className="inline-block size-3.5 shrink-0 rounded-full border border-white/20"
      style={{ background: color }}
    />
  );
}

/** AI Influencer inputs with the catalog's labels, thumbnails and colours. */
export function InfluencerParams({ input }: { input: Record<string, unknown> }) {
  const { data: catalog } = useAiInfluencerOptions();
  const tier: AiInfluencerTier = isTier(input.tier) ? input.tier : "normal";
  const selection = (input.selection ?? {}) as Record<string, string[]>;
  const brief = typeof input.brief === "string" ? input.brief.trim() : "";
  const bodyColor = typeof input.bodyColor === "string" ? input.bodyColor : "";
  const references = [
    input.imageUrl,
    ...((input.itemImageUrls as unknown[]) ?? []),
  ].filter((u): u is string => typeof u === "string" && !!u);

  // Picked traits, in catalog order with their labels.
  const categories = categoriesForTier(catalog, tier);
  const traits = categories
    .filter((c) => selection[c.key]?.length)
    .map((c) => ({
      key: c.key,
      label: c.label,
      options: selection[c.key].map(
        (key) =>
          c.options.find((o) => o.key === key) ?? {
            key,
            label: key.replace(/_/g, " "),
            img: null,
            color: null,
          },
      ),
    }));
  // Before the catalog loads, still list the raw picks.
  const rawTraits = !catalog
    ? Object.entries(selection).filter(([, keys]) => keys?.length)
    : [];

  const settings: [string, React.ReactNode][] = [["Character", TIER_LABELS[tier]]];
  if (bodyColor) {
    settings.push([
      "Body colour",
      <span key="c" className="inline-flex items-center gap-1.5">
        <Swatch color={bodyColor} /> {bodyColor}
      </span>,
    ]);
  }
  if (input.resolution) settings.push(["Resolution", String(input.resolution)]);
  if (typeof input.variationIndex === "number" && input.variationIndex > 0) {
    settings.push(["Variation", `#${input.variationIndex}`]);
  }
  if (typeof input.seed === "number") settings.push(["Seed", String(input.seed)]);

  return (
    <>
      <ParamsSection title="Settings">
        <ParamRows rows={settings} />
      </ParamsSection>

      {(traits.length > 0 || rawTraits.length > 0) && (
        <ParamsSection title="Appearance">
          <div className="flex flex-col gap-3">
            {traits.map((trait) => (
              <div key={trait.key}>
                <p className="mb-1.5 text-xs text-white/45">{trait.label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {trait.options.map((o) => (
                    <span
                      key={o.key}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] py-0.5 pr-2.5 pl-1 text-xs text-white/85"
                    >
                      {o.img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={o.img} alt="" className="size-5 rounded-full object-cover" />
                      ) : o.color ? (
                        <Swatch color={o.color} />
                      ) : (
                        <span className="w-1" />
                      )}
                      {o.label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {rawTraits.length > 0 && (
              <ParamRows
                rows={rawTraits.map(([k, keys]) => [k.replace(/_/g, " "), keys.join(", ")])}
              />
            )}
          </div>
        </ParamsSection>
      )}

      {brief && (
        <ParamsSection title="Direction">
          <p className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-sm leading-relaxed whitespace-pre-wrap text-white/85">
            {brief}
          </p>
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
