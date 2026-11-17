import { HomeTour } from "@/components/HomeTour";
import { HomeWelcome } from "@/features/landing/components/HomeWelcome";
import { fetchWithToken } from "@/lib/fetcher";
import { redirect } from "next/navigation";
import { FeaturedCarousel, type FeaturedItem } from "@/components/FeaturedCarousel";
import { FeatureGrid, type FeatureItem } from "@/components/FeatureGrid";
import { HomeSections } from "@/features/home-sections/components/HomeSections";
import { getHomeSections } from "@/features/home-sections/server";

// ─── hero data ────────────────────────────────────────────────────────────────

const featured: FeaturedItem[] = [
  {
    title: "Smpl Gensu",
    description: "Transfer motion from any video onto your subjects with Gensu.",
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
    icon: "Film",
    title: "Smpl Gensu",
    description: "Transfer motion from any video onto your own subjects.",
    highlighted: true,
    href: "/create/video?model=smpl-gensu",
  },
  {
    icon: "Megaphone",
    title: "Ads Studio",
    description: "Ready-to-use ads from a brief, your brand and your products.",
    badge: "NEW",
    href: "/ads-studio",
  },
  {
    icon: "UserRound",
    title: "AI Influencer Studio",
    description: "Create and manage a photoreal AI influencer.",
    badge: "NEW",
    href: "/ai-influencer-studio",
  },
  {
    icon: "Music",
    title: "Artist",
    description: "Full songs, and your character performing them.",
    badge: "NEW",
    href: "/artist",
  },
  {
    icon: "Repeat",
    title: "Remix",
    description: "Drop your character into any video edit.",
    badge: "NEW",
    href: "/remix",
  },
  {
    icon: "Scissors",
    title: "Clipping Studio",
    description: "Turn long videos into short social clips.",
    badge: "NEW",
    href: "/clipping-studio",
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
  const sections = await getHomeSections();

  return (
    // The main layout caps pages at 90% width (sm+); home breaks out of it to the full
    // width minus 1rem each side: 100%/0.9 = the layout's width, then centered back.
    <div className="w-full py-6 px-3 sm:px-0 sm:w-[calc(100%/0.9-2rem)] sm:ml-[calc((100%-100%/0.9)/2+1rem)] flex flex-col gap-10 sm:mt-4">
      <HomeTour />

      {/* ── hero ── */}
      <section className="flex flex-col gap-10">
        <FeaturedCarousel items={featured} />
        <FeatureGrid promo={promo} features={features} />
      </section>

      {/* ── custom sections (App Appearance → Homepage Sections) ── */}
      {/* mt-6 + the page's gap-10 = the sections' own gap-16 */}
      <HomeSections sections={sections} className="mt-6" />

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
