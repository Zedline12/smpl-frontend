import { fetchWithToken } from "@/lib/fetcher";
import { AdminUserDetail } from "@/features/admin/users/types/types";
import { MediaGrid } from "@/features/media/components/MediaGrid";
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-900/40 text-green-300 border border-green-700/40",
  past_due: "bg-yellow-900/40 text-yellow-300 border border-yellow-700/40",
  canceled: "bg-red-900/40 text-red-300 border border-red-700/40",
};

function formatPrice(cents: number | null): string {
  if (!cents) return "—";
  return `$${(cents / 100).toFixed(2)}`;
}

function formatName(u: AdminUserDetail): string {
  const name = [u.firstName, u.lastName].filter(Boolean).join(" ");
  return name || u.email;
}

const STAT_CARDS = [
  {
    key: "totalGenerations" as const,
    label: "Total Generations",
    color: "text-foreground",
    bg: "bg-neutral-800/50",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
        <path d="M12 3v4M12 17v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M3 12h4M17 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "successJobs" as const,
    label: "Successful",
    color: "text-green-400",
    bg: "bg-green-900/20",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "processingJobs" as const,
    label: "Processing",
    color: "text-yellow-400",
    bg: "bg-yellow-900/20",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "failureJobs" as const,
    label: "Failed",
    color: "text-red-400",
    bg: "bg-red-900/20",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const res = await fetchWithToken(`/admin/users/${id}`);
  if (!res.ok) notFound();
  const json = await res.json();
  const user: AdminUserDetail & {stats: Record<string, number>} = json.data;
   console.log(user)
  const status = user.subscriptionStatus;
  const statusStyle = status
    ? (STATUS_STYLES[status] ?? "bg-neutral-800 text-neutral-400 border border-neutral-700")
    : "bg-neutral-800 text-neutral-400 border border-neutral-700";

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{formatName(user)}</h1>
          <p className="text-muted-foreground text-sm">{user.email}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize", statusStyle)}>
              {status ?? "No subscription"}
            </span>
            {user.subscriptionPlanName && (
              <span className="text-sm text-muted-foreground">
                {user.subscriptionPlanName} · {formatPrice(user.subscriptionPlanPriceAmount)}
              </span>
            )}
          </div>
        </div>

        {/* Credits card */}
        <div className="flex-shrink-0 rounded-xl border border-white/10 bg-neutral-800/50 px-6 py-4 text-center min-w-[140px]">
          <p className="text-3xl font-bold tabular-nums">{user.creditsBalance.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Credits</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ key, label, color, bg, icon }) => (
          <div key={key} className={cn("rounded-xl border border-white/10 px-5 py-4 flex items-center gap-4", bg)}>
            <span className={color}>{icon}</span>
            <div>
              <p className={cn("text-2xl font-bold tabular-nums", color)}>
                {user.stats[key].toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Invoices */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold">Billing &amp; Invoices</h2>
        {user.invoices.length === 0 ? (
          <div
            className="rounded-xl border px-6 py-10 text-center"
            style={{ borderColor: "rgba(255,255,255,0.07)", background: "oklch(0.13 0 0)" }}
          >
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
              No invoices yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {user.invoices.map((invoice) => (
              <div
                key={invoice.invoiceId}
                className="flex items-center justify-between rounded-xl border px-5 py-4"
                style={{ borderColor: "rgba(255,255,255,0.07)", background: "oklch(0.13 0 0)" }}
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-sm font-medium truncate" style={{ color: "rgba(255,255,255,0.85)" }}>
                    {invoice.subscriptionName} — {invoice.month}
                  </span>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {invoice.date}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span className="text-sm font-semibold tabular-nums" style={{ color: "rgba(255,255,255,0.9)" }}>
                    {invoice.amount}
                  </span>
                  <a
                    href={`/api/invoices/${invoice.invoiceId}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-150 hover:bg-white/10 hover:border-white/20"
                    style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}
                    title="Download invoice"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                      <path d="M12 3v13M7 11l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M5 21h14" strokeLinecap="round" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Media */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold">Media</h2>
        <MediaGrid
          media={user.media}
          layout="grid"
          imagesWidth={200}
          aspectRatio="16:9"
        />
      </section>
    </div>
  );
}
