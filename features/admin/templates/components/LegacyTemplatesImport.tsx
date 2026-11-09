"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { LegacyTemplateReport, migrateLegacyTemplates } from "@/features/templates/api";

/** Moves the old templates (media marked isTemplate) into the templates module. */
export function LegacyTemplatesImport() {
  const queryClient = useQueryClient();
  const [report, setReport] = useState<LegacyTemplateReport | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async (dryRun: boolean) => {
    if (!dryRun && !confirm("Move the old templates into the new templates? The old media copies are removed.")) return;
    setBusy(true);
    try {
      const result = await migrateLegacyTemplates(dryRun);
      setReport(result);
      if (!dryRun) {
        toast.success(`${result.created} templates imported`);
        queryClient.invalidateQueries({ queryKey: ["templates"] });
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white/80">Import old templates</p>
          <p className="text-xs text-white/40">
            Copies each old template into the new format (Gensu/Remix get their before/after videos), then removes the
            old copy. Safe to run again.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => run(true)} disabled={busy} className="rounded-lg border border-white/15 px-3 py-1.5 text-xs hover:bg-white/5 disabled:opacity-50">
            Dry run
          </button>
          <button type="button" onClick={() => run(false)} disabled={busy} className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-50">
            {busy && <Loader2 className="size-3.5 animate-spin" />} Import
          </button>
        </div>
      </div>
      {report && (
        <p className="rounded-lg bg-black/20 p-2.5 font-mono text-[11px] text-white/60">
          {report.dryRun ? "Dry run" : "Import"}: {report.found} old templates found
          {report.dryRun ? "" : ` · ${report.created} imported · ${report.skipped} already done · ${report.failed} failed`}
          {Object.keys(report.byModel).length > 0 &&
            ` (${Object.entries(report.byModel)
              .map(([m, n]) => `${n} ${m}`)
              .join(", ")})`}
        </p>
      )}
    </section>
  );
}
