"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeDollarSign,
  Link2,
  Loader2,
  MessagesSquare,
  Palette,
  Share2,
  Sparkles,
  Trash2,
  Type,
  Users,
  ImageIcon,
  X,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TagInput } from "@/features/artist/components/TagInput";
import { MediaManagerDialog } from "@/features/generation/components/prompt/MediaManagerDialog";
import { cn } from "@/lib/utils";
import {
  useCreateBrand,
  useDeleteBrand,
  useUpdateBrand,
} from "../hooks/use-brands";
import {
  BRAND_LIMITS,
  Brand,
  BrandInput,
  brandToInput,
  emptyBrandInput,
} from "../types";
import { BrandShell, KitCard, ghostInput } from "./BrandShell";
import { PaletteEditor } from "./kit/PaletteEditor";
import { PointsEditor } from "./kit/PointsEditor";
import { SocialsEditor } from "./kit/SocialsEditor";

const LIST_HREF = "/ads-studio/brands";

/** "brand.com" → "https://brand.com"; empty → null. */
export function toUrl(raw: string | null | undefined): string | null {
  const v = raw?.trim();
  if (!v) return null;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

const cleanList = (items: string[]) =>
  items.map((i) => i.trim()).filter(Boolean);

/** The kit as the API takes it: trimmed, empty rows dropped, links made absolute. */
export function cleanBrandInput(input: BrandInput): BrandInput {
  const colors = input.colors.filter((c) => /^#[0-9a-fA-F]{6}$/.test(c));
  return {
    ...input,
    name: input.name.trim(),
    websiteUrl: toUrl(input.websiteUrl),
    tagline: input.tagline.trim(),
    description: input.description.trim(),
    audience: input.audience.trim(),
    headerFont: input.headerFont?.trim() || null,
    bodyFont: input.bodyFont?.trim() || null,
    sellingPoints: cleanList(input.sellingPoints),
    aesthetics: cleanList(input.aesthetics),
    toneOfVoice: cleanList(input.toneOfVoice),
    colors,
    primaryColor: colors[0] ?? null,
    socials: input.socials
      .map((s) => ({ ...s, url: toUrl(s.url) ?? "" }))
      .filter((s) => s.url),
  };
}

const fieldClass =
  "h-10 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/30";

/**
 * "Review your brand kit": every part of the kit, editable in place. With no `brand`
 * it's a blank kit (Create brand kit manually) that's created on Continue.
 */
export function BrandKitEditor({ brand }: { brand?: Brand }) {
  const router = useRouter();
  const [input, setInput] = useState<BrandInput>(() =>
    brand ? brandToInput(brand) : emptyBrandInput(),
  );
  const [logoOpen, setLogoOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const create = useCreateBrand();
  const update = useUpdateBrand();
  const remove = useDeleteBrand();
  const saving = create.isPending || update.isPending;
  const set = <K extends keyof BrandInput>(key: K, value: BrandInput[K]) =>
    setInput((s) => ({ ...s, [key]: value }));

  const save = () => {
    const body = cleanBrandInput(input);
    if (!body.name) return;
    const done = { onSuccess: () => router.push(LIST_HREF) };
    if (brand) update.mutate({ id: brand.id, body }, done);
    else create.mutate(body, done);
  };

  const named = input.name.trim().length > 0;

  return (
    <BrandShell
      title={brand ? "Review your brand kit" : "Create your brand kit"}
      subtitle={
        brand
          ? "Everything here shapes your ads, so edit anything that's off."
          : "Everything here shapes your ads"
      }
    >
      {/* Identity */}
      <KitCard className="gap-5">
        <div className="flex items-start gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <input
              value={input.name}
              onChange={(e) => set("name", e.target.value)}
              maxLength={BRAND_LIMITS.name}
              placeholder="YOUR BRAND NAME"
              aria-label="Brand name"
              className={cn(
                ghostInput,
                "text-xl font-black tracking-tight uppercase sm:text-3xl",
                named ? "text-primary" : "",
              )}
              style={{ fontFamily: "var(--font-display)" }}
            />
            <label className="flex items-center gap-1.5 text-sm text-white/55">
              <Link2 className="size-3.5 shrink-0" />
              <input
                value={input.websiteUrl ?? ""}
                onChange={(e) => set("websiteUrl", e.target.value)}
                placeholder="www.yourbrand.com"
                aria-label="Website"
                inputMode="url"
                className={cn(ghostInput, "text-sm text-white/70")}
              />
            </label>
          </div>

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setLogoOpen(true)}
              aria-label={input.logoUrl ? "Change logo" : "Add logo"}
              className="flex h-16 w-20 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] text-white/50 transition-colors hover:border-white/25 hover:text-white sm:h-24 sm:w-40"
            >
              {input.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={input.logoUrl}
                  alt="Logo"
                  className="max-h-full max-w-full object-contain p-3"
                />
              ) : (
                <ImageIcon className="size-7" strokeWidth={1.5} />
              )}
            </button>
            {input.logoUrl && (
              <button
                type="button"
                aria-label="Remove logo"
                onClick={() => set("logoUrl", null)}
                className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full border border-white/15 bg-[#1b1b20] text-white/70 hover:text-white"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <input
            value={input.tagline}
            onChange={(e) => set("tagline", e.target.value)}
            maxLength={BRAND_LIMITS.tagline}
            placeholder="Your tagline"
            aria-label="Tagline"
            className={cn(ghostInput, "text-xl font-bold")}
          />
          <textarea
            value={input.description}
            onChange={(e) => set("description", e.target.value)}
            maxLength={BRAND_LIMITS.description}
            rows={2}
            placeholder="What the brand does and for whom"
            aria-label="Description"
            className={cn(
              ghostInput,
              "resize-none text-sm leading-relaxed text-white/65",
            )}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-white/50">
            <Palette className="size-3.5" /> Colours
          </span>
          <PaletteEditor
            colors={input.colors}
            onChange={(colors) => set("colors", colors)}
          />
        </div>
      </KitCard>

      <KitCard icon={<BadgeDollarSign />} label="Selling points">
        <PointsEditor
          points={input.sellingPoints}
          onChange={(points) => set("sellingPoints", points)}
          placeholder="Main reason to buy, e.g. Free shipping over $50"
        />
      </KitCard>

      <div className="grid w-full gap-4 sm:grid-cols-2">
        <KitCard icon={<Sparkles />} label="Aesthetics">
          <TagInput
            value={input.aesthetics}
            onChange={(v) => set("aesthetics", v)}
            max={BRAND_LIMITS.aesthetics}
            placeholder="Look and feel, e.g. Minimal, muted colours, natural light"
          />
        </KitCard>
        <KitCard icon={<Users />} label="Audience">
          <textarea
            value={input.audience}
            onChange={(e) => set("audience", e.target.value)}
            maxLength={BRAND_LIMITS.audience}
            rows={3}
            placeholder="Who the ads are for"
            aria-label="Audience"
            className={cn(ghostInput, "resize-none text-sm leading-relaxed")}
          />
        </KitCard>
      </div>

      <div className="grid w-full gap-4 sm:grid-cols-2">
        <KitCard icon={<MessagesSquare />} label="Tone of voice">
          <TagInput
            value={input.toneOfVoice}
            onChange={(v) => set("toneOfVoice", v)}
            max={BRAND_LIMITS.toneOfVoice}
            placeholder="e.g. Passionate, professional"
          />
        </KitCard>
        <KitCard icon={<Type />} label="Fonts">
          <div className="grid grid-cols-2 gap-2">
            <input
              value={input.headerFont ?? ""}
              onChange={(e) => set("headerFont", e.target.value)}
              maxLength={BRAND_LIMITS.font}
              placeholder="Headings"
              aria-label="Heading font"
              className={fieldClass}
            />
            <input
              value={input.bodyFont ?? ""}
              onChange={(e) => set("bodyFont", e.target.value)}
              maxLength={BRAND_LIMITS.font}
              placeholder="Body text"
              aria-label="Body font"
              className={fieldClass}
            />
          </div>
        </KitCard>
      </div>

      <KitCard icon={<Share2 />} label="Socials">
        <SocialsEditor
          socials={input.socials}
          onChange={(s) => set("socials", s)}
        />
      </KitCard>

      {/* Footer: sticks to the bottom of the panel. */}
      <div className="sticky bottom-3 z-10 flex w-full items-center gap-2 rounded-2xl border border-white/10 bg-[#121216]/90 p-2 shadow-2xl backdrop-blur-xl">
        <Link
          href={LIST_HREF}
          className="flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="size-4" /> Back
        </Link>
        {brand && (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            aria-label="Delete brand"
            className="flex size-10 items-center justify-center rounded-xl text-white/50 hover:bg-red-500/15 hover:text-red-300"
          >
            <Trash2 className="size-4" />
          </button>
        )}
        <span className="ml-auto hidden text-xs text-white/40 sm:block">
          {named ? "" : "Give the brand a name to continue"}
        </span>
        <button
          type="button"
          onClick={save}
          disabled={!named || saving}
          className="bg-primary hover:bg-primary/90 flex h-10 items-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          Continue
        </button>
      </div>

      <MediaManagerDialog
        open={logoOpen}
        onOpenChange={setLogoOpen}
        selectedImage={input.logoUrl ?? ""}
        onSelect={(urls) => set("logoUrl", urls[0] ?? null)}
        maxSelections={1}
      />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {brand?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Ads you already made with it stay in All media.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                brand &&
                remove.mutate(brand.id, {
                  onSuccess: () => router.push(LIST_HREF),
                })
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </BrandShell>
  );
}
