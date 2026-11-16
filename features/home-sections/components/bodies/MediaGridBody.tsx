import { cn } from "@/lib/utils";
import type { MediaBody } from "../../types";
import { ASPECT_CLASS, GRID_COLUMNS } from "../layout";
import { SmartLink } from "../SmartLink";

/** A grid of photos and looping videos, each with an optional caption and link. */
export function MediaGridBody({ body }: { body: MediaBody }) {
  const items = body.items.filter((i) => i.url);
  if (!items.length) return null;
  return (
    <div className={cn("grid gap-4", GRID_COLUMNS[body.columns] ?? GRID_COLUMNS[3])}>
      {items.map((item, i) => (
        <SmartLink
          key={`${item.url}-${i}`}
          href={item.href}
          className="group flex flex-col gap-2"
        >
          <div className={cn("relative w-full overflow-hidden rounded-xl border border-white/10 bg-black", ASPECT_CLASS[body.aspectRatio])}>
            {item.kind === "video" ? (
              <video
                src={item.url}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.url}
                alt={item.caption ?? ""}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            )}
          </div>
          {item.caption && <p className="px-0.5 text-sm text-white/70">{item.caption}</p>}
        </SmartLink>
      ))}
    </div>
  );
}
