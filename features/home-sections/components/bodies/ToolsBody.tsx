import { FeatureGrid } from "@/components/FeatureGrid";
import type { ToolsBody as Body } from "../../types";

/** The studio card (optional) and the tool cards. */
export function ToolsBody({ body }: { body: Body }) {
  const promo = body.promo
    ? {
        title: body.promo.title,
        subtitle: body.promo.subtitle,
        ctaLabel: body.promo.cta?.label,
        ctaHref: body.promo.cta?.href,
        statusItems: body.promo.statusItems,
        thumbUrls: body.promo.thumbUrls,
      }
    : null;
  if (!promo && !body.items.length) return null;
  return <FeatureGrid promo={promo} features={body.items} />;
}
