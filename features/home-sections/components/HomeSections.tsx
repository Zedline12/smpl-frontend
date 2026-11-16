import { cn } from "@/lib/utils";
import type { PublicHomeSection } from "../types";
import { HomeSectionBody } from "./HomeSectionBody";
import { SectionHeader } from "./SectionHeader";

/** One custom section: header (if any) above its body. */
export function HomeSectionView({ section }: { section: Pick<PublicHomeSection, "header" | "body"> }) {
  return (
    <section className="flex flex-col gap-5">
      <SectionHeader header={section.header} />
      <HomeSectionBody body={section.body} />
    </section>
  );
}

/** The admin-made sections after the home hero, with one standard gap between them. */
export function HomeSections({ sections, className }: { sections: PublicHomeSection[]; className?: string }) {
  if (!sections.length) return null;
  return (
    <div className={cn("flex flex-col gap-16", className)}>
      {sections.map((s) => (
        <HomeSectionView key={s.id} section={s} />
      ))}
    </div>
  );
}
