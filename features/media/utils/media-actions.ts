import { toast } from "sonner";

/** Copies text; navigator.clipboard is missing over plain http on a LAN address. */
export async function copyText(text: string, successMessage = "Copied") {
  if (!navigator.clipboard?.writeText) {
    window.prompt("Copy this:", text);
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    toast.success(successMessage);
  } catch {
    toast.error("Could not copy to the clipboard");
  }
}

async function toPngBlob(blob: Blob): Promise<Blob> {
  if (blob.type === "image/png") return blob;
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (png) => (png ? resolve(png) : reject(new Error("PNG conversion failed"))),
      "image/png",
    ),
  );
}

/** Copies the image itself (as PNG, the one type every browser accepts). */
export async function copyImage(url: string) {
  if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
    toast.info("Your browser can't copy images, copying the link instead");
    return copyText(url, "Link copied");
  }
  const toastId = toast.loading("Copying image…");
  try {
    // Hand ClipboardItem a promise so Safari keeps the user-gesture permission.
    const png = fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.blob();
      })
      .then(toPngBlob);
    await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
    toast.success("Image copied", { id: toastId });
  } catch {
    toast.error("Could not copy the image", { id: toastId });
  }
}

export type ShareTarget = "copy" | "x" | "whatsapp" | "instagram" | "pinterest";

const SHARE_TEXT = "Made with smpl";

export async function shareMedia(target: ShareTarget, url: string) {
  const u = encodeURIComponent(url);
  const text = encodeURIComponent(SHARE_TEXT);
  const open = (href: string) =>
    window.open(href, "_blank", "noopener,noreferrer");

  switch (target) {
    case "copy":
      return copyText(url, "Link copied");
    case "x":
      return open(`https://twitter.com/intent/tweet?url=${u}&text=${text}`);
    case "whatsapp":
      return open(`https://wa.me/?text=${text}%20${u}`);
    case "pinterest":
      return open(
        `https://pinterest.com/pin/create/button/?url=${u}&media=${u}&description=${text}`,
      );
    case "instagram":
      // Instagram has no web share link; use the native share sheet when there is one.
      if (navigator.share) {
        try {
          await navigator.share({ url, title: SHARE_TEXT });
        } catch {
          // dismissed
        }
        return;
      }
      await copyText(url, "Link copied, paste it in Instagram");
      return;
  }
}

/** File name for downloads: the media id plus the URL's extension when it has one. */
export function downloadName(id: string, url: string) {
  const ext = url.split("?")[0].match(/\.(\w{2,5})$/)?.[1];
  return ext ? `${id}.${ext}` : id;
}
