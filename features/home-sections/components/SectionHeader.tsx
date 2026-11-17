import { cn } from "@/lib/utils";
import type { SectionHeader as Header, TitleColor } from "../types";
import { TEXT_ALIGN } from "./layout";
import { SmartLink } from "./SmartLink";

const TITLE_COLOR: Record<TitleColor, string> = {
  white: "text-white",
  primary: "text-primary",
  secondary: "text-secondary",
};

/**
 * Title + small description, aligned left/center/right; nothing when the header is `none`.
 * With `href` the title is a link whose underline draws in on hover.
 */
export function SectionHeader({ header, href }: { header: Header; href?: string }) {
  if (header.align === "none" || !header.title.trim()) return null;
  return (
    <div className={cn("flex flex-col gap-1.5", TEXT_ALIGN[header.align])}>
      <h2 className={cn("text-xl font-semibold sm:text-2xl", TITLE_COLOR[header.titleColor ?? "white"])}>
        {href ? (
          <SmartLink
            href={href}
            className="inline cursor-pointer bg-gradient-to-r from-current to-current bg-[length:0%_2px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-300 ease-out hover:bg-[length:100%_2px]"
          >
            {header.title}
          </SmartLink>
        ) : (
          header.title
        )}
      </h2>
      {header.description.trim() && (
        <p className="max-w-2xl text-sm text-white/55">{header.description}</p>
      )}
    </div>
  );
}
