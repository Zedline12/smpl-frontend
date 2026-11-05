import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type MessagePayload,
  type Messaging,
} from "firebase/messaging";
import { registerDeviceToken } from "./api";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.messagingSenderId && firebaseConfig.appId && VAPID_KEY,
);

let messagingPromise: Promise<{ messaging: Messaging; registration: ServiceWorkerRegistration } | null> | null = null;

/** Initialises Firebase + the service worker once. Resolves null where push isn't possible. */
function initMessaging() {
  if (messagingPromise) return messagingPromise;
  messagingPromise = (async () => {
    if (typeof window === "undefined" || !isFirebaseConfigured) return null;
    if (!("serviceWorker" in navigator) || !("Notification" in window)) return null;
    if (!(await isSupported().catch(() => false))) return null;

    const app: FirebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);
    // The worker can't read env variables, so hand it the (public) config in the URL.
    const query = new URLSearchParams(
      Object.entries(firebaseConfig).filter(([, v]) => !!v) as [string, string][],
    ).toString();
    const registration = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${query}`);
    return { messaging: getMessaging(app), registration };
  })().catch((err) => {
    console.warn("Firebase messaging unavailable:", err);
    return null;
  });
  return messagingPromise;
}

export type PushPermission = NotificationPermission | "unsupported";

export function getPushPermission(): PushPermission {
  if (typeof window === "undefined" || !("Notification" in window) || !isFirebaseConfigured) return "unsupported";
  return Notification.permission;
}

/**
 * Gets this browser's FCM token and registers it with the backend. Asks for permission
 * only when `prompt` is true (it must be called from a click for the browser to show it).
 */
export async function enablePush(prompt: boolean): Promise<PushPermission> {
  const ctx = await initMessaging();
  if (!ctx) return "unsupported";

  let permission = Notification.permission;
  if (permission === "default" && prompt) permission = await Notification.requestPermission();
  if (permission !== "granted") return permission;

  const token = await getToken(ctx.messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: ctx.registration,
  });
  if (token) await registerDeviceToken(token);
  return permission;
}

/** Subscribes to messages that arrive while the admin tab is open. */
export async function onForegroundMessage(handler: (payload: MessagePayload) => void): Promise<() => void> {
  const ctx = await initMessaging();
  if (!ctx) return () => {};
  return onMessage(ctx.messaging, handler);
}
