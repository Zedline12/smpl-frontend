"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog as DialogPrimitive } from "radix-ui";
import { ArrowUpRight, LayoutGrid, Search, Settings, Sparkles, Wand2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AiModelsEnum } from "@/features/generation/enums/models.enum";
import { useAiGenerationControlStore } from "@/stores/useAiGenerationControlStore";
import { useCatalog } from "@/features/catalog/catalog";
import {
  KIND_LABELS,
  POPULAR,
  SEARCH_ITEMS,
  SearchItem,
  SearchKind,
  TRENDING,
  readRecents,
  rememberRecent,
  searchItems,
  withCatalogNames,
} from "@/features/search/search-index";

type Tab = "all" | SearchKind;

const TABS: { value: Tab; label: string; icon?: typeof Sparkles }[] = [
  { value: "all", label: "All" },
  { value: "model", label: "Models", icon: Sparkles },
  { value: "page", label: "Pages", icon: LayoutGrid },
  { value: "feature", label: "Features", icon: Wand2 },
  { value: "setting", label: "Settings", icon: Settings },
];

const KIND_ORDER: SearchKind[] = ["model", "page", "feature", "setting"];

interface Section {
  title: string;
  items: SearchItem[];
  layout: "list" | "grid" | "cards";
  /** Shown at the right of the section title. */
  seeAll?: Tab;
}

