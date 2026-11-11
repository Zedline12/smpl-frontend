import { toast } from "sonner";
import { installAudioUnlock, playNotificationSound } from "@/features/admin/notifications/sound";
import { readPrefs, systemNotificationsSupported, writePrefs } from "./settings";
import { LiveItem, liveItemLabel, liveItemLink } from "./types";

const CLAIM_PREFIX = "smpl:notified:";
const CLAIM_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Only one tab notifies about a job: the first to write the claim wins. Without
 * storage (private mode) every tab notifies, which is still fine.
 */
function claim(item: LiveItem): boolean {
  const key = `${CLAIM_PREFIX}${item.kind}:${item.id}:${item.status}`;
  try {
    if (localStorage.getItem(key)) return false;
    localStorage.setItem(key, String(Date.now()));
    return true;
  } catch {
    return true;
  }
}

/** Drops old claims so storage doesn't grow forever. */
export function pruneClaims() {
  try {
    const now = Date.now();
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith(CLAIM_PREFIX) && now - Number(localStorage.getItem(key)) > CLAIM_TTL_MS) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // ignore
  }
}

export function prepareSound() {
  installAudioUnlock();
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Toast + sound, and a system notification when the tab is in the background. */
export function notifyFinished(item: LiveItem, navigate: (href: string) => void) {
  // Clipping is tracked by its project, not its internal job row.
  if (item.kind === "job" && item.domain === "clipping-studio") return;
  if (!claim(item)) return;

  const prefs = readPrefs();
  const what = liveItemLabel(item);
  const href = liveItemLink(item);
  const ok = item.status === "success";
  const title = ok
    ? item.kind === "clipping"
      ? "Your clips are ready"
      : `Your ${what} is ready`
    : `${capitalize(what)} failed`;
  const body = ok
    ? (item.title ?? undefined)
    : [item.failedMessage, item.refunded && !/refund/i.test(item.failedMessage ?? "") ? "Credits refunded." : null]
        .filter(Boolean)
        .join(" ") || undefined;

  const action = { label: "View", onClick: () => navigate(href) };
  if (ok) toast.success(title, { description: body, action, duration: 8000 });
  else toast.error(title, { description: body, action, duration: 12000 });

  if (prefs.sound) playNotificationSound(ok ? "important" : "ordinary");

  if (
    prefs.system &&
    systemNotificationsSupported() &&
    Notification.permission === "granted" &&
    document.visibilityState === "hidden"
  ) {
    try {
      const n = new Notification(title, { body, tag: `${item.kind}:${item.id}`, icon: "/logo.png" });
      n.onclick = () => {
        window.focus();
        navigate(href);
        n.close();
      };
    } catch {
      // some browsers only allow notifications from a service worker
    }
  }
}

/**
 * After the user's first job, offer system notifications once (never on page load).
 */
export function maybeAskForPermission() {
  if (!systemNotificationsSupported() || Notification.permission !== "default") return;
  const prefs = readPrefs();
  if (prefs.promptDismissed || !prefs.system) return;
  writePrefs({ promptDismissed: true });
  toast("Get notified when it's done?", {
    description: "We'll let you know even when you're in another tab.",
    duration: 15000,
    action: {
      label: "Turn on",
      onClick: () => {
        void Notification.requestPermission();
      },
    },
  });
}
