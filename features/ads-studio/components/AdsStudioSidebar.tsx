"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  CircleUserRound,
  House,
  Images,
  Megaphone,
  Package,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const HOME: NavItem = { href: "/ads-studio", label: "Home", icon: House };
const ASSETS: NavItem[] = [
  { href: "/ads-studio/media", label: "All media", icon: Images },
  { href: "/ads-studio/brands", label: "Brands", icon: Palette },
  { href: "/ads-studio/products", label: "Products", icon: Package },
  { href: "/ads-studio/avatars", label: "Avatars", icon: CircleUserRound },
];

const COLLAPSED_KEY = "ads-studio:sidebar-collapsed";

const isActive = (pathname: string, href: string) =>
  href === HOME.href
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

function NavLink({
  item,
  collapsed,
  active,
}: {
  item: NavItem;
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

/** Ads Studio's own nav: a collapsible sidebar on desktop, a pill row on phones. */
export function AdsStudioSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [assetsOpen, setAssetsOpen] = useState(true);

  useEffect(() => {
    try {
      // Restore the saved choice after hydration (localStorage isn't available on the server).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollapsed(localStorage.getItem(COLLAPSED_KEY) === "1");
    } catch {
      /* storage blocked: keep it open */
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      try {
        localStorage.setItem(COLLAPSED_KEY, c ? "0" : "1");
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
        aria-label="Ads Studio"
        className="flex shrink-0 gap-1.5 overflow-x-auto [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden"
      >
        {[HOME, ...ASSETS].map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
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
        aria-label="Ads Studio"
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
            <Megaphone className="size-[18px]" strokeWidth={2} />
          </span>
          {!collapsed && (
            <span className="text-[15px] font-semibold text-white">
              Ads Studio
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
          item={HOME}
          collapsed={collapsed}
          active={isActive(pathname, HOME.href)}
        />

        {collapsed ? (
          <span className="mx-3 my-2 h-px bg-white/[0.06]" />
        ) : (
          <button
            type="button"
            onClick={() => setAssetsOpen((o) => !o)}
            aria-expanded={assetsOpen}
            className="mt-4 mb-1 flex items-center gap-1 px-3 text-xs font-medium text-white/45 hover:text-white/70"
          >
            Assets
            <ChevronDown
              className={cn(
                "size-3.5 transition-transform",
                !assetsOpen && "-rotate-90",
              )}
            />
          </button>
        )}
        {(assetsOpen || collapsed) &&
          ASSETS.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              active={isActive(pathname, item.href)}
            />
          ))}
      </aside>
    </>
  );
}
