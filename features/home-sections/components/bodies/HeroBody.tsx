import { cn } from "@/lib/utils";
import type { HeroBody as Body } from "../../types";
import { TEXT_ALIGN } from "../layout";
import { SmartLink } from "../SmartLink";

const HEIGHT = { sm: "min-h-56", md: "min-h-80", lg: "min-h-[28rem]" } as const;

/** A banner: background image/video, darkening overlay, then title, text and CTA on top. */
export function HeroBody({ body }: { body: Body }) {
  const { background } = body;
  return (
    <div className={cn("relative flex overflow-hidden rounded-2xl border border-white/10 bg-black", HEIGHT[body.height])}>
      {background.url &&
        (background.kind === "video" ? (
          <video src={background.url} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={background.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ))}
      <div className="absolute inset-0 bg-black" style={{ opacity: body.overlay }} />

      <div className={cn("relative flex w-full flex-col justify-center gap-3 p-6 sm:p-10", TEXT_ALIGN[body.align])}>
        {body.title && <h3 className="max-w-2xl text-2xl font-bold text-white sm:text-4xl">{body.title}</h3>}
        {body.text && <p className="max-w-xl whitespace-pre-line text-sm text-white/80 sm:text-base">{body.text}</p>}
        {body.cta?.label && body.cta.href && (
          <SmartLink
            href={body.cta.href}
            className="mt-2 inline-flex rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-white/85"
          >
            {body.cta.label}
          </SmartLink>
        )}
      </div>
    </div>
  );
}
