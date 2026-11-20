"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Bell, ChevronDown, ChevronLeft, Folder, Gem, Images, LogOut, Menu, Search, X } from "lucide-react";
import { useNotifications } from "@/features/notifications/use-notifications";
import { NotificationsList } from "@/features/notifications/NotificationsBell";
import { cn } from "@/lib/utils";
import { isFreePlan } from "@/lib/subscription";
import type { Model } from "@/features/generation/enums/models.enum";
import type { GenerationTypeEnum } from "@/features/generation/types/generation";
import { MEDIA_TYPES } from "@/features/generation/components/navbar/MediaTypeLauncher";
import { ModelRow } from "@/features/generation/components/ModelRow";
import { useAiGenerationControlStore } from "@/stores/useAiGenerationControlStore";
import { SearchDialog } from "@/features/search/components/SearchDialog";
import { useStudioLinks } from "@/components/StudioLinks";
import { useCatalog } from "@/features/catalog/catalog";
import { NAV_ROWS } from "@/components/AccountMenuPanel";
import { CreditsPill } from "@/components/NavbarUserMenu";
import { useChatStore } from "@/stores/useChatStore";
import { useSignOut } from "@/features/auth/hooks/use-sign-out";

const SECTION_TITLE = "px-2 pb-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase";
const ROW = "flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.05]";

/**
 * The navbar on phones: Pricing (free plans), the credits/plan pill, and a menu button opening
 * everything the desktop navbar has (models, studios, search, assets, account).
 */
export function MobileNavActions({ user }: { user: any }) {
  const free = isFreePlan(user);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 sm:hidden">
      {free && (
        <Link
          href="/pricing"
          className="flex items-center gap-1 rounded-full bg-foreground/10 px-2.5 py-1.5 text-xs font-semibold text-foreground/85"
        >
          <Gem className="size-3.5" /> Pricing
        </Link>
      )}
      <CreditsPill user={user} className="block min-w-0" compact />
      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        aria-label="Open menu"
        aria-haspopup="dialog"
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground/[0.06] text-foreground/80"
      >
        <Menu className="size-5" />
      </button>

      <MobileNavSheet
        open={menuOpen}
        onOpenChange={setMenuOpen}
        user={user}
        onSearch={() => {
          setMenuOpen(false);
          setSearchOpen(true);
        }}
      />
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}

