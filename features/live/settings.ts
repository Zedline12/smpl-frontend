/** Per-browser notification preferences (localStorage; safe when storage is blocked). */
export interface NotificationPrefs {
  sound: boolean;
  /** System notifications when the tab is in the background. */
  system: boolean;
  /** The user dismissed the "turn on notifications" prompt. */
  promptDismissed: boolean;
}

const KEY = "smpl:notification-prefs";
const DEFAULTS: NotificationPrefs = { sound: true, system: true, promptDismissed: false };

export function readPrefs(): NotificationPrefs {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function writePrefs(patch: Partial<NotificationPrefs>): NotificationPrefs {
  const next = { ...readPrefs(), ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage blocked: preferences last for this page only
  }
  return next;
}

export function systemNotificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}
