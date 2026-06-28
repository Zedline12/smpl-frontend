import { MediaGrid } from "@/features/media/components/MediaGrid";
import { fetchWithToken } from "@/lib/fetcher";

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const page = resolvedParams.page ? parseInt(resolvedParams.page, 10) : 1;
  const response = await fetchWithToken(`/media?limit=30&page=${page}`, {
    method: "GET",
  });
  const json = await response.json();
  const data= json.data;
  const totalPages = json.pagination?.totalPages || 1;
  const currentPage = json.pagination?.page || 1;
   
  return (
    <div className="w-full p-5 mt-5 flex flex-col gap-6">
      <MediaGrid
        imagesWidth={250}
        media={data}
        breakpointCols={{ default: 3, 1600: 4, 1450: 4, 1200: 3, 940: 2 }}
      ></MediaGrid>

      {totalPages > 0 && (
        <div className="flex justify-center items-center space-x-4 mt-6">
          {json.pagination.hasPrev ? (
            <a
              href={`/admin/media?page=${currentPage - 1}`}
              className="px-4 py-2 border rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              Previous
            </a>
          ) : (
            <div className="px-4 py-2 border rounded-md opacity-50 cursor-not-allowed">
              Previous
            </div>
          )}
          <span className="font-medium text-sm text-muted-foreground px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          {json.pagination.hasNext ? (
            <a
              href={`/admin/media?page=${currentPage + 1}`}
              
              className="px-4 py-2 border rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              Next
            </a>
          ) : (
            <div className="px-4 py-2 border rounded-md opacity-50 cursor-not-allowed">
              Next
            </div>
          )}
        </div>
      )}
    </div>
  );
}
