import { useState } from "react";
import { toast } from "sonner";
import { uploadReferenceAudio } from "@/features/artist/api/reference-audio";
import { OmniHumanV2InputConst } from "@/features/generation/types/models/omnihuman-v2.type";

const { minSeconds, maxSeconds, maxAudioBytes, audioTypes } = OmniHumanV2InputConst;

/** What the file input should accept: fal only takes wav or mp3. */
export const OMNIHUMAN_AUDIO_ACCEPT = ".mp3,.wav,audio/mpeg,audio/wav,audio/x-wav";

/** Length of an audio file in seconds (NaN if the browser can't read it). */
function audioDuration(file: File) {
  return new Promise<number>((resolve) => {
    const el = document.createElement("audio");
    el.preload = "metadata";
    el.onloadedmetadata = () => {
      resolve(el.duration);
      URL.revokeObjectURL(el.src);
    };
    el.onerror = () => resolve(NaN);
    el.src = URL.createObjectURL(file);
  });
}

const isWavOrMp3 = (file: File) =>
  (audioTypes as readonly string[]).includes(file.type) || /\.(mp3|wav)$/i.test(file.name);

/** "1:05" for 65 s. */
export const formatAudioSeconds = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

/**
 * Checks an audio file against OmniHuman's limits (wav/mp3, 4-300 s, 15 MB), uploads it
 * and sets `audioUrl` plus `duration` (for the price preview) on the model's input.
 */
export function useOmniHumanAudioUpload(setField: (key: "audioUrl" | "duration", value: unknown) => void) {
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (!isWavOrMp3(file)) {
      toast.error("OmniHuman takes wav or mp3 audio.");
      return;
    }
    if (file.size > maxAudioBytes) {
      toast.error(`${file.name} is over ${maxAudioBytes / 1024 / 1024} MB.`);
      return;
    }
    try {
      const seconds = await audioDuration(file);
      if (Number.isFinite(seconds) && (seconds < minSeconds || seconds > maxSeconds + 0.5)) {
        toast.error(`${file.name} is ${seconds.toFixed(1)}s. The audio must be ${minSeconds}s to ${maxSeconds / 60} minutes.`);
        return;
      }
      setUploading(true);
      const url = await uploadReferenceAudio(file);
      setField("audioUrl", url);
      // The backend measures the file itself; this is only for the price shown before then.
      setField("duration", Number.isFinite(seconds) ? Math.ceil(seconds) : undefined);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Audio upload failed");
    } finally {
      setUploading(false);
    }
  };

  const clear = () => {
    setField("audioUrl", "");
    setField("duration", undefined);
  };

  return { uploading, upload, clear };
}
