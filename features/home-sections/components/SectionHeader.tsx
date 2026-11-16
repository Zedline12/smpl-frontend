import { cn } from "@/lib/utils";
import type { SectionHeader as Header, TitleColor } from "../types";
import { TEXT_ALIGN } from "./layout";

const TITLE_COLOR: Record<TitleColor, string> = {
  white: "text-white",
  primary: "text-primary",
  secondary: "text-secondary",
};

/** Title + small description, aligned left/center/right; nothing when the header is `none`. */
export function SectionHeader({ header }: { header: Header }) {
  if (header.align === "none" || !header.title.trim()) return null;
  return (
    <div className={cn("flex flex-col gap-1.5", TEXT_ALIGN[header.align])}>
      <h2 className={cn("text-xl font-semibold sm:text-2xl", TITLE_COLOR[header.titleColor ?? "white"])}>{header.title}</h2>
      {header.description.trim() && (
        <p className="max-w-2xl text-sm text-white/55">{header.description}</p>
      )}
    </div>
  );
}
