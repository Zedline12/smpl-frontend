import { ArrowRight } from "lucide-react";
import type { UpgradeBody as Body } from "../../types";
import { SmartLink } from "../SmartLink";

/** A wide call to upgrade (usually shown only to people without a plan). */
export function UpgradeBody({ body }: { body: Body }) {
  return (
    <div
      className="relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-white/10 p-6 text-white sm:flex-row sm:items-center sm:p-8"
      style={{ background: body.background || undefined }}
    >
      <div className="min-w-0 flex-1">
        <h3 className="text-2xl font-extrabold uppercase leading-tight" style={{ letterSpacing: "-0.03em" }}>
          {body.title}
        </h3>
        {body.text && <p className="mt-2 max-w-xl whitespace-pre-line text-sm opacity-85">{body.text}</p>}
        <SmartLink
          href={body.cta.href}
          className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5"
        >
          {body.cta.label} <ArrowRight className="size-4" />
        </SmartLink>
      </div>
      {body.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={body.imageUrl} alt="" loading="lazy" className="w-full max-w-xs shrink-0 rounded-xl object-cover sm:w-64" />
      )}
    </div>
  );
}
