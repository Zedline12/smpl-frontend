import type { Brand } from "./types";

/** WCAG relative luminance of a #rrggbb colour (0 = black, 1 = white). */
function luminance(hex: string): number {
  const channels = [1, 3, 5].map((start) => {
    const value = parseInt(hex.slice(start, start + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

/** True when dark text reads better than light text on this colour. */
export const isLight = (hex: string) =>
  /^#[0-9a-fA-F]{6}$/.test(hex) && luminance(hex) > 0.4;

/** The brand's palette (main colour first), whatever older data looks like. */
export function brandPalette(
  brand: Pick<Brand, "primaryColor" | "colors">,
): string[] {
  const colors = brand.colors?.length ? brand.colors : [];
  if (brand.primaryColor && !colors.includes(brand.primaryColor))
    return [brand.primaryColor, ...colors];
  return colors;
}

/** A soft swatch background: the first two palette colours as a gradient. */
export function brandSwatch(
  brand: Pick<Brand, "primaryColor" | "colors">,
): string | null {
  const [a, b] = brandPalette(brand);
  if (!a) return null;
  return b ? `linear-gradient(135deg, ${a}, ${b})` : a;
}
