"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Globe,
  Loader2,
  PencilLine,
  RotateCcw,
} from "lucide-react";
import {
  useBrandQuery,
  useCreateBrandFromWebsite,
  useDeleteBrand,
} from "../hooks/use-brands";
import { isActiveStatus } from "../types";
import { BrandKitEditor } from "./BrandKitEditor";
import { BrandShell, KitCard } from "./BrandShell";

const host = (url: string | null) => {
  try {
    return url ? new URL(url).hostname.replace(/^www\./, "") : "your website";
  } catch {
    return url ?? "your website";
  }
};

/** One brand: progress while its website is read, then the editable kit. */
export function BrandPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: brand, isError, error } = useBrandQuery(id);
  const retry = useCreateBrandFromWebsite();
  const remove = useDeleteBrand();
  // After a failure the user can still fill the kit in by hand.
  const [manual, setManual] = useState(false);

  if (isError) {
    return (
      <BrandShell
        title="Brand not found"
        subtitle={error?.message ?? "It may have been deleted."}
      >
        <Link
          href="/ads-studio/brands"
          className="text-primary text-sm font-semibold hover:underline"
        >
          Back to brands
        </Link>
      </BrandShell>
    );
  }

  if (!brand) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-white/40" />
      </div>
    );
  }

  if (isActiveStatus(brand.status)) {
    return (
      <BrandShell
        title="Reading your website"
        subtitle="This usually takes about a minute. You can leave this page."
      >
        <KitCard className="items-center gap-4 py-10 text-center">
          <span className="bg-primary/15 text-primary relative flex size-14 items-center justify-center rounded-2xl">
            <Globe className="size-6" />
            <Loader2 className="text-primary absolute -right-1.5 -bottom-1.5 size-5 animate-spin" />
          </span>
          <p className="text-sm text-white/70">
            Collecting colours, fonts, logo, selling points and tone from{" "}
            <span className="font-semibold text-white">
              {host(brand.websiteUrl)}
            </span>
          </p>
          <div className="flex w-full max-w-sm flex-col gap-2">
            {[80, 64, 72].map((w, i) => (
              <span
                key={i}
                className="h-2.5 animate-pulse rounded-full bg-white/[0.07]"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        </KitCard>
      </BrandShell>
    );
  }

  if (brand.status === "failure" && !manual) {
    return (
      <BrandShell
        title="We couldn't read that site"
        subtitle={brand.errorMessage ?? "The website didn't load for us."}
      >
        <KitCard className="items-center gap-4 py-8 text-center">
          <AlertTriangle className="size-8 text-amber-300" />
          <p className="max-w-sm text-sm text-white/65">
            Some sites block automated visits. Try again, or fill in the kit
            yourself.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {brand.websiteUrl && (
              <button
                type="button"
                disabled={retry.isPending}
                onClick={() =>
                  retry.mutate(brand.websiteUrl!, {
                    onSuccess: (next) => {
                      remove.mutate(brand.id);
                      router.replace(`/ads-studio/brands/${next.id}`);
                    },
                  })
                }
                className="bg-primary hover:bg-primary/90 flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white disabled:opacity-40"
              >
                {retry.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RotateCcw className="size-4" />
                )}
                Try again
              </button>
            )}
            <button
              type="button"
              onClick={() => setManual(true)}
              className="flex h-10 items-center gap-2 rounded-xl border border-white/15 px-4 text-sm font-semibold text-white hover:bg-white/10"
            >
              <PencilLine className="size-4" /> Fill it in myself
            </button>
          </div>
        </KitCard>
      </BrandShell>
    );
  }

  // Keyed so the editor starts from the finished kit (not the pending one).
  return <BrandKitEditor key={`${brand.id}:${brand.status}`} brand={brand} />;
}
