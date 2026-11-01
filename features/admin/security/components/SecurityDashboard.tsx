"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Wifi, Server, AlertTriangle, Ban } from "lucide-react";
import { toast } from "sonner";

type SecurityType = "threat" | "vpn" | "datacenter" | "proxy" | "suspended";

interface SecurityStats {
  threatCount: number;
  vpnCount: number;
  datacenterCount: number;
  proxyCount: number;
  suspendedCount: number;
  captchaActive?: boolean;
  ipTrackingActive?: boolean;
}

interface SecurityUser {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  clientIp?: string;
  country?: string;
  city?: string;
  plan?: string;
  isSuspended?: boolean;
  isVpn?: boolean;
  isProxy?: boolean;
  isDataCenter?: boolean;
  isThreat?: boolean;
}

async function fetchStats(): Promise<SecurityStats> {
  const res = await fetch("/api/admin/security/stats");
  if (!res.ok) throw new Error("Failed");
  const json = await res.json();
  return json.data ?? json;
}

async function fetchSecurityUsers(type: SecurityType, page: number) {
  const params = new URLSearchParams({ type, page: String(page), limit: "20" });
  const res = await fetch(`/api/admin/security/users?${params.toString()}`);
  if (!res.ok) throw new Error("Failed");
  const json = await res.json();
  return json.data ?? json;
}

async function patchUser(userId: string, isSuspended: boolean) {
  const res = await fetch(`/api/admin/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isSuspended }),
  });
  if (!res.ok) throw new Error("Failed");
}

const TYPE_CONFIG: Record<SecurityType, { label: string; countKey: keyof SecurityStats; icon: React.ElementType; color: string }> = {
  threat: { label: "Threat", countKey: "threatCount", icon: AlertTriangle, color: "text-red-400" },
  vpn: { label: "VPN", countKey: "vpnCount", icon: Wifi, color: "text-purple-400" },
  datacenter: { label: "Datacenter", countKey: "datacenterCount", icon: Server, color: "text-blue-400" },
  proxy: { label: "Proxy", countKey: "proxyCount", icon: Shield, color: "text-yellow-400" },
  suspended: { label: "Suspended", countKey: "suspendedCount", icon: Ban, color: "text-orange-400" },
};

export default function SecurityDashboard() {
  const [selectedType, setSelectedType] = useState<SecurityType>("threat");
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["security-stats"],
    queryFn: fetchStats,
  });

  const { data: usersResult, isLoading: usersLoading } = useQuery({
    queryKey: ["security-users", selectedType, page],
    queryFn: () => fetchSecurityUsers(selectedType, page),
  });

  const users: SecurityUser[] = usersResult?.data ?? usersResult ?? [];
  const hasMore = usersResult?.hasMore ?? false;

  const suspendMutation = useMutation({
    mutationFn: ({ userId, isSuspended }: { userId: string; isSuspended: boolean }) =>
      patchUser(userId, isSuspended),
    onSuccess: (_, { isSuspended }) => {
      toast.success(isSuspended ? "User suspended" : "User unsuspended");
      qc.invalidateQueries({ queryKey: ["security-users"] });
      qc.invalidateQueries({ queryKey: ["security-stats"] });
    },
    onError: () => toast.error("Action failed"),
  });

  const handleTypeChange = (type: SecurityType) => {
    setSelectedType(type);
    setPage(1);
  };

  return (
    <div className="space-y-8">
      {/* Status banners */}
      <div className="flex flex-wrap gap-3">
        <div
          className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium ${
            stats?.captchaActive !== false
              ? "border-green-700/40 bg-green-900/20 text-green-300"
              : "border-neutral-700 bg-neutral-800/50 text-muted-foreground"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${stats?.captchaActive !== false ? "bg-green-400" : "bg-neutral-500"}`}
          />
          Captcha Active
        </div>
        <div className="flex items-center gap-2 rounded-full border border-green-700/40 bg-green-900/20 px-4 py-1.5 text-sm font-medium text-green-300">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
          IP &amp; Threat Tracking Active
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {(Object.entries(TYPE_CONFIG) as [SecurityType, (typeof TYPE_CONFIG)[SecurityType]][]).map(
          ([type, cfg]) => {
            const Icon = cfg.icon;
            const count = stats?.[cfg.countKey] ?? 0;
            const isSelected = selectedType === type;
            return (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`flex flex-col gap-2 rounded-xl border p-4 text-left transition-all ${
                  isSelected
                    ? "border-white/20 bg-white/5"
                    : "border-white/10 bg-neutral-900/40 hover:border-white/15"
                }`}
              >
                <Icon className={`h-5 w-5 ${cfg.color}`} />
                <div>
                  <p className={`text-2xl font-bold tabular-nums ${cfg.color}`}>
                    {statsLoading ? "—" : count}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{cfg.label} users</p>
                </div>
              </button>
            );
          },
        )}
      </div>

      {/* Users list */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold capitalize">
          {TYPE_CONFIG[selectedType].label} Users
        </h2>

        {usersLoading ? (
          <div className="flex justify-center py-10">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          </div>
        ) : users.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No users in this category.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-neutral-900/40 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {[u.firstName, u.lastName].filter(Boolean).join(" ") || u.email}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5 text-xs">
                    {u.clientIp && (
                      <span className="font-mono text-muted-foreground/70">{u.clientIp}</span>
                    )}
                    {u.city || u.country ? (
                      <span className="text-muted-foreground/70">
                        {[u.city, u.country].filter(Boolean).join(", ")}
                      </span>
                    ) : null}
                    {u.isThreat && (
                      <span className="rounded-full bg-red-900/40 px-1.5 text-red-300">Threat</span>
                    )}
                    {u.isVpn && (
                      <span className="rounded-full bg-purple-900/40 px-1.5 text-purple-300">VPN</span>
                    )}
                    {u.isProxy && (
                      <span className="rounded-full bg-yellow-900/40 px-1.5 text-yellow-300">Proxy</span>
                    )}
                    {u.isDataCenter && (
                      <span className="rounded-full bg-blue-900/40 px-1.5 text-blue-300">DC</span>
                    )}
                    {u.isSuspended && (
                      <span className="rounded-full bg-orange-900/40 px-1.5 text-orange-300">Suspended</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={`/admin/users/${u.id}`}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-muted-foreground hover:border-white/20 hover:text-foreground transition-colors"
                  >
                    View
                  </a>
                  <button
                    onClick={() =>
                      suspendMutation.mutate({ userId: u.id, isSuspended: !u.isSuspended })
                    }
                    disabled={suspendMutation.isPending}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                      u.isSuspended
                        ? "border-green-700/40 bg-green-900/20 text-green-300 hover:bg-green-900/40"
                        : "border-red-700/40 bg-red-900/20 text-red-300 hover:bg-red-900/40"
                    }`}
                  >
                    {u.isSuspended ? "Unsuspend" : "Suspend"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {hasMore && (
          <div className="flex justify-center pt-2">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-neutral-700 bg-neutral-800/50 px-5 py-2 text-sm text-muted-foreground hover:border-neutral-500 hover:text-foreground transition-colors"
            >
              See more
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
