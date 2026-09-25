"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateBrandThemeMutation } from "../hooks/use-brand-themes";
import { BrandTheme, UpdateBrandThemeRequest } from "../types";
import { HexColorField } from "./HexColorField";
import { LogoUploadField } from "./LogoUploadField";

const TEXT_INPUT_CLASS =
  "border-border bg-background-light text-foreground placeholder:text-muted-foreground focus:border-primary/50 h-10 w-full rounded-xl! border! px-3! text-sm! outline-none!";

interface EditBrandThemeDialogProps {
  theme: BrandTheme;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditBrandThemeDialog({
  theme,
  open,
  onOpenChange,
}: EditBrandThemeDialogProps) {
  const updateTheme = useUpdateBrandThemeMutation();

  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState<string | undefined>();
  const [secondaryColor, setSecondaryColor] = useState<string | undefined>();
  const [headerFont, setHeaderFont] = useState("");
  const [bodyFont, setBodyFont] = useState("");

  // Re-seed from the theme every time the dialog opens, so a cancelled edit
  // never leaks into the next one.
  useEffect(() => {
    if (!open) return;
    setName(theme.name ?? "");
    setLogoUrl(theme.logoUrl);
    setPrimaryColor(theme.primaryColor ?? undefined);
    setSecondaryColor(theme.secondaryColor ?? undefined);
    setHeaderFont(theme.headerFont ?? "");
    setBodyFont(theme.bodyFont ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (updateTheme.isPending) return;

    const header = headerFont.trim();
    const body = bodyFont.trim();
    const trimmedName = name.trim();

    // PATCH semantics: send only what changed. The DTO rejects empty strings,
    // so a cleared field is omitted rather than sent.
    const patch: UpdateBrandThemeRequest = {};
    if (trimmedName && trimmedName !== theme.name) patch.name = trimmedName;
    if (logoUrl && logoUrl !== theme.logoUrl) patch.logoUrl = logoUrl;
    if (primaryColor && primaryColor !== theme.primaryColor) {
      patch.primaryColor = primaryColor;
    }
    if (secondaryColor && secondaryColor !== theme.secondaryColor) {
      patch.secondaryColor = secondaryColor;
    }
    if (header && header !== theme.headerFont) patch.headerFont = header;
    if (body && body !== theme.bodyFont) patch.bodyFont = body;
    if (patch.headerFont || patch.bodyFont) {
      patch.fonts = Array.from(
        new Set(
          [header || theme.headerFont, body || theme.bodyFont].filter(
            (font): font is string => !!font,
          ),
        ),
      );
    }

    if (Object.keys(patch).length === 0) {
      onOpenChange(false);
      return;
    }

    updateTheme.mutate(
      { id: theme.id, body: patch },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card max-h-[90vh] max-w-lg overflow-y-auto rounded-2xl border p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit brand theme</DialogTitle>
          <DialogDescription>
            Update this theme&apos;s name, logo, colours and fonts.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
              className={TEXT_INPUT_CLASS}
            />
          </div>

          <div>
            <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
              Logo
            </label>
            <LogoUploadField value={logoUrl} onChange={setLogoUrl} />
          </div>

          <div>
            <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
              Primary colour
            </label>
            <HexColorField value={primaryColor} onChange={setPrimaryColor} />
          </div>
          <div>
            <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
              Secondary colour
            </label>
            <HexColorField
              value={secondaryColor}
              onChange={setSecondaryColor}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
                Header font
              </label>
              <input
                type="text"
                value={headerFont}
                onChange={(event) => setHeaderFont(event.target.value)}
                maxLength={60}
                placeholder="Playfair Display"
                className={TEXT_INPUT_CLASS}
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
                Body font
              </label>
              <input
                type="text"
                value={bodyFont}
                onChange={(event) => setBodyFont(event.target.value)}
                maxLength={60}
                placeholder="Inter"
                className={TEXT_INPUT_CLASS}
              />
            </div>
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground h-10 cursor-pointer rounded-xl px-4 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateTheme.isPending}
              className="bg-gradient-primary flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updateTheme.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
