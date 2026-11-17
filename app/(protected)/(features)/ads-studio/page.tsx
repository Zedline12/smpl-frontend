"use client";
import { useState } from "react";
import { CircleHelp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdsHero } from "@/features/ads-studio/components/AdsHero";
import { AdsTemplates } from "@/features/ads-studio/components/AdsTemplates";
import {
  ADS_MODEL,
  AdsComposer,
} from "@/features/ads-studio/components/composer/AdsComposer";
import { useInfiniteTemplatesQuery } from "@/features/media/queries/media";

const STEPS = [
  ["Write a brief", "Say what you're selling, the offer and the vibe."],
  [
    "Pick your brand, product and avatar",
    "Their logo, colours, photos and face are used as references.",
  ],
  [
    "Generate",
    "Get several ready-to-post ads in the format you chose. They land in All media.",
  ],
];

/** Ads Studio Home: hero, the composer, then trending templates. */
export default function AdsStudioHomePage() {
  const [howOpen, setHowOpen] = useState(false);
  const templatesQuery = useInfiniteTemplatesQuery(
    undefined,
    ADS_MODEL,
    true,
    12,
  );
  const templates =
    templatesQuery.data?.pages.flatMap((p) => p.data ?? []) ?? [];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 pb-12 sm:px-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6">
        <AdsHero templates={templates} />
        <AdsComposer />
        <button
          type="button"
          onClick={() => setHowOpen(true)}
          className="flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white"
        >
          How it works <CircleHelp className="size-4" />
        </button>
      </div>

      <AdsTemplates
        templates={templates}
        loading={!templatesQuery.isFetched}
        hasMore={!!templatesQuery.hasNextPage}
        loadingMore={templatesQuery.isFetchingNextPage}
        onMore={() => templatesQuery.fetchNextPage()}
      />

      <Dialog open={howOpen} onOpenChange={setHowOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>How Ads Studio works</DialogTitle>
            <DialogDescription>
              Three steps from idea to ready-to-post ads.
            </DialogDescription>
          </DialogHeader>
          <ol className="flex flex-col gap-4">
            {STEPS.map(([title, text], i) => (
              <li key={title} className="flex gap-3">
                <span className="bg-primary/20 text-primary flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                  {i + 1}
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-semibold text-white">
                    {title}
                  </span>
                  <span className="text-sm text-white/55">{text}</span>
                </span>
              </li>
            ))}
          </ol>
        </DialogContent>
      </Dialog>
    </div>
  );
}
