"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Copy, Globe, Loader2, RefreshCw, Smartphone, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createPairingCode, deviceKeys, fetchDevices, removeDevice, type AdminDevice } from "../api";

/** The API address the phone calls. It must be reachable from the phone (not localhost). */
const MOBILE_API_URL = process.env.NEXT_PUBLIC_MOBILE_API_URL || process.env.NEXT_PUBLIC_API_URL || "";
const API_IS_LOCAL = /\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(MOBILE_API_URL);

function useCountdown(expiresAt?: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!expiresAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  const left = expiresAt ? Math.max(0, new Date(expiresAt).getTime() - now) : 0;
  const mm = Math.floor(left / 60_000);
  const ss = String(Math.floor((left % 60_000) / 1000)).padStart(2, "0");
  return { expired: !!expiresAt && left === 0, label: `${mm}:${ss}` };
}

function deviceLabel(d: AdminDevice) {
  if (d.platform !== "web") return d.deviceName || (d.platform === "ios" ? "iPhone" : "Android phone");
  const ua = d.userAgent ?? "";
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
  const os = /Windows/.test(ua) ? "Windows" : /Mac OS/.test(ua) ? "macOS" : /Android/.test(ua) ? "Android" : /Linux/.test(ua) ? "Linux" : "";
  return os ? `${browser} on ${os}` : browser;
}

function ConnectPhoneDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const pairing = useMutation({ mutationFn: createPairingCode });
  const { expired, label } = useCountdown(pairing.data?.expiresAt);
  const generate = pairing.mutate;

  // A fresh code every time the dialog opens.
  useEffect(() => {
    if (open) generate();
  }, [open, generate]);

  // While the QR is showing, poll for the phone to appear, then close.
  const watch = useQuery({
    queryKey: deviceKeys.all,
    queryFn: fetchDevices,
    enabled: open,
    refetchInterval: open ? 3000 : false,
  });
  useEffect(() => {
    if (!open || !pairing.data || !watch.data) return;
    const issuedAt = new Date(pairing.data.expiresAt).getTime() - 5 * 60_000;
    const paired = watch.data.find(
      (d) => !!d.pairedAt && new Date(d.pairedAt).getTime() >= issuedAt - 5000,
    );
    if (paired) {
      toast.success(`${deviceLabel(paired)} connected`);
      onOpenChange(false);
    }
  }, [open, pairing.data, watch.data, onOpenChange]);

  const qrValue = pairing.data
    ? JSON.stringify({ t: "smpl-notifications", api: MOBILE_API_URL, code: pairing.data.code })
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm border-white/10 bg-[#111] text-white">
        <DialogHeader>
          <DialogTitle>Connect your phone</DialogTitle>
          <DialogDescription className="text-white/50">
            Open the SMPL Notifications app and scan this code. It works once and expires in 5 minutes.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-3 py-2">
          <div className="relative flex h-[232px] w-[232px] items-center justify-center rounded-2xl bg-white p-4">
            {pairing.isPending || !pairing.data ? (
              <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
            ) : (
              <QRCodeSVG value={qrValue} size={200} level="M" className={expired ? "opacity-10" : ""} />
            )}
            {expired && (
              <button
                type="button"
                onClick={() => generate()}
                className="absolute inset-0 m-auto inline-flex h-10 w-36 items-center justify-center gap-2 rounded-lg bg-neutral-900 text-sm font-medium text-white"
              >
                <RefreshCw className="h-4 w-4" /> New code
              </button>
            )}
          </div>

          {pairing.isError && <p className="text-sm text-red-300">Couldn&apos;t create a code. Try again.</p>}
          {pairing.data && !expired && (
            <div className="flex items-center gap-3 text-xs text-white/50">
              <span className="tabular-nums">Expires in {label}</span>
              <span className="text-white/20">·</span>
              <button
                type="button"
                onClick={() =>
                  navigator.clipboard
                    .writeText(qrValue)
                    .then(() => toast.success("Setup code copied — paste it in the app"))
                    .catch(() => toast.error("Couldn't copy"))
                }
                className="inline-flex items-center gap-1 text-white/60 underline-offset-2 hover:text-white hover:underline"
              >
                <Copy className="h-3 w-3" /> Can&apos;t scan? Copy code
              </button>
            </div>
          )}
          {API_IS_LOCAL && (
            <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-[11px] leading-snug text-amber-100/90">
              The phone will call <span className="font-mono">{MOBILE_API_URL}</span>, which it can&apos;t reach.
              Set <span className="font-mono">NEXT_PUBLIC_MOBILE_API_URL</span> to your PC&apos;s network address
              (e.g. http://192.168.1.20:3003/api/v1) or an ngrok URL.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** "Mobile app" card: pair a phone by QR and manage every device that receives push. */
export function MobileDevicesCard() {
  const qc = useQueryClient();
  const [connectOpen, setConnectOpen] = useState(false);
  const devices = useQuery({ queryKey: deviceKeys.all, queryFn: fetchDevices });
  const remove = useMutation({
    mutationFn: removeDevice,
    onSuccess: () => {
      toast.success("Device disconnected");
      qc.invalidateQueries({ queryKey: deviceKeys.all });
    },
    onError: () => toast.error("Couldn't disconnect the device"),
  });

  const list = devices.data ?? [];

  return (
    <section className="rounded-2xl border border-white/[0.07] bg-neutral-900/30 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Devices receiving alerts</h2>
          <p className="text-xs text-white/45">Browsers you enabled from the bell, and phones running the SMPL Notifications app.</p>
        </div>
        <button
          type="button"
          onClick={() => setConnectOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #6b41ff 0%, #ea4bff 100%)" }}
        >
          <Smartphone className="h-4 w-4" />
          Connect phone
        </button>
      </div>

      <div className="mt-3 space-y-1">
        {devices.isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-white/40" />
          </div>
        ) : list.length === 0 ? (
          <p className="py-3 text-[13px] text-white/40">No devices yet.</p>
        ) : (
          list.map((d) => {
            const Icon = d.platform === "web" ? Globe : Smartphone;
            return (
              <div key={d.id} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/[0.03]">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
                  <Icon className="h-4 w-4 text-white/60" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium">
                    {deviceLabel(d)}
                    <span className="ml-2 rounded-full border border-white/10 px-1.5 py-px text-[10px] font-normal uppercase text-white/45">
                      {d.platform}
                    </span>
                  </p>
                  <p className="truncate text-[11px] text-white/40">
                    {d.email ?? "Unknown admin"} · active {formatDistanceToNow(new Date(d.lastSeenAt), { addSuffix: true })}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Disconnect device"
                  onClick={() => remove.mutate(d.id)}
                  disabled={remove.isPending}
                  className="rounded-lg p-2 text-white/40 transition-colors hover:bg-red-500/10 hover:text-red-300 disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      <ConnectPhoneDialog open={connectOpen} onOpenChange={setConnectOpen} />
    </section>
  );
}
