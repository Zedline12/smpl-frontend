import type { UploadCrop } from "@/features/media/api/upload";

/** Above this many pixels some browsers (older phones) can't draw a canvas. */
const MAX_CANVAS_PIXELS = 16_777_216;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Couldn't read the image"));
    img.src = src;
  });
}

/**
 * Crops an image in the browser, so only the crop is uploaded. The crop is in the
 * image's natural pixels as the browser shows it (phone photos already upright).
 * PNG / WebP / GIF stay PNG (keeps transparency); everything else becomes JPEG.
 * Throws when the browser can't do it; callers fall back to the backend crop.
 */
export async function cropImageFile(file: File, crop: UploadCrop): Promise<File> {
  const width = Math.round(crop.width);
  const height = Math.round(crop.height);
  if (width < 1 || height < 1 || width * height > MAX_CANVAS_PIXELS) {
    throw new Error("Crop too large to do in the browser");
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    // If the browser reports a different size than the editor did, scale the crop.
    const sx = img.naturalWidth / crop.displayWidth;
    const sy = img.naturalHeight / crop.displayHeight;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not available");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, crop.x * sx, crop.y * sy, crop.width * sx, crop.height * sy, 0, 0, width, height);

    const png = /image\/(png|webp|gif)/.test(file.type);
    const type = png ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, png ? undefined : 0.92));
    if (!blob) throw new Error("Couldn't encode the crop");

    const base = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${base}-cropped.${png ? "png" : "jpg"}`, { type });
  } finally {
    URL.revokeObjectURL(url);
  }
}
