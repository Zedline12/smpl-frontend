"use client";

import { useEffect } from "react";
import { Menu, MenuItem } from "@/components/menu";
import { useBrandThemesQuery } from "@/features/brand-themes/hooks/use-brand-themes";
import { BrandTheme } from "@/features/brand-themes/types";

interface BrandThemeSelectorProps {
  brandThemeId: string | null;
  onChange: (theme: BrandTheme) => void;
}

function ThemeSwatch({ theme }: { theme: BrandTheme }) {
  return (
    <span
      className="border-border size-4 shrink-0 rounded-full border"
      style={{ background: theme.primaryColor ?? "transparent" }}
    />
  );
}

export function BrandThemeSelector({
  brandThemeId,
  onChange,
}: BrandThemeSelectorProps) {
  const { data: themes } = useBrandThemesQuery();
  // A pending/failed theme has no usable logo/colour/fonts to pull from.
  const usableThemes = (themes ?? []).filter((theme) => theme.status === "success");

  useEffect(() => {
    if (!brandThemeId && usableThemes.length > 0) {
      onChange(usableThemes[0]);
    }
    // Only re-run when the candidate list actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usableThemes.length, brandThemeId]);

  const current = usableThemes.find((theme) => theme.id === brandThemeId);

  return (
    <Menu
      direction="up"
      trigger={
        <div className="border-border bg-background-light hover:bg-background-lightest flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors">
          {current ? <ThemeSwatch theme={current} /> : null}
          {current?.name ?? "Select a brand theme"}
        </div>
      }
    >
      <MenuItem className="hover:bg-transparent">
        <div className="flex h-full max-h-100 w-full flex-col gap-1 overflow-y-auto">
          {usableThemes.length === 0 && (
            <p className="text-muted-foreground p-3 text-xs">
              Create a brand theme first.
            </p>
          )}
          {usableThemes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => onChange(theme)}
              className="hover:bg-background-lighter flex w-full cursor-pointer items-center gap-2.5 p-3 text-left"
            >
              {theme.logoUrl ? (
                <img
                  src={theme.logoUrl}
                  alt=""
                  className="border-border size-8 shrink-0 rounded-lg border object-contain p-0.5"
                />
              ) : (
                <ThemeSwatch theme={theme} />
              )}
              <span className="flex min-w-0 flex-col">
                <span className="text-foreground truncate text-sm">
                  {theme.name}
                </span>
                {theme.fonts.length > 0 && (
                  <span className="text-muted-foreground truncate text-[11px]">
                    {theme.fonts.join(", ")}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      </MenuItem>
    </Menu>
  );
}
