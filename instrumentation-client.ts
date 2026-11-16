// Runs in the browser before the app starts: reports errors nothing else caught.
import { reportClientError } from "@/lib/error-reporting";

window.addEventListener("error", (event) => {
  reportClientError(event.error ?? event.message, { kind: "window" });
});

window.addEventListener("unhandledrejection", (event) => {
  reportClientError(event.reason, { kind: "unhandledrejection" });
});
