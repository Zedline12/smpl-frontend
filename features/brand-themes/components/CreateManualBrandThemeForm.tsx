"use client";

import { FormEvent, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateManualBrandThemeRequest } from "../types";
import { HexColorField } from "./HexColorField";
import { LogoUploadField } from "./LogoUploadField";

interface CreateManualBrandThemeFormProps {
  onSubmit: (values: CreateManualBrandThemeRequest) => void;
  isSubmitting: boolean;
}

const TEXT_INPUT_CLASS =
  "border-border bg-background-light text-foreground placeholder:text-muted-foreground focus:border-primary/50 h-10 w-full rounded-xl! border! px-3! text-sm! outline-none!";

export function CreateManualBrandThemeForm({
  onSubmit,
  isSubmitting,
}: CreateManualBrandThemeFormProps) {
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState<string | undefined>();
  const [secondaryColor, setSecondaryColor] = useState<string | undefined>();
  const [headerFont, setHeaderFont] = useState("");
  const [bodyFont, setBodyFont] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Give this brand theme a name");
      return;
    }
    if (!logoUrl || !primaryColor) return;

    const header = headerFont.trim();
    const body = bodyFont.trim();

    setError(null);
    onSubmit({
      name: trimmedName,
      logoUrl,
      primaryColor,
      // The backend still requires the array alongside header/body.
      fonts: Array.from(new Set([header, body].filter(Boolean))),
      ...(secondaryColor ? { secondaryColor } : {}),
      ...(header ? { headerFont: header } : {}),
      ...(body ? { bodyFont: body } : {}),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-border bg-card rounded-2xl border p-4 sm:p-5"
    >
      <h2 className="text-foreground text-sm font-semibold">
        Create a brand theme manually
      </h2>
      <p className="text-muted-foreground mt-1 text-xs">
        Set the name, logo, colours and fonts yourself.
      </p>

      <div className="mt-4 flex flex-col gap-4">
        <div>
          <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (error) setError(null);
            }}
            maxLength={100}
            placeholder="Acme Inc."
            aria-invalid={!!error}
            className={cn(TEXT_INPUT_CLASS, error && "border-red-500/60!")}
          />
          {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
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
            Secondary colour (optional)
          </label>
          <HexColorField value={secondaryColor} onChange={setSecondaryColor} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
              Header font (optional)
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
              Body font (optional)
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

        <button
          type="submit"
          disabled={isSubmitting || !name.trim() || !logoUrl || !primaryColor}
          className="bg-gradient-primary flex h-10 w-fit cursor-pointer items-center justify-center gap-2 self-end rounded-xl px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              Create theme
            </>
          )}
        </button>
      </div>
    </form>
  );
}
