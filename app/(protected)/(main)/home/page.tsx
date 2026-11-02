import { MediaGrid } from "@/features/media/components/MediaGrid";
import PromptComposer from "@/features/generation/components/prompt/PromptComposer";
import { HomeTour } from "@/components/HomeTour";
import { HomeWelcome } from "@/features/landing/components/HomeWelcome";
import { Media } from "@/features/media/types/media";
import { fetchWithToken } from "@/lib/fetcher";
import { redirect } from "next/navigation";
import { FeaturedCarousel, type FeaturedItem } from "@/components/FeaturedCarousel";
import { FeatureGrid, type FeatureItem } from "@/components/FeatureGrid";

// ─── hero data ────────────────────────────────────────────────────────────────

const featured: FeaturedItem[] = [
  {
    title: "Smpl Gensu",
    description: "Transfer motion from any video onto your subjects with Genjutsu.",
    video: "https://pub-c9ce2e0e90ea4982abdc05b1e4bd66bb.r2.dev/Homepage%20Videos/31_SMPL_Gensu_Promo_16x9.mp4",
    poster: "",
    href: "/create/video",
  },
  {
    title: "Remix Studio",
    description: "Recreate any video edit into your your style",
    video: "https://pub-c9ce2e0e90ea4982abdc05b1e4bd66bb.r2.dev/Homepage%20Videos/32_SMPL_Remix_Promo_16x9.mp4",
    poster: "",
    href: "/remix",
  },
  {
    title: "Artist Studio",
    description: "Create stunning songs with our latest model",
    video: "https://pub-c9ce2e0e90ea4982abdc05b1e4bd66bb.r2.dev/Homepage%20Videos/33_SMPL_Artist_Promo_16x9.mp4",
    poster: "",
    href: "/create/image",
  },
  {
    title: "Clipping Studio",
    description: "Extract multiple social media clips from any video",
    video: "https://pub-c9ce2e0e90ea4982abdc05b1e4bd66bb.r2.dev/Homepage%20Videos/35_SMPL_Clipping_Studio_Promo_16x9.mp4",
    poster: "",
    href: "/create/audio",
  },
];

const features: FeatureItem[] = [
  {
    icon: "Sparkles",
    title: "AI Generation",
    description: "Create videos, images and audio from text or reference media.",
    badge: "FREE",
    href: "/create/video",
  },
  {
    icon: "BarChart",
    title: "Analytics",
    description: "Track your usage, credits and generation history at a glance.",
    href: "/",
  },
  {
    icon: "Cpu",
    title: "Latest Models",
    description: "Access Veo 3, Kling, Seedance, Grok and more as they launch.",
    href: "/create/video",
  },
  {
    icon: "Film",
    title: "Motion Transfer",
    description: "Transplant motion from any clip onto your own subjects.",
    highlighted: true,
    href: "/create/video",
  },
  {
    icon: "Asterisk",
    title: "Media Library",
    description: "All your generated assets stored and ready to reuse.",
    href: "/media",
  },
  {
    icon: "Wand",
    title: "Smart Prompts",
    description: "Prompt suggestions powered by your previous generations.",
    href: "/create/video",
  },
];

const promo = {
  title: "Smpl Studio",
  subtitle: "Your AI creative suite — all models, one workspace.",
  ctaLabel: "Create",
  ctaHref: "/create/video",
  statusItems: [
    { label: "Veo 3 generation complete", accent: true },
    { label: "Kling v3 rendering…" },
    { label: "Seedance 2.5 queued" },
    { label: "ElevenLabs pending" },
  ],
  thumbUrls: ["", "", ""],
};

// ─── page ─────────────────────────────────────────────────────────────────────

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

  return (
    <div className="w-full py-6 px-1 sm:px-0 flex flex-col gap-10 sm:mt-4">
      <HomeTour />

      {/* ── hero ── */}
      <section className="flex flex-col gap-10">
        <FeaturedCarousel items={featured} />
        <FeatureGrid promo={promo} features={features} />
      </section>

      <section className="sm:w-1/2 w-full fixed sm:bottom-10 bottom-19 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
        <PromptComposer />
      </section>

      <MediaGrid
        imagesWidth={250}
        media={media}
        breakpointCols={{ default: 3, 1600: 4, 1450: 4, 1200: 3, 940: 2 }}
      />
    </div>
  );
}
// export default async function WorkspacePage() {
//   const isAuthRes = await fetchWithToken("/auth/is-auth", { method: "POST" });
//   if (!isAuthRes.ok) {
//     redirect("/onboard");
//   }

//   const aspectRatios = ["16:9", "4:3", "1:1", "3:4", "9:16", "5:4"] as const;
//   const media: Media[] = Array.from({ length: 13 }).map((_, i) => {
//     const randomRatio =
//       aspectRatios[Math.floor(Math.random() * aspectRatios.length)];
//     return {
//       id: `mock-${i + 1}`,
//       url: `/assets/background-media/${i + 1}.webp`,
//       type: "image",
//       aspectRatio: randomRatio as any,
//       width: 1080,
//       height: 1080,
//       input: {},
//       model: "s",
//       format: "webp",
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     };
//   });

//   // The root height is viewport-based rather than min-h-full: a percentage
//   // min-height needs a definite height up the parent chain, which the layout's
//   // flex-1 wrapper doesn't reliably provide. 3.5rem is the navbar (h-14).
//   return (
//     <div className="relative min-h-[calc(100vh-3.5rem)] w-full p-5 sm:mt-5">
//       {/*
//         Decorative sample wall. pointer-events-none so the cards underneath
//         can't be hovered or opened — MediaCard is normally interactive.
//       */}
//       <div
//         aria-hidden="true"
//         className="pointer-events-none absolute inset-0 overflow-hidden"
//       >
//         <div className="opacity-85">
//           <MediaGrid
//             imagesWidth={250}
//             media={media}
//             breakpointCols={{ default: 3, 1600: 4, 1450: 4, 1200: 3, 940: 2 }}
//           />
//         </div>
//         {/* Scrim: uses the theme background so it darkens in dark mode and
//             lightens in light mode, keeping the copy readable either way. */}
//         <div className="bg-background/45 absolute inset-0" />
//       </div>

//       {/* Foreground — later in the DOM, so it paints above the background
//           layer without needing a z-index. */}
//       <div className="relative">
//         <HomeTour />
//         <section className="sm:w-1/2 w-full  fixed sm:bottom-10 bottom-19 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
//           <PromptComposer />
//         </section>

//         <HomeWelcome />
//       </div>
//     </div>
//   );
// }
