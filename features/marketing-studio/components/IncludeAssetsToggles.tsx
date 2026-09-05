"use client";

import GenerateAudioSelector from "@/features/generation/components/selectors/GenerateAudioSelector";
import { BrandTheme } from "@/features/brand-themes/types";

interface IncludeAssetsTogglesProps {
  theme: BrandTheme | undefined;
  includeLogo: boolean;
  includePrimaryColor: boolean;
  includeFonts: boolean;
  onChangeLogo: (value: boolean) => void;
  onChangePrimaryColor: (value: boolean) => void;
  onChangeFonts: (value: boolean) => void;
}

/**
 * Reuses the composer's pill switch (not a checkbox) for visual consistency
 * with the Generate Audio toggle sitting next to these on the video path.
 */
export function IncludeAssetsToggles({
  theme,
  includeLogo,
  includePrimaryColor,
  includeFonts,
  onChangeLogo,
  onChangePrimaryColor,
  onChangeFonts,
}: IncludeAssetsTogglesProps) {
  const hasLogo = !!theme?.logoUrl;
  const hasPrimaryColor = !!theme?.primaryColor;
  const hasFonts = !!theme?.fonts?.length;

  return (
    <div className="flex flex-col gap-2">
      <GenerateAudioSelector
        label="Include logo"
        value={hasLogo && includeLogo}
        onChange={onChangeLogo}
        disabled={!hasLogo}
      />
      <GenerateAudioSelector
        label="Include primary color"
        value={hasPrimaryColor && includePrimaryColor}
        onChange={onChangePrimaryColor}
        disabled={!hasPrimaryColor}
      />
      <GenerateAudioSelector
        label="Include fonts"
        value={hasFonts && includeFonts}
        onChange={onChangeFonts}
        disabled={!hasFonts}
      />
    </div>
  );
}