function MobileNavSheet({
  open,
  onOpenChange,
  user,
  onSearch,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  onSearch: () => void;
}) {
  const router = useRouter();
  const signOutAndLeave = useSignOut();
  const pathname = usePathname();
  const setMediaType = useAiGenerationControlStore((s) => s.setMediaType);
  const setModel = useAiGenerationControlStore((s) => s.setModel);
  const [expanded, setExpanded] = useState<GenerationTypeEnum | null>(null);
  const openChat = useChatStore((s) => s.open);
  const { withCatalog, groupByKind } = useCatalog();
  const studios = useStudioLinks();
  // The sheet's two views: the menu, or the notifications list (from the bell in its header).
  const [view, setView] = useState<"menu" | "notifications">("menu");
  const { notifications, unreadCount, isLoading, isError, markSeen } = useNotifications(!!user);

  // Close on any navigation the sheet didn't start itself (back/forward).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (open) onOpenChange(false);
  }

  // Every opening starts on the menu.
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) setView("menu");
  }

  const showNotifications = () => {
    setView("notifications");
    if (unreadCount > 0) markSeen();
  };

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  const pickModel = (type: GenerationTypeEnum, model: Model) => {
    // Order matters: setMediaType resets the model to that type's default.
    setMediaType(type);
    setModel(model.id);
    go(`/create/${type}?model=${encodeURIComponent(model.id)}`);
  };

  const signOut = async () => {
    onOpenChange(false);
    await signOutAndLeave();
  };

  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="data-[state=open]:animate-in data-[state=open]:slide-in-from-right-8 fixed inset-y-0 right-0 z-[100] flex w-[min(360px,88vw)] flex-col border-l border-white/10 bg-popover text-foreground shadow-2xl outline-none"
        >
          <div className="flex shrink-0 items-center gap-2 px-4 pt-4 pb-2">
            {view === "notifications" && (
              <button
                type="button"
                onClick={() => setView("menu")}
                aria-label="Back to menu"
                className="-ml-1 flex size-9 items-center justify-center rounded-full text-foreground/70 hover:bg-white/[0.06]"
              >
                <ChevronLeft className="size-5" />
              </button>
            )}
            <DialogPrimitive.Title className="flex-1 text-base font-semibold">
              {view === "notifications" ? "Notifications" : "Menu"}
            </DialogPrimitive.Title>

            {/* Bell · assets, like the desktop navbar's group */}
            {user && view === "menu" && (
              <>
                <button
                  type="button"
                  onClick={showNotifications}
                  aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"}
                  className="relative flex size-9 items-center justify-center rounded-full bg-white/[0.06] text-foreground/80"
                >
                  <Bell className="size-[18px]" strokeWidth={1.75} />
                  {unreadCount > 0 && (
                    <span className="bg-primary absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] leading-none font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => go("/assets")}
                  aria-label="Assets"
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full bg-white/[0.06]",
                    isCurrent("/assets") ? "text-[var(--purple-300)]" : "text-foreground/80",
                  )}
                >
                  <Folder className="size-[18px]" strokeWidth={1.75} />
                </button>
              </>
            )}

            <DialogPrimitive.Close
              aria-label="Close menu"
              className="flex size-9 items-center justify-center rounded-full bg-white/[0.06]"
            >
              <X className="size-4" />
            </DialogPrimitive.Close>
          </div>

          {view === "notifications" ? (
            <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-1.5 pb-[max(16px,env(safe-area-inset-bottom))]">
              <NotificationsList
                notifications={notifications}
                isLoading={isLoading}
                isError={isError}
                onNavigate={() => onOpenChange(false)}
              />
            </div>
          ) : (
          <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-3 pb-[max(16px,env(safe-area-inset-bottom))]">
            {/* Search */}
            <button
              type="button"
              onClick={onSearch}
              className="mb-4 flex h-11 w-full items-center gap-3 rounded-full bg-white/[0.06] px-4 text-sm text-foreground/50"
            >
              <Search className="size-4" /> Search models, pages, settings…
            </button>

            {/* The floating chat button is hidden on phones; the assistant opens from here. */}
            {user && (
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  openChat();
                }}
                className={cn(ROW, "mb-4 border border-white/10")}
              >
                <Image src="/robot.png" alt="" width={20} height={20} className="size-5 object-contain" />
                <span className="flex-1 text-left">AI assistant</span>
              </button>
            )}

            {/* Create: each type expands to its models */}
            <p className={SECTION_TITLE}>Create</p>
            <div className="mb-4 flex flex-col">
              {MEDIA_TYPES.map((type) => {
                const isOpen = expanded === type.value;
                return (
                  <div key={type.value}>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => {
                          setMediaType(type.value);
                          go(`/create/${type.value}`);
                        }}
                        className={cn(ROW, "flex-1", isCurrent(`/create/${type.value}`) && "text-[var(--purple-300)]")}
                      >
                        {type.label}
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : type.value)}
                        aria-expanded={isOpen}
                        aria-label={`${type.label} models`}
                        className="flex size-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-white/[0.05]"
                      >
                        <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} />
                      </button>
                    </div>
                    {isOpen && (
                      <div className="mb-1 ml-2 flex flex-col gap-0.5 border-l border-white/10 pl-2">
                        {groupByKind(withCatalog(type.models)).map((section) => (
                          <div key={section.kind} className="flex flex-col gap-0.5">
                            <p className="px-2 pt-1.5 pb-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                              {section.label}
                            </p>
                            {section.items.map((model) => (
                              <ModelRow
                                key={model.id}
                                model={model}
                                asButton
                                compact
                                onSelect={() => pickModel(type.value, model)}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Studios */}
            <p className={SECTION_TITLE}>Studios</p>
            <div className="mb-4 flex flex-col">
              {studios.map((studio) => (
                <button
                  key={studio.href}
                  type="button"
                  onClick={() => go(studio.href)}
                  className={cn(ROW, isCurrent(studio.href) && "text-[var(--purple-300)]")}
                >
                  <span className="flex-1 text-left">{studio.label}</span>
                  {studio.isNew && (
                    <span className="rounded-full bg-secondary/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-secondary uppercase">
                      New
                    </span>
                  )}
                </button>
              ))}
            </div>

            {user && (
              <>
                <p className={SECTION_TITLE}>You</p>
                <div className="mb-4 flex flex-col">
                  <button type="button" onClick={() => go("/assets")} className={ROW}>
                    <Images className="size-4 text-muted-foreground" /> Assets
                  </button>
                  {NAV_ROWS.map((row) => {
                    const Icon = row.icon;
                    return (
                      <button key={row.href} type="button" onClick={() => go(row.href)} className={ROW}>
                        <Icon className="size-4 text-muted-foreground" />
                        <span className="flex-1 text-left">{row.label}</span>
                      </button>
                    );
                  })}
                  <button type="button" onClick={signOut} className={cn(ROW, "text-red-500 hover:bg-red-500/10")}>
                    <LogOut className="size-4" /> Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
