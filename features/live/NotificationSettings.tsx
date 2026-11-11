"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SettingsHeader, SettingsPanel, SettingsTile } from "@/app/(protected)/(other)/me/settings/_components/SettingsUi";
import { playNotificationSound } from "@/features/admin/notifications/sound";
import { NotificationPrefs, readPrefs, systemNotificationsSupported, writePrefs } from "./settings";

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        checked ? "bg-primary" : "bg-white/15",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition-transform",
          checked && "translate-x-5",
        )}
      />
    </button>
  );
}

/** Settings → Notifications: sound and system notifications for finished jobs. */
export function NotificationSettings() {
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");

  // Read browser-only state after mount (not during server render).
  useEffect(() => {
    const t = setTimeout(() => {
      setPrefs(readPrefs());
      setPermission(systemNotificationsSupported() ? Notification.permission : "unsupported");
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const update = (patch: Partial<NotificationPrefs>) => setPrefs(writePrefs(patch));

  const enableSystem = async () => {
    if (!systemNotificationsSupported()) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      update({ system: true });
      new Notification("Notifications are on", { body: "We'll tell you when your generations finish.", icon: "/logo.png" });
    } else if (result === "denied") {
      toast.error("Notifications are blocked for this site. You can allow them in your browser's site settings.");
    }
  };

  if (!prefs) return <SettingsHeader title="Notifications" subtitle="When your generations finish." />;

  return (
    <div>
      <SettingsHeader title="Notifications" subtitle="How we let you know a generation is done." />
      <SettingsPanel icon={Bell} title="When a job finishes">
        <SettingsTile className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white">Sound</p>
            <p className="text-xs text-white/50">A short chime with the in-app message.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => playNotificationSound("important")}
              className="flex items-center gap-1 text-xs text-white/50 hover:text-white"
            >
              <Volume2 className="size-3.5" /> Test
            </button>
            <Switch label="Sound" checked={prefs.sound} onChange={(v) => update({ sound: v })} />
          </div>
        </SettingsTile>

        <SettingsTile className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white">System notifications</p>
            <p className="text-xs text-white/50">
              {permission === "unsupported"
                ? "Your browser doesn't support them."
                : permission === "denied"
                  ? "Blocked in your browser. Allow notifications for this site in its settings."
                  : "A pop-up from your computer when SMPL is in another tab."}
            </p>
          </div>
          {permission === "granted" ? (
            <Switch label="System notifications" checked={prefs.system} onChange={(v) => update({ system: v })} />
          ) : permission === "default" ? (
            <button
              type="button"
              onClick={() => void enableSystem()}
              className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black hover:opacity-90"
            >
              Turn on
            </button>
          ) : (
            <BellOff className="size-4 shrink-0 text-white/40" />
          )}
        </SettingsTile>
        <p className="px-2.5 pb-1 text-[11px] text-white/35">
          These settings are saved in this browser. Notifications only arrive while an SMPL tab is open.
        </p>
      </SettingsPanel>
    </div>
  );
}
