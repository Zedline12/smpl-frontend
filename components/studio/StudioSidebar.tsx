"use client";
import { useEffect, useState, type ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** A Lucide icon, or any icon that takes a className (e.g. a platform logo). */
export type StudioNavIcon = ComponentType<{
  className?: string;
  strokeWidth?: number;
}>;

export interface StudioNavItem {
  href: string;
  label: string;
  icon: StudioNavIcon;
}

export interface StudioNavSection {
  label: string;
  items: StudioNavItem[];
}

const isActive = (pathname: string, href: string, homeHref: string) =>
  href === homeHref
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

function NavLink({
  item,
  collapsed,
  active,
}: {
  item: StudioNavItem;
  collapsed: boolean;
  active: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
        collapsed && "justify-center px-0",
        active
          ? "bg-white/[0.07] text-white"
          : "text-white/60 hover:bg-white/[0.04] hover:text-white",
      )}
    >
      <Icon className="size-[18px] shrink-0" strokeWidth={1.75} />
      {!collapsed && item.label}
    </Link>
  );
}

function Section({
  section,
  collapsed,
  pathname,
  homeHref,
}: {
  section: StudioNavSection;
  collapsed: boolean;
  pathname: string;
  homeHref: string;
}) {
  const [open, setOpen] = useState(true);
  return (
    <>
      {collapsed ? (
        <span className="mx-3 my-2 h-px bg-white/[0.06]" />
      ) : (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="mt-4 mb-1 flex items-center gap-1 px-3 text-xs font-medium text-white/45 hover:text-white/70"
        >
          {section.label}
          <ChevronDown
            className={cn(
              "size-3.5 transition-transform",
              !open && "-rotate-90",
            )}
          />
        </button>
      )}
      {(open || collapsed) &&
        section.items.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            collapsed={collapsed}
            active={isActive(pathname, item.href, homeHref)}
          />
        ))}
    </>
  );
}

/**
 * A studio's own nav (Ads Studio, Video Analyzer): a collapsible sidebar on desktop,
 * a pill row on phones. The collapsed choice is remembered per studio.
 */
export function StudioSidebar({
  title,
  icon: TitleIcon,
  home,
  sections,
  storageKey,
}: {
  title: string;
  icon: LucideIcon;
  home: StudioNavItem;
  sections: StudioNavSection[];
  storageKey: string;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      // Restore the saved choice after hydration (localStorage isn't available on the server).
      setCollapsed(localStorage.getItem(storageKey) === "1");
    } catch {
      /* storage blocked: keep it open */
    }
  }, [storageKey]);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      try {
        localStorage.setItem(storageKey, c ? "0" : "1");
      } catch {
        /* storage blocked */
      }
      return !c;
    });
  };

  return (
    <>
      {/* Phones: one scrolling row of pills. */}
      <nav
        aria-label={title}
        className="flex shrink-0 gap-1.5 overflow-x-auto [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden"
      >
        {[home, ...sections.flatMap((s) => s.items)].map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href, home.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors",
                active
                  ? "border-white bg-white text-black"
                  : "border-white/10 text-white/70",
              )}
            >
              <Icon className="size-4" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Desktop */}
      <aside
        aria-label={title}
        className={cn(
          "hidden shrink-0 flex-col gap-1 transition-[width] duration-200 md:flex",
          collapsed ? "w-14" : "w-56",
        )}
      >
        <div
          className={cn(
            "mb-3 flex items-center gap-2 px-2 pt-1",
            collapsed && "flex-col",
          )}
        >
          <span className="bg-primary/20 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
            <TitleIcon className="size-[18px]" strokeWidth={2} />
          </span>
          {!collapsed && (
            <span className="text-[15px] font-semibold text-white">
              {title}
            </span>
          )}
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex size-8 items-center justify-center rounded-lg text-white/45 transition-colors hover:bg-white/[0.05] hover:text-white",
              !collapsed && "ml-auto",
            )}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </button>
        </div>

        <NavLink
          item={home}
          collapsed={collapsed}
          active={isActive(pathname, home.href, home.href)}
        />

        {sections.map((section) => (
          <Section
            key={section.label}
            section={section}
            collapsed={collapsed}
            pathname={pathname}
            homeHref={home.href}
          />
        ))}
      </aside>
    </>
  );
}

/** The content panel next to a studio's sidebar, under the navbar. */
export const STUDIO_PANEL_CLASS =
  "tw-fields custom-scrollbar min-h-0 min-w-0 flex-1 overflow-y-auto rounded-2xl border border-white/[0.06] bg-white/[0.02]";
