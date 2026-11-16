import type { PublicHomeSectionBody } from "../types";
import { CardsBody } from "./bodies/CardsBody";
import { HeroBody } from "./bodies/HeroBody";
import { MediaGridBody } from "./bodies/MediaGridBody";
import { TemplatesBody } from "./bodies/TemplatesBody";

/** Picks the body component for the section's type. */
export function HomeSectionBody({ body }: { body: PublicHomeSectionBody }) {
  switch (body.type) {
    case "media":
      return <MediaGridBody body={body} />;
    case "templates":
      return <TemplatesBody body={body} />;
    case "cards":
      return <CardsBody body={body} />;
    case "hero":
      return <HeroBody body={body} />;
    default:
      return null;
  }
}
