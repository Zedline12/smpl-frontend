import { MediaGrid } from "@/features/media/components/MediaGrid";
import PromptComposer from "@/features/generation/components/prompt/PromptComposer";
import { HomeTour } from "@/components/HomeTour";
import { HomeWelcome } from "@/features/landing/components/HomeWelcome";
import { Media } from "@/features/media/types/media";
import { fetchWithToken } from "@/lib/fetcher";
import { redirect } from "next/navigation";

export default async function WorkspacePage() {
  const isAuthRes = await fetchWithToken("/auth/is-auth", { method: "POST" });
  if (!isAuthRes.ok) {
    redirect("/onboard");
  }

  const aspectRatios = ["16:9", "4:3", "1:1", "3:4", "9:16", "5:4"] as const;
  const media: Media[] = Array.from({ length: 13 }).map((_, i) => {
    const randomRatio =
      aspectRatios[Math.floor(Math.random() * aspectRatios.length)];
    return {
      id: `mock-${i + 1}`,
      url: `/assets/background-media/${i + 1}.webp`,
      type: "image",
      aspectRatio: randomRatio as any,
      width: 1080,
      height: 1080,
      input: {},
      model: "s",
      format: "webp",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  // The root height is viewport-based rather than min-h-full: a percentage
  // min-height needs a definite height up the parent chain, which the layout's
  // flex-1 wrapper doesn't reliably provide. 3.5rem is the navbar (h-14).
  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] w-full p-5 sm:mt-5">
      {/*
        Decorative sample wall. pointer-events-none so the cards underneath
        can't be hovered or opened — MediaCard is normally interactive.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="opacity-85">
          <MediaGrid
            imagesWidth={250}
            media={media}
            breakpointCols={{ default: 3, 1600: 4, 1450: 4, 1200: 3, 940: 2 }}
          />
        </div>
        {/* Scrim: uses the theme background so it darkens in dark mode and
            lightens in light mode, keeping the copy readable either way. */}
        <div className="bg-background/45 absolute inset-0" />
      </div>

      {/* Foreground — later in the DOM, so it paints above the background
          layer without needing a z-index. */}
      <div className="relative">
        <HomeTour />
        <section className="sm:w-1/2 w-full  fixed sm:bottom-10 bottom-19 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
          <PromptComposer />
        </section>

        <HomeWelcome />
      </div>
    </div>
  );
}
