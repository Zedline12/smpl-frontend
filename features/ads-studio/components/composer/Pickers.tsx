"use client";
import Link from "next/link";
import {
  Check,
  CircleUserRound,
  Package,
  Palette,
  SlidersHorizontal,
  WandSparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBrandsQuery } from "@/features/brands/hooks/use-brands";
import { brandSwatch } from "@/features/brands/color";
import type { Brand } from "@/features/brands/types";
import {
  AdsStudioAspectRatio,
  AdsStudioInputConst,
  IAdsStudioInput,
} from "@/features/generation/types/models/higgsfield-ads-studio.type";
import { useStylesQuery } from "@/features/styles/api";
import { findStyle } from "@/features/styles/styles";
import { cn } from "@/lib/utils";
import { useAvatarsQuery, useProductsQuery } from "../../hooks/use-ads-library";
import { useAdsSelectionStore } from "../../stores/useAdsSelectionStore";
import {
  ComposerChip,
  PICKER_CONTENT_CLASS,
  PickerHeader,
} from "./ComposerChip";

const c = AdsStudioInputConst;

const itemClass =
  "flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-sm text-white/85 outline-none data-[highlighted]:bg-white/[0.07] data-[highlighted]:text-white";

const manageLink = (href: string, label: string) => (
  <Link
    href={href}
    className="text-primary text-xs font-medium hover:underline"
  >
    {label}
  </Link>
);

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="px-2 pb-2 text-sm text-white/45">{children}</p>;
}

/** The user's brand themes that finished extracting. */
export function useReadyBrands(): Brand[] {
  const { data = [] } = useBrandsQuery();
  return data.filter((t) => t.status === "success");
}

// ─── Brand ──────────────────────────────────────────────────────────────────

