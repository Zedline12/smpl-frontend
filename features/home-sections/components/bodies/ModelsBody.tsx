import { Cpu } from "lucide-react";
import type { ModelsBody as Body } from "../../types";
import { SmartLink } from "../SmartLink";

/** A scrolling row of AI model cards: logo, name, a line of text, badge. */
export function ModelsBody({ body }: { body: Body }) {
  if (!body.items.length) return null;
  return (
    <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-1" style={{ scrollbarWidth: "none" }}>
      {body.items.map((m, i) => (
        <SmartLink
          key={i}
          href={m.href}
          className="group flex w-56 shrink-0 snap-start items-center gap-3 rounded-[14px] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3 transition-all hover:-translate-y-0.5 hover:border-[#6b41ff]/40"
        >
          <span
            className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]"
          >
            {m.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.logoUrl} alt="" loading="lazy" className="size-full object-contain p-1.5" />
            ) : (
              <Cpu className="size-5 text-white/50" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <span className="truncate text-sm font-semibold text-foreground">{m.name}</span>
              {m.badge && (
                <span
                  className="shrink-0 rounded-full px-1.5 py-px text-[9px] font-bold uppercase italic"
                  style={{ background: "var(--secondary)", color: "#0a0a0a" }}
                >
                  {m.badge}
                </span>
              )}
            </span>
            {m.description && <span className="block truncate text-xs text-muted-foreground">{m.description}</span>}
          </span>
        </SmartLink>
      ))}
    </div>
  );
}
