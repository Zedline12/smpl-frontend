import { BrandTheme } from "./types";

/** WCAG relative luminance of a #rrggbb colour (0 = black, 1 = white). */
function luminance(hex: string): number {
  const channels = [1, 3, 5].map((start) => {
    const value = parseInt(hex.slice(start, start + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export interface ThemeCardStyle {
  /** null when the theme has no primary colour — the caller keeps its default surface. */
  background: string | null;
  /** True when the surface is light enough that dark text is the readable choice. */
  isLight: boolean;
}

/** Gradient when there's a primary + secondary colour, solid when primary only. */
export function getThemeCardStyle(
  theme: Pick<BrandTheme, "primaryColor" | "secondaryColor">,
): ThemeCardStyle {
  const { primaryColor, secondaryColor } = theme;
  if (!primaryColor) return { background: null, isLight: false };

  if (secondaryColor) {
    const average = (luminance(primaryColor) + luminance(secondaryColor)) / 2;
    return {
      background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
      isLight: average > 0.4,
    };
  }

  return { background: primaryColor, isLight: luminance(primaryColor) > 0.4 };
}
