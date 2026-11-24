import { HomeTour } from "@/components/HomeTour";
import { HomeSections } from "@/features/home-sections/components/HomeSections";
import { getHomeSections } from "@/features/home-sections/server";

/**
 * `/`: the explore page, for guests and signed-in users alike (only the navbar differs).
 * Everything on it is the live home preset's sections (Admin → App Settings → Homepage).
 * Admins can preview another preset with `?preset=<id>` and as another viewer with
 * `?as=guest|no_plan|paid`.
 */
export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ preset?: string; as?: string }>;
}) {
  const { preset, as } = await searchParams;
  const sections = await getHomeSections({ preset, as });

  return (
    // The main layout caps pages at 90% width (sm+); home breaks out of it to the full
    // width minus 1rem each side: 100%/0.9 = the layout's width, then centered back.
    <div className="w-full py-6 px-3 sm:px-0 sm:w-[calc(100%/0.9-2rem)] sm:ml-[calc((100%-100%/0.9)/2+1rem)] flex flex-col sm:mt-4">
      <HomeTour />
      <HomeSections sections={sections} />
    </div>
  );
}
