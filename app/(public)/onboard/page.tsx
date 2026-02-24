import { MediaGrid } from "@/features/media/components/MediaGrid";
import PromptComposer from "@/features/media/components/prompt/PromptComposer";
import { fetchWithToken } from "@/lib/fetcher";
import { Media } from "@/features/media/types/media";

export default async function OnboardPage() {
  const json = await fetchWithToken("/media?limit=30").then((res) => res.json());
  const media: Media[] = json.data;
  return (
    <div className="w-full h-full">
      <section className="sm:w-1/2 w-full  fixed sm:bottom-10 bottom-19 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
        <PromptComposer />
      </section>

      <div className="">
        <section className=" overflow-y-auto  ">
          <MediaGrid media={media} breakpointCols={{ default: 3,1600:4, 1450:4, 1200: 3, 940: 2 }} />
        </section>
      </div>
    </div>
  );
}
