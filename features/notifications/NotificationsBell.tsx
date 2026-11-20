"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Ban,
  Bell,
  CreditCard,
  Loader2,
  RotateCcw,
  Sparkles,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserNotification, useNotifications } from "./use-notifications";

const CLOSE_DELAY = 120;

function iconFor(n: UserNotification): { Icon: LucideIcon; className: string } {
  if (n.type === "generation_done") return { Icon: Sparkles, className: "text-primary" };
  if (n.type === "generation_failed" || n.type === "subscription_payment_failed")
    return { Icon: XCircle, className: "text-red-400" };
  if (n.type.includes("refund")) return { Icon: RotateCcw, className: "text-amber-400" };
  if (n.type === "subscription_cancel_scheduled" || n.type === "subscription_ended")
    return { Icon: Ban, className: "text-white/60" };
  return { Icon: CreditCard, className: "text-emerald-400" };
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fullDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function NotificationRow({ n, onNavigate }: { n: UserNotification; onNavigate: () => void }) {
  const { Icon, className } = iconFor(n);
  const body = (
    <div className="flex gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.05]">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
        <Icon className={cn("size-3.5", className)} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-white">{n.title}</p>
          <time
            dateTime={n.createdAt}
            title={fullDate(n.createdAt)}
            className="shrink-0 text-[10px] text-white/40"
          >
            {relativeTime(n.createdAt)}
          </time>
        </div>
        {n.detail && <p className="mt-0.5 truncate text-[11px] text-white/50">{n.detail}</p>}
      </div>
    </div>
  );
  return n.href ? (
    <Link href={n.href} onClick={onNavigate} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}

/** The rows, or the loading / error / empty state (the bell's panel and the phone menu). */
export function NotificationsList({
  notifications,
  isLoading,
  isError,
  onNavigate,
}: {
  notifications: UserNotification[];
  isLoading: boolean;
  isError: boolean;
  onNavigate: () => void;
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="size-4 animate-spin text-white/50" />
      </div>
    );
  }
  if (isError) {
    return <p className="px-3 py-8 text-center text-xs text-white/45">Couldn&apos;t load notifications.</p>;
  }
  if (notifications.length === 0) {
    return (
      <p className="px-3 py-8 text-center text-xs text-white/45">
        No notifications yet. Your generations and payments will show up here.
      </p>
    );
  }
  return (
    <>
      {notifications.map((n) => (
        <NotificationRow key={n.id} n={n} onNavigate={onNavigate} />
      ))}
    </>
  );
}

/** Navbar bell: generation and payment notifications, opened on hover or click. */
export function NotificationsBell() {
  const pathname = usePathname();
  const { notifications, unreadCount, isLoading, isError, markSeen } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const open = () => {
    clearCloseTimer();
    setIsOpen(true);
  };
  const close = () => {
    clearCloseTimer();
    setIsOpen(false);
  };
  const scheduleClose = () => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setIsOpen(false), CLOSE_DELAY);
  };

  useEffect(() => clearCloseTimer, []);
  useEffect(() => close(), [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  // Opening the panel reads everything in it.
  useEffect(() => {
    if (isOpen && unreadCount > 0) markSeen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, unreadCount]);

  return (
    <div className="relative" onMouseEnter={open} onMouseLeave={scheduleClose}>
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={cn(
          "relative flex cursor-pointer items-center transition-colors",
          isOpen ? "text-foreground" : "text-foreground/55 hover:text-foreground",
        )}
      >
        <Bell className="size-5" strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="bg-primary absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] leading-none font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="border-border bg-popover absolute top-full right-0 z-50 mt-2 w-80 rounded-2xl border p-1.5 shadow-lg"
        >
          <div className="flex items-center justify-between px-3 pt-1.5 pb-2">
            <p className="text-sm font-semibold text-white">Notifications</p>
            <button
              type="button"
              onClick={close}
              aria-label="Close notifications"
              className="flex size-6 cursor-pointer items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="bg-border -mx-1.5 h-px" />
          <div className="max-h-[420px] overflow-y-auto py-1">
            <NotificationsList
              notifications={notifications}
              isLoading={isLoading}
              isError={isError}
              onNavigate={close}
            />
          </div>
        </div>
      )}
    </div>
  );
}
