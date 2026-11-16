import { cn } from "@/lib/utils";
import type { CardsBody as Body } from "../../types";
import { GRID_COLUMNS } from "../layout";
import { SmartLink } from "../SmartLink";

/** Visual cards: a colored/gradient block with optional image, title and text. */
export function CardsBody({ body }: { body: Body }) {
  if (!body.items.length) return null;
  return (
    <div className={cn("grid gap-4", GRID_COLUMNS[body.columns] ?? GRID_COLUMNS[3])}>
      {body.items.map((card, i) => (
        <SmartLink
          key={i}
          href={card.href}
          className={cn(
            "flex min-h-40 flex-col overflow-hidden rounded-2xl border border-white/10",
            card.href && "transition-transform hover:-translate-y-0.5",
          )}
        >
          <div
            className="flex h-full flex-col gap-3 p-5"
            style={{ background: card.background || undefined, color: card.textColor || undefined }}
          >
            {card.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={card.imageUrl} alt="" loading="lazy" className="aspect-video w-full rounded-xl object-cover" />
            )}
            {card.title && <h3 className="text-lg font-semibold">{card.title}</h3>}
            {card.text && <p className="whitespace-pre-line text-sm opacity-80">{card.text}</p>}
          </div>
        </SmartLink>
      ))}
    </div>
  );
}
