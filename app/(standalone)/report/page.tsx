import { Suspense } from "react";
import type { Metadata } from "next";
import { ReportForm } from "@/features/legal/ReportForm";

export const metadata: Metadata = { title: "Report content · smpl" };

/** Anyone can report content here, without an account. */
export default function ReportPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="text-3xl font-bold text-white">Report content</h1>
      <p className="mt-2 mb-8 text-sm text-white/55">
        Tell us about content on smpl that is illegal, shares someone&apos;s intimate images without consent, impersonates
        someone, or infringes copyright. You don&apos;t need an account.
      </p>
      <Suspense>
        <ReportForm />
      </Suspense>
    </div>
  );
}
