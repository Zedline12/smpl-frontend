// Runs in the browser before the app starts: reports errors nothing else caught.
import { reportClientError } from "@/lib/error-reporting";

/**
 * Browser translation (Chrome / Google Translate) and some extensions replace the text
 * nodes React rendered. When React later removes or moves one, the browser throws
 * "Failed to execute 'removeChild' on 'Node'" (Safari: "The object can not be found
 * here") and the page crashes. This was the most common frontend error. When the node
 * isn't actually a child any more, skip the DOM call instead of throwing (the
 * well-known fix from facebook/react#11538).
 */
function guardDomAgainstTranslation() {
  if (typeof Node !== "function" || !Node.prototype) return;
  const removeChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) return child;
    return removeChild.call(this, child) as T;
  };
  const insertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(this: Node, node: T, ref: Node | null): T {
    if (ref && ref.parentNode !== this) return node;
    return insertBefore.call(this, node, ref) as T;
  };
}

guardDomAgainstTranslation();

// reportClientError also reloads once for stale chunks after a deploy.
window.addEventListener("error", (event) => {
  reportClientError(event.error ?? event.message, { kind: "window" });
});

window.addEventListener("unhandledrejection", (event) => {
  reportClientError(event.reason, { kind: "unhandledrejection" });
});
