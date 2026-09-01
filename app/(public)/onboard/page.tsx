import { MediaGrid } from "@/features/media/components/MediaGrid";
import PromptComposer from "@/features/generation/components/prompt/PromptComposer";
import { Media } from "@/features/media/types/media";
import Link from "next/link";
import { fetchAppStats } from "@/features/app-stats/api";
import { AppStatsBand } from "@/features/app-stats/components/AppStatsBand";
import { OnboardHero } from "@/features/landing/components/OnboardHero";
export default async function OnboardPage() {
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
    <div className="w-full h-full relative">
      <section className="sm:w-1/2 w-full  fixed sm:bottom-10 bottom-19 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
        <Link
          href="/login"
          aria-label="Sign in to start creating"
          className="w-full cursor-pointer"
        >
          <div className="pointer-events-none w-full" aria-hidden="true">
            <PromptComposer />
          </div>
        </Link>
      </section>

      <div className="">
        <section className=" overflow-y-auto  ">
          <MediaGrid
            media={media}
            breakpointCols={{ default: 3, 1600: 4, 1450: 4, 1200: 3, 940: 2 }}
          />
        </section>
      </div>
    </div>
  );
}
// export default async function OnboardPage() {
//   const stats = await fetchAppStats();

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
//   return (
//     <div className="w-full h-full relative">
//       <section className="sm:w-1/2 w-full  fixed sm:bottom-10 bottom-19 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
//         <Link
//           href="/login"
//           aria-label="Sign in to start creating"
//           className="w-full cursor-pointer"
//         >
//           <div className="pointer-events-none w-full" aria-hidden="true">
//             <PromptComposer />
//           </div>
//         </Link>
//       </section>

//       {stats && (
//         <div className="mb-5 px-4 pt-3 sm:px-6">
//           <AppStatsBand stats={stats} />
//         </div>
//       )}

//       <div className="px-4 pb-6 sm:px-6">
//         <OnboardHero />
//       </div>

//       <div className="px-4 pb-4 sm:px-6">
//         <h2 className="text-foreground text-xl font-bold sm:text-2xl">
//           Nano Banana Pro
//         </h2>
//         <p className="text-muted-foreground mt-1 text-sm">
//           Best way to take your ad creatives to the next level
//         </p>
//       </div>

//       <div className="">
//         <section className=" overflow-y-auto  ">
//           <MediaGrid
//             media={media}
//             breakpointCols={{ default: 3, 1600: 4, 1450: 4, 1200: 3, 940: 2 }}
//           />
//         </section>
//       </div>
//     </div>
//   );
// }
