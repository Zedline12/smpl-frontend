"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Film, Image as ImageIcon, Loader2, RotateCcw } from "lucide-react";
import { MediaManagerDialog } from "@/features/generation/components/prompt/MediaManagerDialog";
import { DEFAULT_THUMBNAILS, KIND_SECTIONS, type OfferingKind, type Thumbnail } from "@/features/catalog/catalog";
import { getModel } from "@/features/generation/enums/models.enum";

interface AdminOffering {
  id: string;
  kind: OfferingKind;
  name: string;
  internal: boolean;
  enabled: boolean;
  surfaces: string[];
  thumbnail: Thumbnail | null;
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/admin/catalog${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error || json?.message || "Request failed");
  return (json?.data ?? json) as T;
}

/** Same crop as the Create sidebar's hero card. */
function Preview({ thumbnail, id }: { thumbnail: Thumbnail | null; id: string }) {
  const svg = getModel(id)?.svg;
  return (
    <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-white/[0.04]">
      {thumbnail?.type === "video" ? (
        <video key={thumbnail.url} src={thumbnail.url} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
      ) : thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img loading="lazy" decoding="async" key={thumbnail.url} src={thumbnail.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-start justify-center bg-[radial-gradient(120%_90%_at_50%_0%,rgba(107,65,255,0.35),rgba(234,75,255,0.12)_45%,transparent_75%)] pt-8">
          <span className="text-[40px] opacity-90 [&>svg]:size-10" aria-hidden>
            {svg}
          </span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
    </div>
  );
}

function ThumbnailCard({ offering }: { offering: AdminOffering }) {
  const queryClient = useQueryClient();
  const [picker, setPicker] = useState<"video" | "image" | null>(null);
  const fallback = DEFAULT_THUMBNAILS[offering.id] ?? null;
  const shown = offering.thumbnail ?? fallback;

  const save = useMutation({
    mutationFn: (thumbnail: Thumbnail | null) =>
      api(`/offerings/${encodeURIComponent(offering.id)}`, { method: "PATCH", body: JSON.stringify({ thumbnail }) }),
    onSuccess: (_r, thumbnail) => {
      toast.success(thumbnail ? `${offering.name}: thumbnail saved` : `${offering.name}: back to the default`);
      void queryClient.invalidateQueries({ queryKey: ["admin", "catalog"] });
      void queryClient.invalidateQueries({ queryKey: ["catalog"] });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const button =
    "flex items-center gap-1.5 rounded-md bg-black/70 px-2 py-1 text-[11px] font-medium text-white backdrop-blur hover:bg-black/90 disabled:opacity-50";

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Preview thumbnail={shown} id={offering.id} />
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold text-[var(--purple-300)]">{offering.name}</p>
            <p className="text-[11px] text-white/50">
              {offering.thumbnail ? "Custom" : fallback ? "Default" : "No thumbnail (icon)"}
              {!offering.enabled && " · hidden"}
            </p>
          </div>
          {save.isPending && <Loader2 className="size-4 shrink-0 animate-spin text-white/70" />}
        </div>
        <div className="absolute top-3 right-3 flex gap-1.5">
          <button type="button" className={button} disabled={save.isPending} onClick={() => setPicker("video")}>
            <Film className="size-3.5" /> Video
          </button>
          <button type="button" className={button} disabled={save.isPending} onClick={() => setPicker("image")}>
            <ImageIcon className="size-3.5" /> Image
          </button>
          {offering.thumbnail && (
            <button
              type="button"
              className={button}
              disabled={save.isPending}
              onClick={() => save.mutate(null)}
              title="Back to the default"
              aria-label="Back to the default"
            >
              <RotateCcw className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <MediaManagerDialog
        key={picker ?? "closed"}
        open={picker !== null}
        onOpenChange={(open) => !open && setPicker(null)}
        mediaType={picker ?? "video"}
        maxSelections={1}
        selectedImage={shown?.type === picker ? shown.url : undefined}
        onSelect={(urls) => {
          const type = picker;
          setPicker(null);
          if (urls[0] && type) save.mutate({ type, url: urls[0] });
        }}
      />
    </div>
  );
}

/** App Appearance → Model Thumbnails: the video or image on each model's card in Create. */
export function ModelThumbnailsEditor() {
  const catalog = useQuery({
    queryKey: ["admin", "catalog"],
    queryFn: () => api<{ offerings: AdminOffering[] }>(""),
  });
  // What the Create sidebar can show (create and edit pickers), not internal engines.
  const offerings = (catalog.data?.offerings ?? []).filter(
    (o) => !o.internal && o.surfaces.some((s) => s === "create" || s === "edit"),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold">Model Thumbnails</h2>
        <p className="text-sm text-white/40">
          The looping video or image on each model&apos;s card in the Create sidebar. Changes reach users within a couple of
          minutes.
        </p>
      </div>

      {catalog.isError ? (
        <p className="text-sm text-red-400">{(catalog.error as Error).message}</p>
      ) : catalog.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-white/50">
          <Loader2 className="size-4 animate-spin" /> Loading models…
        </div>
      ) : (
        KIND_SECTIONS.map((section) => {
          const items = offerings.filter((o) => o.kind === section.kind);
          if (!items.length) return null;
          return (
            <section key={section.kind} className="flex flex-col gap-3">
              <h3 className="text-[12px] font-semibold tracking-wider text-white/45 uppercase">{section.label}</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((o) => (
                  <ThumbnailCard key={o.id} offering={o} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
