/** Same union the generation queues use — note it is "failure", not "failed". */
export type BrandThemeStatus = "pending" | "processing" | "success" | "failure";

export const ACTIVE_STATUSES: BrandThemeStatus[] = ["pending", "processing"];

export function isActiveStatus(status: BrandThemeStatus): boolean {
  return ACTIVE_STATUSES.includes(status);
}

export interface BrandTheme {
  id: string;
  userId?: string;
  /** Absent on a manually created theme. */
  websiteUrl?: string | null;
  name: string;
  status: BrandThemeStatus;
  primaryColor: string | null;
  secondaryColor: string | null;
  headerFont: string | null;
  bodyFont: string | null;
  logoUrl: string | null;
  errorMessage: string | null;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * An in-flight extraction job. Typed loosely on purpose — the UI only relies on
 * `id` and `status`; everything else is used opportunistically if present.
 */
export interface BrandThemeQueue {
  id: string;
  status: BrandThemeStatus;
  brandThemeId?: string;
  websiteUrl?: string;
  errorMessage?: string | null;
  createdAt?: string;
}

export interface CreateBrandThemeRequest {
  websiteUrl: string;
  name?: string;
}

/** De-duplicated header + body fonts — replaces the old `theme.fonts` array. */
export function getThemeFonts(
  theme: Pick<BrandTheme, "headerFont" | "bodyFont"> | undefined | null,
): string[] {
  const fonts = [theme?.headerFont, theme?.bodyFont].filter(
    (font): font is string => !!font,
  );
  return Array.from(new Set(fonts));
}

export interface CreateManualBrandThemeRequest {
  name?: string;
  primaryColor: string;
  logoUrl: string;
  fonts: string[];
  secondaryColor?: string;
  headerFont?: string;
  bodyFont?: string;
}

export interface UpdateBrandThemeRequest {
  name?: string;
  fonts?: string[];
  primaryColor?: string;
  logoUrl?: string;
  secondaryColor?: string;
  headerFont?: string;
  bodyFont?: string;
}

export interface LogoSignedUrl {
  url: string;
}
