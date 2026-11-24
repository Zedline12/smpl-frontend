import type { PublicHomeSectionBody } from "../types";
import { AnnouncementBody } from "./bodies/AnnouncementBody";
import { CardsBody } from "./bodies/CardsBody";
import { HeroBody } from "./bodies/HeroBody";
import { MediaGridBody } from "./bodies/MediaGridBody";
import { ModelsBody } from "./bodies/ModelsBody";
import { RecentBody } from "./bodies/RecentBody";
import { ShowcaseBody } from "./bodies/ShowcaseBody";
import { TemplatesBody } from "./bodies/TemplatesBody";
import { ToolsBody } from "./bodies/ToolsBody";
import { UpgradeBody } from "./bodies/UpgradeBody";

/** Picks the body component for the section's type. */
export function HomeSectionBody({ body, dismissKey }: { body: PublicHomeSectionBody; dismissKey?: string }) {
  switch (body.type) {
    case "media":
      return <MediaGridBody body={body} />;
    case "templates":
      return <TemplatesBody body={body} />;
    case "cards":
      return <CardsBody body={body} />;
    case "hero":
      return <HeroBody body={body} />;
    case "showcase":
      return <ShowcaseBody body={body} />;
    case "tools":
      return <ToolsBody body={body} />;
    case "announcement":
      return <AnnouncementBody body={body} dismissKey={dismissKey} />;
    case "models":
      return <ModelsBody body={body} />;
    case "recent":
      return <RecentBody body={body} />;
    case "upgrade":
      return <UpgradeBody body={body} />;
    default:
      return null;
  }
}
