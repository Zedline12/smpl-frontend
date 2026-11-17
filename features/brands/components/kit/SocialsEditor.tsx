"use client";
import { Plus, X } from "lucide-react";
import {
  BRAND_LIMITS,
  BrandSocial,
  SOCIAL_LABELS,
  SOCIAL_PLATFORMS,
  SocialPlatform,
} from "../../types";

/** Social profiles: a platform and a link per row. */
export function SocialsEditor({
  socials,
  onChange,
}: {
  socials: BrandSocial[];
  onChange: (socials: BrandSocial[]) => void;
}) {
  const set = (i: number, patch: Partial<BrandSocial>) =>
    onChange(socials.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  // Suggest the first platform not used yet.
  const nextPlatform =
    SOCIAL_PLATFORMS.find((p) => !socials.some((s) => s.platform === p)) ??
    "website";

  return (
    <div className="flex flex-col gap-2">
      {socials.map((social, i) => (
        <div key={i} className="flex items-center gap-2">
          <select
            value={social.platform}
            onChange={(e) =>
              set(i, { platform: e.target.value as SocialPlatform })
            }
            aria-label={`Platform ${i + 1}`}
            className="h-9 shrink-0 rounded-lg border border-white/10 bg-black/30 px-2 text-sm text-white outline-none focus:border-white/30"
          >
            {SOCIAL_PLATFORMS.map((p) => (
              <option key={p} value={p} className="bg-[#16161b]">
                {SOCIAL_LABELS[p]}
              </option>
            ))}
          </select>
          <input
            value={social.url}
            onChange={(e) => set(i, { url: e.target.value })}
            placeholder="https://"
            aria-label={`${SOCIAL_LABELS[social.platform]} link`}
            inputMode="url"
            className="h-9 min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/30"
          />
          <button
            type="button"
            aria-label={`Remove ${SOCIAL_LABELS[social.platform]}`}
            onClick={() => onChange(socials.filter((_, j) => j !== i))}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-white/45 hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
      {socials.length < BRAND_LIMITS.socials && (
        <button
          type="button"
          onClick={() =>
            onChange([...socials, { platform: nextPlatform, url: "" }])
          }
          className="flex w-fit items-center gap-1.5 text-xs font-medium text-white/50 hover:text-white"
        >
          <Plus className="size-3.5" /> Add social
        </button>
      )}
    </div>
  );
}
