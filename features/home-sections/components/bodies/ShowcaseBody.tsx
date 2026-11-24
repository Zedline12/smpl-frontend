import { FeaturedCarousel } from "@/components/FeaturedCarousel";
import type { ShowcaseBody as Body } from "../../types";

/** Big looping promo videos in a scrolling row. */
export function ShowcaseBody({ body }: { body: Body }) {
  const items = body.items.filter((i) => i.video);
  if (!items.length) return null;
  return <FeaturedCarousel items={items} />;
}
