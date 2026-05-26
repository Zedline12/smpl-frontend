"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  useAiGenerationControlStore,
  useAiModelStore,
} from "@/stores/useAiGenerationControlStore";

export default function SpeechToText() {
  const { model } = useAiGenerationControlStore();
  const { setField } = useAiModelStore();

  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } catch {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder) return;

    clearInterval(timerRef.current!);
    setIsRecording(false);

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const file = new File([blob], "recording.webm", { type: "audio/webm" });
      streamRef.current?.getTracks().forEach((t) => t.stop());
      await uploadAndTranscribe(file);
    };

    mediaRecorder.stop();
  };

  const uploadAndTranscribe = async (file: File) => {
    setIsProcessing(true);
    try {
      const sigRes = await fetch("/api/media/upload-signature", {
        method: "POST",
        body: JSON.stringify({ contentType: file.type }),
        headers: { "Content-Type": "application/json" },
      });
      const { data: { url } } = await sigRes.json();

      await fetch(url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      const audioUrl = url.split("?")[0];

      const res = await fetch("/api/generation/speech-to-text", {
        method: "POST",
        body: JSON.stringify({ audioUrl }),
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      const transcription = json.data?.prompt;
      if (transcription) {
        setField(model, "prompt", transcription);
        toast.success("Transcription complete");
      } else {
        toast.error("No transcription returned");
      }
    } catch {
      toast.error("Failed to transcribe audio");
    } finally {
      setIsProcessing(false);
      chunksRef.current = [];
    }
  };

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center w-9 h-9">
        <svg
          className="w-4 h-4 animate-spin text-white/50"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (isRecording) {
    return (
      <button
        type="button"
        onClick={stopRecording}
        className="flex items-center gap-1.5 px-2.5 h-9 rounded-lg border border-red-500/60 bg-red-500/10 text-red-400 text-xs font-medium transition-all duration-200 hover:bg-red-500/20 cursor-pointer"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
          <rect x="4" y="4" width="16" height="16" rx="2" />
        </svg>
        {elapsed}s
      </button>
    );
  }

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={startRecording}
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-white/10 transition-all duration-200 hover:bg-white/10 opacity-50 hover:opacity-100 cursor-pointer"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="w-4 h-4"
        >
          <rect x="9" y="2" width="6" height="11" rx="3" />
          <path d="M5 10a7 7 0 0 0 14 0" strokeLinecap="round" />
          <line x1="12" y1="19" x2="12" y2="22" strokeLinecap="round" />
          <line x1="9" y1="22" x2="15" y2="22" strokeLinecap="round" />
        </svg>
      </button>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-black/80 text-white/80 border border-white/10">
        Speech to text
      </div>
    </div>
  );
}
