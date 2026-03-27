import { MediaGrid } from "@/features/media/components/MediaGrid";
import PromptComposer from "@/features/generation/components/prompt/PromptComposer";
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
      url: `/assets/images/${i + 1}.webp`,
      type: "image",
      aspectRatio: randomRatio as any,
      width: 1080,
      height: 1080,
      format: "webp",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
  return (
    <div className="w-full p-5 mt-5">
      <section className="sm:w-1/2 w-full  fixed sm:bottom-10 bottom-19 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
        <PromptComposer />
      </section>
      <MediaGrid
        imagesWidth={250}
        media={media}
        breakpointCols={{ default: 3, 1600: 4, 1450: 4, 1200: 3, 940: 2 }}
      ></MediaGrid>
    </div>
  );
}
