import { formatDistanceToNow } from "date-fns";
import { Film, Image as ImageIcon, Loader2 } from "lucide-react";
import { BrandTheme } from "@/features/brand-themes/types";
import { MarketingStudioCreation, isMarketingStudioActive } from "../types";

function relativeTime(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return formatDistanceToNow(date, { addSuffix: true });
}

interface ThemeCreationsCardProps {
  theme: BrandTheme;
  creations: MarketingStudioCreation[];
}

export function ThemeCreationsCard({
  theme,
  creations,
}: ThemeCreationsCardProps) {
  const photos = creations.filter((c) => c.mediaType === "photo").length;
  const videos = creations.filter((c) => c.mediaType === "video").length;
  const generating = creations.filter(isMarketingStudioActive).length;
  const latest = creations.reduce(
    (max, c) => (c.createdAt > max ? c.createdAt : max),
    creations[0]?.createdAt ?? "",
  );

  const tabStyle = theme.primaryColor
    ? {
        background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.primaryColor}88)`,
      }
    : undefined;

  return (
    <div className="cursor-pointer group">
      {/* Folder tab — theme color or default gradient */}
      <div
        className={`relative z-10 w-[42%] h-6 rounded-t-lg border border-b-0 border-border opacity-80 group-hover:opacity-100 transition-opacity duration-200${!theme.primaryColor ? " bg-gradient-primary" : ""}`}
        style={tabStyle}
      />
      {/* Folder body */}
      <div className="relative -mt-px rounded-xl rounded-tl-none p-5 border border-border bg-card group-hover:border-white/20 group-hover:bg-background-light transition-all duration-200">
        <div className="flex items-center gap-3 mb-4">
          {theme.logoUrl ? (
            <img
              src={theme.logoUrl}
              alt=""
              className="border-border bg-background-light size-9 shrink-0 rounded-lg border object-contain p-1"
            />
          ) : (
            <div className="border-border bg-background-light text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg border text-sm font-bold uppercase">
              {(theme.name || "?").charAt(0)}
            </div>
          )}

          <h3 className="font-bold text-lg text-foreground truncate">
            <span className="relative inline-block">
              {theme.name?.trim() || "Untitled theme"}
              <div
                className={`absolute bottom-0 left-0 h-[2px] w-full scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300${!theme.primaryColor ? " bg-gradient-primary" : ""}`}
                style={theme.primaryColor ? { background: theme.primaryColor } : undefined}
              />
            </span>
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {latest ? `Updated ${relativeTime(latest)}` : null}
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1" title="Photos">
              <ImageIcon className="w-4 h-4 text-white/60" />
              <span className="text-xs text-white/80">{photos}</span>
            </div>
            <div className="flex items-center gap-1" title="Videos">
              <Film className="w-4 h-4 text-white/60" />
              <span className="text-xs text-white/80">{videos}</span>
            </div>
            {generating > 0 && (
              <div
                className="flex items-center gap-1 text-primary"
                title="Generating"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs">{generating}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
