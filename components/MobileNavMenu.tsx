"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Dialog as DialogPrimitive } from "radix-ui";
import { ChevronDown, Gem, Images, LogOut, Menu, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { isFreePlan } from "@/lib/subscription";
import type { Model } from "@/features/generation/enums/models.enum";
import type { GenerationTypeEnum } from "@/features/generation/types/generation";
import { MEDIA_TYPES } from "@/features/generation/components/navbar/MediaTypeLauncher";
import { ModelRow } from "@/features/generation/components/ModelRow";
import { useAiGenerationControlStore } from "@/stores/useAiGenerationControlStore";
import { SearchDialog } from "@/features/search/components/SearchDialog";
import { STUDIOS } from "@/components/StudioLinks";
import { NAV_ROWS } from "@/components/AccountMenuPanel";
import { CreditsPill } from "@/components/NavbarUserMenu";
import { useChatStore } from "@/stores/useChatStore";

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
  const pathname = usePathname();
  const setMediaType = useAiGenerationControlStore((s) => s.setMediaType);
  const setModel = useAiGenerationControlStore((s) => s.setModel);
  const [expanded, setExpanded] = useState<GenerationTypeEnum | null>(null);
  const openChat = useChatStore((s) => s.open);

  // Close on any navigation the sheet didn't start itself (back/forward).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (open) onOpenChange(false);
  }

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
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/onboard");
      router.refresh();
    } catch (error) {
      console.error("Logout failed", error);
    }
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
          <div className="flex shrink-0 items-center justify-between px-4 pt-4 pb-2">
            <DialogPrimitive.Title className="text-base font-semibold">Menu</DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label="Close menu"
              className="flex size-9 items-center justify-center rounded-full bg-white/[0.06]"
            >
              <X className="size-4" />
            </DialogPrimitive.Close>
          </div>

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
                        {type.models.map((model) => (
                          <ModelRow
                            key={model.id}
                            model={model}
                            asButton
                            compact
                            onSelect={() => pickModel(type.value, model)}
                          />
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
              {STUDIOS.map((studio) => (
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
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
