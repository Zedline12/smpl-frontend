import { cn } from "@/lib/utils";
import type { HomeSectionType, PublicHomeSection } from "../types";
import { HomeSectionBody } from "./HomeSectionBody";
import { RecentBody } from "./bodies/RecentBody";
import { SectionHeader } from "./SectionHeader";

type SectionLike = Pick<PublicHomeSection, "header" | "body"> & Partial<Pick<PublicHomeSection, "id" | "updatedAt">>;

/** One section: header (if any) above its body. */
export function HomeSectionView({ section }: { section: SectionLike }) {
  const header = (
    <SectionHeader
      header={section.header}
      href={
        section.body.type === "templates" || section.body.type === "recent"
          ? section.body.link?.href || undefined
          : undefined
      }
    />
  );
  // Recent creations hide, header included, when the viewer has none.
  if (section.body.type === "recent")
    return (
      <section>
        <RecentBody body={section.body} header={header} />
      </section>
    );
  return (
    <section className="flex flex-col gap-5">
      {header}
      <HomeSectionBody
        body={section.body}
        dismissKey={section.id ? `${section.id}:${section.updatedAt ?? ""}` : undefined}
      />
    </section>
  );
}

/** The top-of-page blocks sit closer together than content sections. */
const COMPACT: HomeSectionType[] = ["announcement", "showcase", "tools"];

/** The live preset's sections, in order. */
export function HomeSections({ sections, className }: { sections: PublicHomeSection[]; className?: string }) {
  if (!sections.length) return null;
  return (
    <div className={cn("flex flex-col", className)}>
      {sections.map((s, i) => {
        const prev = sections[i - 1];
        const gap =
          i === 0 ? "" : COMPACT.includes(s.body.type) && COMPACT.includes(prev.body.type) ? "mt-10" : "mt-16";
        return (
          <div key={s.id} className={cn(gap, "has-[>section:empty]:hidden")}>
            <HomeSectionView section={s} />
          </div>
        );
      })}
    </div>
  );
}
