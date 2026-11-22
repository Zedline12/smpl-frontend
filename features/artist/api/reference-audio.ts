/** Uploads an audio file as a model reference and returns its public URL. */
export async function uploadReferenceAudio(file: Blob): Promise<string> {
  const contentType = file.type || "audio/wav";
  const sigRes = await fetch("/api/media/upload-signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType, purpose: "reference-audio" }),
  });
  const sig = await sigRes.json().catch(() => null);
  if (!sigRes.ok) {
    const reason = Array.isArray(sig?.message) ? sig.message.join(", ") : sig?.message;
    console.error("[reference-audio] upload signature failed", sigRes.status, sig);
    throw new Error(`Could not start the audio upload${reason ? `: ${reason}` : ` (${sigRes.status})`}`);
  }
  const { url, publicUrl } = (sig?.data ?? sig) as { url?: string; publicUrl?: string };
  if (!url || !publicUrl) throw new Error("Could not start the audio upload");

  const putRes = await fetch(url, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": contentType },
  });
  if (!putRes.ok) throw new Error("Audio upload failed");
  return publicUrl;
}
