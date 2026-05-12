import { fetchWithToken } from "@/lib/fetcher";
import { DeleteAccountDialog } from "./_components/DeleteAccountDialog";

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  totalGenerations: number;
  totalCreditsUsed: number;
}

async function getMe(): Promise<UserData | null> {
  try {
    const res = await fetchWithToken("/users/me?include=stats");
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric", day: "numeric" });
}

function formatMemberSince(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      className="flex flex-col gap-1 rounded-xl px-5 py-4 border"
      style={{ background: "oklch(0.13 0 0)", borderColor: "rgba(255,255,255,0.07)" }}
    >
      <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
        {label}
      </span>
      <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
    </div>
  );
}

export default async function AccountPage() {
  const user = await getMe();

  if (!user) {
    return (
      <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
        Failed to load account data.
      </p>
    );
  }

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  return (
    <div className="max-w-lg flex flex-col gap-6">

      {/* Profile card */}
      <div
        className="rounded-2xl border p-6"
        style={{ background: "oklch(0.13 0 0)", borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #6b41ff, #ea4bff)" }}
          >
            {initials}
          </div>

          <div className="min-w-0">
            <p className="text-white font-semibold text-base leading-tight">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-sm mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.45)" }}>
              {user.email}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5">
              {user.emailVerified ? (
                <span
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Verified
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}
                >
                  Unverified
                </span>
              )}
              <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                Member since {formatMemberSince(user.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Generations" value={user.totalGenerations} />
        <Stat label="Credits used" value={user.totalCreditsUsed} />
        <Stat label="Member since" value={formatMemberSince(user.createdAt)} />
      </div>

      {/* Danger zone */}
      <div
        className="rounded-2xl border p-5"
        style={{ borderColor: "rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.04)" }}
      >
        <p className="text-sm font-semibold mb-0.5" style={{ color: "rgba(239,68,68,0.9)" }}>
          Danger zone
        </p>
        <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>
          Once deleted, your account and all associated data cannot be recovered.
        </p>
        <DeleteAccountDialog userId={user.id} userEmail={user.email} />
      </div>
    </div>
  );
}
