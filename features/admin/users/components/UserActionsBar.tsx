"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { Shield, MapPin, Ban, RotateCcw, XCircle } from "lucide-react";

const LocationHeatMap = dynamic(() => import("./LocationHeatMap"), { ssr: false });

interface Props {
  userId: string;
  isSuspended: boolean;
  /** Has a paid plan right now (shows Refund). */
  hasSubscription: boolean;
  /** The plan is already set to end (hides Cancel). */
  isCanceling?: boolean;
  subscriptionPlanName?: string | null;
  subscriptionPlanPriceAmount?: number | null;
  // security fields
  clientIp?: string | null;
  country?: string | null;
  countryCode?: string | null;
  city?: string | null;
  isVpn?: boolean;
  isProxy?: boolean;
  isDataCenter?: boolean;
  isThreat?: boolean;
}

export default function UserActionsBar({
  userId,
  isSuspended,
  hasSubscription,
  isCanceling = false,
  subscriptionPlanName,
  subscriptionPlanPriceAmount,
  clientIp,
  country,
  countryCode,
  city,
  isVpn,
  isProxy,
  isDataCenter,
  isThreat,
}: Props) {
  const router = useRouter();
  const [suspended, setSuspended] = useState(isSuspended);
  const [loading, setLoading] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<null | "refund" | "cancel" | "suspend" | "unsuspend">(null);

  const flags = [
    isVpn && "VPN",
    isProxy && "Proxy",
    isDataCenter && "Datacenter",
    isThreat && "Threat",
  ].filter(Boolean) as string[];

  // Plan prices are stored in dollars.
  const formatPrice = (dollars: number | null | undefined) => {
    if (!dollars) return "";
    return ` · $${dollars % 1 === 0 ? dollars.toFixed(0) : dollars.toFixed(2)}`;
  };

  async function doSuspend(suspend: boolean) {
    setLoading("suspend");
    setConfirmDialog(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSuspended: suspend }),
      });
      if (!res.ok) throw new Error("Failed");
      setSuspended(suspend);
      toast.success(suspend ? "User suspended" : "User unsuspended");
      router.refresh();
    } catch {
      toast.error("Action failed");
    } finally {
      setLoading(null);
    }
  }

  async function doRefund() {
    setLoading("refund");
    setConfirmDialog(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/refund`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed");
      }
      const data = await res.json();
      toast.success(`Refund issued: $${((data?.data?.amount ?? 0) / 100).toFixed(2)}`);
    } catch (e: any) {
      toast.error(e.message || "Refund failed");
    } finally {
      setLoading(null);
    }
  }

  async function doCancelSubscription() {
    setLoading("cancel");
    setConfirmDialog(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/cancel-subscription`, {
        method: "POST",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || json?.message || "Cancel failed");
      toast.success("Subscription will end at the end of the paid period");
      router.refresh();
    } catch (error) {
      toast.error((error as Error).message || "Cancel failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      {/* Security section */}
      <section className="rounded-xl border border-white/10 bg-neutral-900/40 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Security</h2>
          </div>
          {suspended && (
            <span className="rounded-full border border-red-700/40 bg-red-900/40 px-2.5 py-0.5 text-xs font-medium text-red-300">
              Suspended
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {clientIp && (
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">IP Address</p>
              <p className="font-mono text-foreground/80">{clientIp}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Location</p>
            <div className="flex items-center gap-1.5">
              {countryCode ? (
                <>
                  <p className="text-foreground/80">
                    {[city, country].filter(Boolean).join(", ") || countryCode}
                  </p>
                  <button
                    onClick={() => setShowMap(true)}
                    className="rounded px-1.5 py-0.5 text-xs border border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground transition-colors"
                  >
                    <MapPin className="inline h-3 w-3 mr-0.5" />
                    Map
                  </button>
                </>
              ) : (
                <p className="text-muted-foreground/60 italic">Location not available</p>
              )}
            </div>
          </div>
        </div>

        {flags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {flags.map((flag) => (
              <span
                key={flag}
                className="rounded-full border border-orange-700/40 bg-orange-900/30 px-2.5 py-0.5 text-xs font-medium text-orange-300"
              >
                {flag}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Action buttons */}
      <section className="flex flex-wrap gap-3">
        <button
          onClick={() => setConfirmDialog(suspended ? "unsuspend" : "suspend")}
          disabled={!!loading}
          className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
            suspended
              ? "border-green-700/40 bg-green-900/20 text-green-300 hover:bg-green-900/40"
              : "border-red-700/40 bg-red-900/20 text-red-300 hover:bg-red-900/40"
          }`}
        >
          <Ban className="h-3.5 w-3.5" />
          {loading === "suspend" ? "Working…" : suspended ? "Unsuspend Account" : "Suspend Account"}
        </button>

        {hasSubscription && (
          <>
            <button
              onClick={() => setConfirmDialog("refund")}
              disabled={!!loading}
              className="flex items-center gap-1.5 rounded-lg border border-yellow-700/40 bg-yellow-900/20 px-4 py-2 text-sm font-medium text-yellow-300 transition-colors hover:bg-yellow-900/40 disabled:opacity-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {loading === "refund" ? "Working…" : "Refund Latest Payment"}
            </button>
            {!isCanceling && (
              <button
                onClick={() => setConfirmDialog("cancel")}
                disabled={!!loading}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800/50 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-neutral-500 hover:text-foreground disabled:opacity-50"
              >
                <XCircle className="h-3.5 w-3.5" />
                {loading === "cancel" ? "Working…" : "Cancel Subscription"}
              </button>
            )}
          </>
        )}
      </section>

      {/* Confirm dialogs */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0e0e1a] p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-semibold">
              {confirmDialog === "suspend" && "Suspend this account?"}
              {confirmDialog === "unsuspend" && "Unsuspend this account?"}
              {confirmDialog === "refund" && "Refund latest payment?"}
              {confirmDialog === "cancel" && "Cancel subscription?"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {confirmDialog === "suspend" && "The user will be blocked from logging in immediately."}
              {confirmDialog === "unsuspend" && "The user will be able to log in again."}
              {confirmDialog === "refund" &&
                `This will issue a full refund for the most recent payment${subscriptionPlanName ? ` (${subscriptionPlanName}${formatPrice(subscriptionPlanPriceAmount)})` : ""}.`}
              {confirmDialog === "cancel" &&
                "The subscription stops renewing. The user keeps the plan until the end of the period they paid for, then moves to Free."}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDialog(null)}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-muted-foreground hover:border-white/20 hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmDialog === "suspend") doSuspend(true);
                  else if (confirmDialog === "unsuspend") doSuspend(false);
                  else if (confirmDialog === "refund") doRefund();
                  else if (confirmDialog === "cancel") doCancelSubscription();
                }}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
                  confirmDialog === "suspend"
                    ? "bg-red-600 hover:bg-red-700"
                    : confirmDialog === "cancel"
                      ? "bg-neutral-700 hover:bg-neutral-600"
                      : "bg-primary hover:bg-primary/90"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showMap && (
        <LocationHeatMap
          countryCode={countryCode}
          country={country}
          city={city}
          onClose={() => setShowMap(false)}
        />
      )}
    </>
  );
}
