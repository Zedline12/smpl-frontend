import { HomeTour } from "@/components/HomeTour";
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
    href: "/create/video?model=smpl-remix",
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
    href: "/create/video?model=smpl-remix",
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

/** `/`: the explore page, for guests and signed-in users alike (only the navbar differs). */
export default async function ExplorePage() {
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
