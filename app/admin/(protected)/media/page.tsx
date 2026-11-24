import { Suspense } from "react";
import { MediaGrid } from "@/features/media/components/MediaGrid";
import { MediaFilters } from "@/features/admin/media/MediaFilters";
import { AUDIO_MODELS, IMAGE_MODELS, STUDIO_MODELS, VIDEO_MODELS } from "@/features/generation/enums/models.enum";
import { fetchWithToken } from "@/lib/fetcher";

type Search = {
  page?: string;
  sort?: string;
  days?: string;
  type?: string;
  model?: string;
  published?: string;
  hidden?: string;
  user?: string;
};

const MODELS = [...IMAGE_MODELS, ...VIDEO_MODELS, ...AUDIO_MODELS, ...STUDIO_MODELS]
  .map((m) => ({ id: String(m.id), name: m.name }))
  .filter((m, i, all) => all.findIndex((x) => x.id === m.id) === i)
  .sort((a, b) => a.name.localeCompare(b.name));

/** ISO date `days` ago (the time range filter). */
function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

/** Admin → Media: every user's media, filtered, sorted and paged (filters live in the URL). */
export default async function MediaPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const page = sp.page ? parseInt(sp.page, 10) || 1 : 1;
  const q = new URLSearchParams({ limit: "30", page: String(page) });
  for (const k of ["sort", "type", "model", "published", "hidden", "user"] as const) if (sp[k]) q.set(k, sp[k]!);
  if (sp.days) q.set("from", daysAgo(Number(sp.days)));

  const response = await fetchWithToken(`/media?${q}`, { method: "GET" });
  const json = await response.json().catch(() => null);
  const data = json?.data ?? [];
  const totalPages = json?.pagination?.totalPages || 1;
  const currentPage = json?.pagination?.page || 1;
  const total = json?.totalCount ?? 0;

  // Paging keeps the filters.
  const pageHref = (n: number) => {
    const p = new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][]);
    p.set("page", String(n));
    return `/admin/media?${p}`;
  };

  return (
    <div className="mt-2 flex w-full flex-col gap-5 sm:p-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Media</h2>
        <p className="text-sm text-white/50">{total.toLocaleString("en-US")} items</p>
      </div>
      <Suspense>
        <MediaFilters models={MODELS} />
      </Suspense>

      {data.length ? (
        <MediaGrid imagesWidth={250} media={data} breakpointCols={{ default: 3, 1600: 4, 1450: 4, 1200: 3, 940: 2, 560: 1 }} />
      ) : (
        <p className="rounded-xl border border-dashed border-white/10 p-10 text-center text-sm text-white/45">Nothing matches these filters.</p>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          {json?.pagination?.hasPrev ? (
            <a href={pageHref(currentPage - 1)} className="rounded-md border px-4 py-2 transition-colors hover:bg-white/5">
              Previous
            </a>
          ) : (
            <div className="cursor-not-allowed rounded-md border px-4 py-2 opacity-50">Previous</div>
          )}
          <span className="px-2 text-sm text-white/55">
            Page {currentPage} of {totalPages}
          </span>
          {json?.pagination?.hasNext ? (
            <a href={pageHref(currentPage + 1)} className="rounded-md border px-4 py-2 transition-colors hover:bg-white/5">
              Next
            </a>
          ) : (
            <div className="cursor-not-allowed rounded-md border px-4 py-2 opacity-50">Next</div>
          )}
        </div>
      )}
    </div>
  );
}
