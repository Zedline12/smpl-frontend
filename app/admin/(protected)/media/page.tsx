import { MediaGrid } from "@/features/media/components/MediaGrid";
import { fetchWithToken } from "@/lib/fetcher";

export default async function MediaPage() {
     const media = await fetchWithToken("/media?limit=50", { method: "GET" });
        const data = await media.json();
     return (
       <div className="w-full p-5 mt-5">
         <MediaGrid
           imagesWidth={250}
           media={data.data}
           breakpointCols={{ default: 3, 1600: 4, 1450: 4, 1200: 3, 940: 2 }}
         ></MediaGrid>
       </div>
     );
}