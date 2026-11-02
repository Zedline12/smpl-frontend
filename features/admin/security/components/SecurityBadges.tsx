import type { SecurityUser } from "../api";

const BADGES: { key: keyof SecurityUser; label: string; className: string }[] = [
  { key: "isThreat", label: "Threat", className: "bg-red-900/40 text-red-300" },
  { key: "isProxy", label: "Proxy", className: "bg-yellow-900/40 text-yellow-300" },
  { key: "isVpn", label: "VPN", className: "bg-purple-900/40 text-purple-300" },
  { key: "isDataCenter", label: "DC", className: "bg-blue-900/40 text-blue-300" },
  { key: "isSuspended", label: "Suspended", className: "bg-orange-900/40 text-orange-300" },
];

/** Threat/proxy/VPN/datacenter/suspended chips for a user. */
export function SecurityBadges({ user, showClean }: { user: SecurityUser; showClean?: boolean }) {
  const active = BADGES.filter((b) => user[b.key]);
  if (active.length === 0) {
    return showClean ? (
      <span className="rounded-full bg-emerald-900/30 px-1.5 text-emerald-300/90">Clean</span>
    ) : null;
  }
  return (
    <>
      {active.map((b) => (
        <span key={b.key} className={`rounded-full px-1.5 ${b.className}`}>
          {b.label}
        </span>
      ))}
    </>
  );
}

export function SuspendButton({
  suspended,
  disabled,
  onClick,
}: {
  suspended?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
        suspended
          ? "border-green-700/40 bg-green-900/20 text-green-300 hover:bg-green-900/40"
          : "border-red-700/40 bg-red-900/20 text-red-300 hover:bg-red-900/40"
      }`}
    >
      {suspended ? "Unsuspend" : "Suspend"}
    </button>
  );
}

export function ListSpinner() {
  return (
    <div className="flex justify-center py-10">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
    </div>
  );
}

export function SeeMoreButton({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  return (
    <div className="flex justify-center pt-2">
      <button
        onClick={onClick}
        disabled={loading}
        className="rounded-lg border border-neutral-700 bg-neutral-800/50 px-5 py-2 text-sm text-muted-foreground hover:border-neutral-500 hover:text-foreground transition-colors disabled:opacity-50"
      >
        {loading ? "Loading…" : "See more"}
      </button>
    </div>
  );
}
