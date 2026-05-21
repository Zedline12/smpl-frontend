import { fetchWithToken } from "@/lib/fetcher";
import { ReferralLinkCard } from "./_components/ReferralLinkCard";

interface ReferralData {
  link: string;
  totalCreditsGranted: number;
  totalUsersSignedUp: number;
}

async function getReferral(): Promise<ReferralData | null> {
  try {
    const res = await fetchWithToken("/referral/me");
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div
      className="flex flex-col gap-1 rounded-xl px-5 py-4 border"
      style={{ background: "oklch(0.13 0 0)", borderColor: "rgba(255,255,255,0.07)" }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span style={{ color: "rgba(255,255,255,0.3)" }}>{icon}</span>
        <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
          {label}
        </span>
      </div>
      <span className="text-3xl font-bold text-white tracking-tight tabular-nums">{value.toLocaleString()}</span>
    </div>
  );
}

export default async function ReferralsPage() {
  const referral = await getReferral();

  if (!referral) {
    return (
      <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
        Failed to load referral data.
      </p>
    );
  }

  return (
    <div className="max-w-lg flex flex-col gap-6">
      <div>
        <h2 className="text-white font-semibold text-base leading-tight">Referrals</h2>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          Share your link and earn credits when friends sign up.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Users signed up"
          value={referral.totalUsersSignedUp}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
            </svg>
          }
        />
        <StatCard
          label="Credits earned"
          value={referral.totalCreditsGranted}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
              <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clipRule="evenodd" fill="currentColor" stroke="none" />
            </svg>
          }
        />
      </div>

      {/* Referral link */}
      <ReferralLinkCard link={referral.link} />
    </div>
  );
}