const optionId = (index: number) => `search-option-${index}`;

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** The navbar's search: models, pages, features and settings in one dialog. */
export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="tw-fields bg-popover/90 text-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[max(16px,12vh)] left-1/2 z-[100] flex max-h-[min(78vh,calc(100dvh-32px))] w-[min(760px,calc(100vw-24px))] -translate-x-1/2 flex-col overflow-hidden rounded-[28px] border border-white/10 shadow-2xl backdrop-blur-xl outline-none"
        >
          <DialogPrimitive.Title className="sr-only">Search</DialogPrimitive.Title>
          {/* Content unmounts when closed, so each open starts fresh (query, recents). */}
          <SearchBody onClose={() => onOpenChange(false)} />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function SearchBody({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const setMediaType = useAiGenerationControlStore((s) => s.setMediaType);
  const setModel = useAiGenerationControlStore((s) => s.setModel);

  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [active, setActive] = useState(-1);
  const [recents] = useState(readRecents);
  const listRef = useRef<HTMLDivElement>(null);

  const trimmed = query.trim();

  // Current names; models and studios an admin turned off are left out.
  const { version: catalogVersion } = useCatalog();
  const [allItems, trending, popular] = useMemo(
    () => [withCatalogNames(SEARCH_ITEMS), withCatalogNames(TRENDING), withCatalogNames(POPULAR.map((p) => p.item))],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [catalogVersion],
  );

  const sections = useMemo<Section[]>(() => {
    const kinds = tab === "all" ? KIND_ORDER : [tab];
    if (trimmed) {
      return kinds
        .map((kind) => ({
          title: KIND_LABELS[kind],
          items: searchItems(allItems.filter((i) => i.kind === kind), trimmed),
          layout: "list" as const,
        }))
        .filter((s) => s.items.length);
    }
    if (tab !== "all") {
      return [{ title: KIND_LABELS[tab], items: allItems.filter((i) => i.kind === tab), layout: "list" }];
    }
    const browse: Section[] = [];
    if (recents.length) browse.push({ title: "Recents", items: recents, layout: "list" });
    browse.push({ title: "Popular", items: popular, layout: "cards", seeAll: "page" });
    browse.push({ title: "Trending", items: trending, layout: "grid" });
    return browse;
  }, [tab, trimmed, recents, allItems, trending, popular]);

  // Every option in display order: what the arrow keys walk through.
  const options = useMemo(() => sections.flatMap((s) => s.items), [sections]);
  // Where each section starts in `options`.
  const starts = useMemo(
    () => sections.map((_, i) => sections.slice(0, i).reduce((n, s) => n + s.items.length, 0)),
    [sections],
  );

  const reset = (hasQuery: boolean) => setActive(hasQuery ? 0 : -1);

  const openItem = (item: SearchItem) => {
    rememberRecent(item.id);
    if (item.mediaType && item.modelId) {
      // Order matters: setMediaType resets the model to that type's default.
      setMediaType(item.mediaType);
      setModel(item.modelId as AiModelsEnum);
    }
    onClose();
    router.push(item.href);
  };

  const moveTo = (index: number) => {
    setActive(index);
    requestAnimationFrame(() =>
      listRef.current?.querySelector(`#${optionId(index)}`)?.scrollIntoView({ block: "nearest" }),
    );
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!options.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveTo(active < options.length - 1 ? active + 1 : 0);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveTo(active > 0 ? active - 1 : options.length - 1);
    } else if (e.key === "Enter" && options[active]) {
      e.preventDefault();
      openItem(options[active]);
    }
  };

  return (
    <>
      {/* Search field + close */}
      <div className="flex shrink-0 items-center gap-2 p-3 pb-2">
        <label className="bg-foreground/[0.06] focus-within:bg-foreground/[0.09] flex h-12 min-w-0 flex-1 items-center gap-3 rounded-full px-4 transition-colors">
          <Search className="text-foreground/50 size-5 shrink-0" strokeWidth={1.75} />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              reset(!!e.target.value.trim());
            }}
            onKeyDown={onKeyDown}
            placeholder="Search"
            aria-label="Search models, pages, features and settings"
            role="combobox"
            aria-expanded
            aria-controls="search-results"
            aria-activedescendant={active >= 0 ? optionId(active) : undefined}
            className="placeholder:text-foreground/40 min-w-0 flex-1 bg-transparent text-base outline-none"
          />
        </label>
        <DialogPrimitive.Close
          aria-label="Close search"
          className="bg-foreground/[0.06] hover:bg-foreground/[0.12] flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors"
        >
          <X className="size-5" strokeWidth={2} />
        </DialogPrimitive.Close>
      </div>

      {/* Filter chips */}
      <div className="flex shrink-0 gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setTab(value);
              reset(!!trimmed);
            }}
            aria-pressed={tab === value}
            className={cn(
              "flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              tab === value
                ? "bg-foreground/10 text-foreground border-transparent"
                : "text-foreground/75 hover:bg-foreground/[0.05] border-foreground/10",
            )}
          >
            {Icon && <Icon className="size-3.5" strokeWidth={2} />}
            {label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div
        ref={listRef}
        id="search-results"
        role="listbox"
        aria-label="Search results"
        className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-4"
      >
        {sections.length === 0 && (
          <p className="text-foreground/50 px-2 py-10 text-center text-sm">
            No results for &ldquo;{trimmed}&rdquo;
          </p>
        )}

        {sections.map((section, sectionIndex) => {
          const start = starts[sectionIndex];
          const seeAll = section.seeAll;
          return (
            <section key={section.title} className="mt-3 first:mt-1">
              <div className="mb-1.5 flex items-center justify-between px-1">
                <h3 className="text-foreground/55 text-xs font-medium">{section.title}</h3>
                {seeAll && (
                  <button
                    type="button"
                    onClick={() => setTab(seeAll)}
                    className="text-foreground cursor-pointer text-xs font-semibold hover:underline"
                  >
                    See all
                  </button>
                )}
              </div>

              {section.layout === "cards" ? (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {section.items.map((item, i) => {
                    const card = POPULAR.find((p) => p.item.id === item.id)!;
                    return (
                    <PopularCardButton
                      key={item.id}
                      index={start + i}
                      label={card.label}
                      gradient={card.gradient}
                      item={item}
                      active={active === start + i}
                      onHover={setActive}
                      onOpen={openItem}
                    />
                    );
                  })}
                </div>
              ) : (
                <div className={cn("grid gap-0.5", section.layout === "grid" && "sm:grid-cols-2 sm:gap-x-3")}>
                  {section.items.map((item, i) => (
                    <ResultRow
                      key={item.id}
                      index={start + i}
                      item={item}
                      active={active === start + i}
                      onHover={setActive}
                      onOpen={openItem}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}

interface OptionProps {
  item: SearchItem;
  index: number;
  active: boolean;
  onHover: (index: number) => void;
  onOpen: (item: SearchItem) => void;
}

function Badge({ kind }: { kind: NonNullable<SearchItem["badge"]> }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-[5px] px-1.5 py-px text-[10px] font-extrabold tracking-wide uppercase italic",
        kind === "new" ? "bg-[var(--purple-300)] text-[#140a2e]" : "bg-secondary text-white",
      )}
    >
      {kind}
    </span>
  );
}

function ResultRow({ item, index, active, onHover, onOpen }: OptionProps) {
  return (
    <button
      type="button"
      id={optionId(index)}
      role="option"
      aria-selected={active}
      tabIndex={-1}
      onMouseMove={() => !active && onHover(index)}
      onClick={() => onOpen(item)}
      className={cn(
        "flex w-full min-w-0 cursor-pointer items-center gap-3 rounded-xl p-2 text-left transition-colors",
        active && "bg-foreground/[0.07]",
      )}
    >
      <span className="bg-foreground/[0.06] text-foreground flex size-10 shrink-0 items-center justify-center rounded-xl text-lg [&_svg]:max-h-5 [&_svg]:max-w-5">
        {item.icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-semibold">{item.title}</span>
          {item.badge && <Badge kind={item.badge} />}
        </span>
        <span className="text-foreground/50 block truncate text-xs">{item.subtitle}</span>
      </span>
    </button>
  );
}

function PopularCardButton({
  item,
  index,
  active,
  onHover,
  onOpen,
  label,
  gradient,
}: OptionProps & { label: string; gradient: string }) {
  return (
    <button
      type="button"
      id={optionId(index)}
      role="option"
      aria-selected={active}
      tabIndex={-1}
      onMouseMove={() => !active && onHover(index)}
      onClick={() => onOpen(item)}
      style={{ background: gradient }}
      className={cn(
        "relative flex h-[104px] min-w-0 cursor-pointer flex-col justify-end overflow-hidden rounded-2xl border border-white/10 p-3 text-left text-white transition-[box-shadow,filter]",
        active && "ring-2 ring-white/50 brightness-110",
      )}
    >
      <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-black/30 px-2 py-0.5 text-[11px] font-medium text-white/85 backdrop-blur [&_svg]:size-3">
        {item.icon}
        {label}
      </span>
      {item.badge && (
        <span className="absolute top-3 right-3">
          <Badge kind={item.badge} />
        </span>
      )}
      <span
        className="flex items-center gap-1 text-[15px] leading-tight font-extrabold tracking-tight uppercase"
        style={{ fontFamily: "var(--font-display)" }}
      >
        <span className="truncate">{item.title}</span>
        <ArrowUpRight className="size-3.5 shrink-0" strokeWidth={2.5} />
      </span>
      <span className="mt-0.5 truncate text-xs text-white/70">{item.subtitle}</span>
    </button>
  );
}
