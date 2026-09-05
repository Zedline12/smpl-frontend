"use client";

import { FormEvent, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectColorPicker } from "@/components/ui/hex-color-picker";
import { CreateManualBrandThemeRequest } from "../types";
import { FontChipsInput } from "./FontChipsInput";
import { LogoUploadField } from "./LogoUploadField";

interface CreateManualBrandThemeFormProps {
  onSubmit: (values: CreateManualBrandThemeRequest) => void;
  isSubmitting: boolean;
}

export function CreateManualBrandThemeForm({
  onSubmit,
  isSubmitting,
}: CreateManualBrandThemeFormProps) {
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState<string | undefined>();
  const [fonts, setFonts] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Give this brand theme a name");
      return;
    }

    setError(null);
    onSubmit({
      name: trimmedName,
      ...(logoUrl ? { logoUrl } : {}),
      ...(primaryColor ? { primaryColor } : {}),
      ...(fonts.length ? { fonts } : {}),
    });

    setName("");
    setLogoUrl(null);
    setPrimaryColor(undefined);
    setFonts([]);
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
        Set the name, logo, colour and fonts yourself.
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
            className={cn(
              "border-border bg-background-light text-foreground placeholder:text-muted-foreground h-10 w-full rounded-xl! border! px-3! text-sm! outline-none!",
              "focus:border-primary/50",
              error && "border-red-500/60!",
            )}
          />
          {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
        </div>

        <div>
          <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
            Logo (optional)
          </label>
          <LogoUploadField value={logoUrl} onChange={setLogoUrl} />
        </div>

        <div>
          <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
            Primary colour (optional)
          </label>
          <ProjectColorPicker
            value={primaryColor}
            onChange={setPrimaryColor}
            label=""
          />
        </div>

        <div>
          <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
            Fonts (optional)
          </label>
          <FontChipsInput value={fonts} onChange={setFonts} />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !name.trim()}
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
