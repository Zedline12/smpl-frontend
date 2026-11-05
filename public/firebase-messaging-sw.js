/* eslint-disable no-undef */
// Firebase Cloud Messaging service worker for the admin dashboard.
// Shows a system notification when an admin notification arrives while the tab is
// in the background. The Firebase config is passed in the registration URL's query
// string (service workers can't read env variables).

importScripts("https://www.gstatic.com/firebasejs/13.2.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/13.2.0/firebase-messaging-compat.js");

const params = new URL(self.location.href).searchParams;
const config = {
  apiKey: params.get("apiKey"),
  authDomain: params.get("authDomain"),
  projectId: params.get("projectId"),
  messagingSenderId: params.get("messagingSenderId"),
  appId: params.get("appId"),
};

if (config.apiKey && config.projectId) {
  firebase.initializeApp(config);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const data = payload.data || {};
    const level = data.level || "ordinary";
    const prefix = level === "critical" ? "🔴 " : level === "important" ? "🟠 " : "";

    self.registration.showNotification(prefix + (data.title || "New notification"), {
      body: data.body || "",
      icon: "/logo.png",
      badge: "/logo.png",
      tag: data.id || undefined,
      requireInteraction: level === "critical",
      data: { link: data.link || "/admin/notifications" },
    });
  });
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const link = (event.notification.data && event.notification.data.link) || "/admin/notifications";
  const url = new URL(link, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const adminTab = windows.find((w) => new URL(w.url).pathname.startsWith("/admin"));
      if (adminTab) {
        adminTab.focus();
        return adminTab.navigate(url);
      }
      return clients.openWindow(url);
    }),
  );
});