export function BrandPicker({ fallbackName }: { fallbackName?: string }) {
  const brands = useReadyBrands();
  const { brandId, setBrandId } = useAdsSelectionStore();
  const picked = brands.find((b) => b.id === brandId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ComposerChip
          icon={Palette}
          label="Brand"
          value={picked?.name ?? fallbackName}
          thumb={picked?.logoUrl}
          onClear={picked ? () => setBrandId(null) : undefined}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="start"
        sideOffset={8}
        collisionPadding={8}
        className={PICKER_CONTENT_CLASS}
      >
        <PickerHeader
          title="Brand"
          action={manageLink("/ads-studio/brands", "Manage brands")}
        />
        {brands.length === 0 ? (
          <Empty>
            No brands yet.{" "}
            {manageLink("/ads-studio/brands/create", "Add your website")} to
            extract one.
          </Empty>
        ) : (
          <div className="max-h-72 overflow-y-auto">
            {brands.map((brand) => {
              const swatch = brandSwatch(brand);
              return (
                <DropdownMenuItem
                  key={brand.id}
                  onSelect={() =>
                    setBrandId(brand.id === brandId ? null : brand.id)
                  }
                  className={itemClass}
                >
                  <span
                    className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10"
                    style={{ background: swatch ?? "rgba(255,255,255,0.05)" }}
                  >
                    {brand.logoUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={brand.logoUrl}
                        alt=""
                        className="size-7 object-contain"
                      />
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{brand.name}</span>
                  {brand.id === brandId && (
                    <Check className="text-primary size-4" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Products ───────────────────────────────────────────────────────────────

export function ProductPicker() {
  const { data: products = [] } = useProductsQuery();
  const { productIds, toggleProduct, setProductIds } = useAdsSelectionStore();
  const picked = products.filter((p) => productIds.includes(p.id));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ComposerChip
          icon={Package}
          label="Product"
          value={
            picked.length === 1
              ? picked[0].name
              : picked.length > 1
                ? `${picked.length} products`
                : undefined
          }
          thumb={picked[0]?.images[0]}
          onClear={picked.length ? () => setProductIds([]) : undefined}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="start"
        sideOffset={8}
        collisionPadding={8}
        className={PICKER_CONTENT_CLASS}
      >
        <PickerHeader
          title="Products"
          action={manageLink("/ads-studio/products", "Add product")}
        />
        {products.length === 0 ? (
          <Empty>
            Add your products with their photos, then pick them here.
          </Empty>
        ) : (
          <div className="max-h-72 overflow-y-auto">
            {products.map((product) => {
              const on = productIds.includes(product.id);
              return (
                <DropdownMenuItem
                  key={product.id}
                  // Stays open so several products can be picked.
                  onSelect={(e) => {
                    e.preventDefault();
                    toggleProduct(product.id);
                  }}
                  className={itemClass}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.images[0]}
                    alt=""
                    className="size-9 shrink-0 rounded-lg object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{product.name}</span>
                    <span className="block text-xs text-white/45">
                      {product.images.length} photo
                      {product.images.length === 1 ? "" : "s"}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-md border",
                      on
                        ? "border-primary bg-primary text-white"
                        : "border-white/20",
                    )}
                  >
                    {on && <Check className="size-3.5" />}
                  </span>
                </DropdownMenuItem>
              );
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Avatar ─────────────────────────────────────────────────────────────────

export function AvatarPicker() {
  const { data: avatars = [] } = useAvatarsQuery();
  const { avatarId, setAvatarId } = useAdsSelectionStore();
  const picked = avatars.find((a) => a.id === avatarId);
  const groups = [
    { title: "Our avatars", items: avatars.filter((a) => a.isPreset) },
    { title: "My avatars", items: avatars.filter((a) => !a.isPreset) },
  ].filter((g) => g.items.length > 0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ComposerChip
          icon={CircleUserRound}
          label="Avatar"
          value={picked?.name}
          thumb={picked?.imageUrl}
          onClear={picked ? () => setAvatarId(null) : undefined}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="start"
        sideOffset={8}
        collisionPadding={8}
        className={PICKER_CONTENT_CLASS}
      >
        <PickerHeader
          title="Avatar"
          action={manageLink("/ads-studio/avatars", "Upload yours")}
        />
        {groups.length === 0 ? (
          <Empty>No avatars yet. Upload one on the Avatars page.</Empty>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {groups.map((group) => (
              <div key={group.title} className="mb-2">
                <p className="px-2 pb-1.5 text-[11px] font-medium text-white/40">
                  {group.title}
                </p>
                <div className="grid grid-cols-4 gap-1.5 px-1">
                  {group.items.map((avatar) => (
                    <DropdownMenuItem
                      key={avatar.id}
                      title={avatar.name}
                      onSelect={() =>
                        setAvatarId(avatar.id === avatarId ? null : avatar.id)
                      }
                      className={cn(
                        "relative aspect-square cursor-pointer overflow-hidden rounded-xl border-2 p-0 outline-none data-[highlighted]:border-white/40",
                        avatar.id === avatarId
                          ? "border-primary"
                          : "border-transparent",
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={avatar.imageUrl}
                        alt={avatar.name}
                        className="size-full object-cover"
                      />
                    </DropdownMenuItem>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Style ──────────────────────────────────────────────────────────────────

export function StylePicker({
  styleId,
  onChange,
}: {
  styleId: string | null;
  onChange: (id: string | null) => void;
}) {
  const { data: styles = [] } = useStylesQuery();
  const picked = findStyle(styles, styleId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ComposerChip
          icon={WandSparkles}
          label="Style"
          value={picked?.name}
          thumb={picked?.imageUrl || undefined}
          onClear={picked ? () => onChange(null) : undefined}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="start"
        sideOffset={8}
        collisionPadding={8}
        className={PICKER_CONTENT_CLASS}
      >
        <PickerHeader title="Style" />
        {styles.length === 0 ? (
          <Empty>No styles yet.</Empty>
        ) : (
          <div className="grid max-h-80 grid-cols-3 gap-1.5 overflow-y-auto px-1 pb-1">
            {styles.map((style) => (
              <DropdownMenuItem
                key={style.id}
                onSelect={() =>
                  onChange(style.id === picked?.id ? null : style.id)
                }
                className={cn(
                  "relative flex aspect-[4/5] cursor-pointer items-end overflow-hidden rounded-xl border-2 bg-white/[0.05] p-0 outline-none data-[highlighted]:border-white/40",
                  style.id === picked?.id
                    ? "border-primary"
                    : "border-transparent",
                )}
              >
                {style.videoUrl ? (
                  <video
                    src={style.videoUrl}
                    muted
                    loop
                    autoPlay
                    playsInline
                    className="absolute inset-0 size-full object-cover"
                  />
                ) : style.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={style.imageUrl}
                    alt=""
                    className="absolute inset-0 size-full object-cover"
                  />
                ) : null}
                <span className="relative w-full truncate bg-gradient-to-t from-black/80 to-transparent px-1.5 pt-4 pb-1 text-[11px] font-medium text-white">
                  {style.name}
                </span>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Settings (format, size, count, details) ────────────────────────────────

/** A small box with the ratio's shape, fitted inside 18×18. */
function RatioShape({ ratio }: { ratio: AdsStudioAspectRatio }) {
  const [w, h] = ratio.split(":").map(Number);
  const scale = 18 / Math.max(w, h);
  return (
    <span
      className="rounded-[3px] border-[1.5px] border-current"
      style={{ width: w * scale, height: h * scale }}
    />
  );
}

const segment = (active: boolean) =>
  cn(
    "flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors",
    active ? "bg-white text-black" : "text-white/60 hover:text-white",
  );

const fieldClass =
  "h-9 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/30";

export function SettingsPicker({
  state,
  set,
}: {
  state: IAdsStudioInput;
  set: (key: keyof IAdsStudioInput, value: unknown) => void;
}) {
  // Menus type-ahead on letter keys; keep typing inside the text fields.
  const keepKeys = (e: React.KeyboardEvent) => e.stopPropagation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ComposerChip
          icon={SlidersHorizontal}
          label="Settings"
          value={`${state.aspectRatio} · ${state.resolution} · ${state.batchSize} ${state.batchSize === 1 ? "ad" : "ads"}`}
          className="border-white/[0.08] bg-white/[0.05] text-white/80"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="end"
        sideOffset={8}
        collisionPadding={8}
        className={cn(
          PICKER_CONTENT_CLASS,
          "flex max-h-[70vh] w-[22rem] flex-col gap-4 overflow-y-auto p-3",
        )}
      >
        <section className="flex flex-col gap-2">
          <PickerHeader title="Format" />
          <div className="grid grid-cols-5 gap-1.5">
            {c.aspectRatio.map((ratio) => (
              <button
                key={ratio}
                type="button"
                onClick={() => set("aspectRatio", ratio)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg border px-1 py-1.5 text-[11px] transition-colors",
                  state.aspectRatio === ratio
                    ? "border-primary bg-primary/15 text-white"
                    : "border-white/10 text-white/55 hover:border-white/30 hover:text-white",
                )}
              >
                <span className="flex h-5 items-center justify-center">
                  <RatioShape ratio={ratio} />
                </span>
                {ratio}
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <PickerHeader title="Resolution" />
          <div className="flex rounded-lg border border-white/10 p-1">
            {c.resolution.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => set("resolution", r)}
                className={segment(state.resolution === r)}
              >
                {r}
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <PickerHeader title="Number of ads" />
          <div className="flex rounded-lg border border-white/10 p-1">
            {c.batchSize.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => set("batchSize", n)}
                className={segment(state.batchSize === n)}
              >
                {n}
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <PickerHeader title="Details (optional)" />
          <input
            value={state.niche}
            maxLength={c.maxNicheLength}
            onChange={(e) => set("niche", e.target.value)}
            onKeyDown={keepKeys}
            placeholder="Niche, e.g. Specialty coffee"
            aria-label="Niche"
            className={fieldClass}
          />
          <input
            value={state.targetAudience}
            maxLength={c.maxTargetAudienceLength}
            onChange={(e) => set("targetAudience", e.target.value)}
            onKeyDown={keepKeys}
            placeholder="Audience, e.g. Students, 18–30"
            aria-label="Target audience"
            className={fieldClass}
          />
          <input
            value={state.language}
            maxLength={c.maxLanguageLength}
            onChange={(e) => set("language", e.target.value)}
            onKeyDown={keepKeys}
            placeholder="Language of the ad text, e.g. English"
            aria-label="Language"
            className={fieldClass}
          />
        </section>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
