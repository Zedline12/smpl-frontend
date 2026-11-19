import type { Brand } from "@/features/brands/types";
import { brandPalette } from "@/features/brands/color";
import {
  AdsStudioBrand,
  AdsStudioInputConst,
} from "@/features/generation/types/models/ads-studio.type";

const L = AdsStudioInputConst.brand;
const HEX = /^#[0-9a-fA-F]{6}$/;

const clip = (text: string | null | undefined, max: number) =>
  text?.trim() ? text.trim().slice(0, max) : undefined;
const clipList = (items: string[] | undefined) => {
  const list = (items ?? [])
    .map((i) => i.trim().slice(0, L.item))
    .filter(Boolean)
    .slice(0, L.list);
  return list.length ? list : undefined;
};

/** The brand kit as the ads model takes it; empty fields are left out. */
export function brandToAdInput(brand: Brand): AdsStudioBrand {
  const colors = brandPalette(brand)
    .filter((c) => HEX.test(c))
    .slice(0, L.colors);
  const input: AdsStudioBrand = {
    name: clip(brand.name, L.text),
    tagline: clip(brand.tagline, L.tagline),
    description: clip(brand.description, L.description),
    primaryColor: colors[0],
    colors: colors.length ? colors : undefined,
    headerFont: clip(brand.headerFont, L.text),
    bodyFont: clip(brand.bodyFont, L.text),
    sellingPoints: clipList(brand.sellingPoints),
    audience: clip(brand.audience, L.audience),
    aesthetics: clipList(brand.aesthetics),
    toneOfVoice: clipList(brand.toneOfVoice),
  };
  return Object.fromEntries(
    Object.entries(input).filter(([, v]) => v !== undefined),
  );
}

/** Unique, non-empty URLs in order. */
export const uniqueUrls = (urls: (string | null | undefined)[]) =>
  Array.from(new Set(urls.filter((u): u is string => !!u)));
