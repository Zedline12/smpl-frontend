import type { Metadata } from "next";
import Link from "next/link";
import { AiCheck } from "@/features/legal/AiCheck";

export const metadata: Metadata = { title: "Check if smpl made it · smpl" };

/** Public detection tool (EU AI Act transparency, California AI Transparency Act). */
export default function AiCheckPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="text-3xl font-bold text-white">Was this made with smpl?</h1>
      <p className="mt-2 mb-8 text-sm text-white/55">
        Everything smpl creates is AI-generated and carries a hidden marker. Check a file or a link here: we show whether it was
        made with smpl, when and with which model, never who made it.{" "}
        <Link href="/legal/ai-content" className="underline">
          How we mark AI content
        </Link>
      </p>
      <AiCheck />
    </div>
  );
}
