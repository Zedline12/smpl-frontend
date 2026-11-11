"use client";

import { format, formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  Ban,
  CreditCard,
  LifeBuoy,
  RotateCcw,
  ShieldAlert,
  UserPlus,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { LEVEL_STYLES, type AdminNotification, type NotificationKind } from "../api";

const KIND_ICONS: Record<NotificationKind, LucideIcon> = {
  blocked_ip_attempt: Ban,
  threat_user: ShieldAlert,
  risky_user: AlertTriangle,
  new_subscriber: UserPlus,
  payment_received: CreditCard,
  subscription_canceled: XCircle,
  refund: RotateCcw,
  payment_disputed: AlertTriangle,
  payment_failed: CreditCard,
  support_ticket: LifeBuoy,
};

export function NotificationItem({
  notification: n,
  onClick,
  compact,
}: {
  notification: AdminNotification;
  onClick: () => void;
  compact?: boolean;
}) {
  const level = LEVEL_STYLES[n.level] ?? LEVEL_STYLES.ordinary;
  const Icon = KIND_ICONS[n.kind] ?? AlertTriangle;
  const unread = !n.readAt;
  const created = new Date(n.createdAt);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
        unread ? `${level.ring} bg-white/[0.04] hover:bg-white/[0.07]` : "border-transparent hover:bg-white/[0.04]"
      }`}
    >
      <span className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border ${level.chip}`}>
        <Icon className="h-4 w-4" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className={`truncate text-[13px] ${unread ? "font-semibold text-white" : "font-medium text-white/70"}`}>
            {n.title}
          </span>
          {unread && <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${level.dot}`} />}
        </span>
        <span className={`mt-0.5 block text-[12px] leading-snug text-white/50 ${compact ? "line-clamp-2" : ""}`}>
          {n.body}
        </span>
        <span className="mt-1 flex items-center gap-2 text-[11px] text-white/35">
          <span className={`rounded-full border px-1.5 py-px text-[10px] font-medium ${level.chip}`}>{level.label}</span>
          <time dateTime={n.createdAt} title={format(created, "PPpp")}>
            {compact ? formatDistanceToNow(created, { addSuffix: true }) : format(created, "p")}
          </time>
        </span>
      </span>
    </button>
  );
}
