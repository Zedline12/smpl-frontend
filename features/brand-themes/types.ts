/** Same union the generation queues use — note it is "failure", not "failed". */
export type BrandThemeStatus = "pending" | "processing" | "success" | "failure";

export const ACTIVE_STATUSES: BrandThemeStatus[] = ["pending", "processing"];

export function isActiveStatus(status: BrandThemeStatus): boolean {
  return ACTIVE_STATUSES.includes(status);
}

export interface BrandTheme {
  id: string;
  websiteUrl: string;
  name: string;
  status: BrandThemeStatus;
  primaryColor: string | null;
  fonts: string[];
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
