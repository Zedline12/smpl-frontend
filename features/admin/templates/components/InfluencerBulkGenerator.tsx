"use client";
import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Layers, Loader2, Square } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import { GenerationTypeEnum } from "@/features/generation/types/generation";
import { fetchGenerationCost } from "@/features/generation/api/generation";
import {
  AiInfluencerInputConst,
  AiInfluencerTier,
  IAiInfluencerInput,
  TIER_LABELS,
} from "@/features/generation/types/models/higgsfield-ai-influencer.type";
import { useAiInfluencerOptions } from "@/features/ai-influencer/hooks/useAiInfluencerOptions";
import { buildBulkInfluencerInputs } from "@/features/ai-influencer/utils/random-influencer";

const MODEL = AiModelsEnum.HIGGSFIELD_AI_INFLUENCER;
const MAX_COUNT = 50;
/** Requests sent at once; the queue still applies the account's concurrency limit. */
const PARALLEL = 3;

async function createTemplate(input: IAiInfluencerInput) {
  const res = await fetch("/api/admin/templates/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, mediaType: GenerationTypeEnum.IMAGE, input }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.error || "Could not create the template");
  }
}

/**
 * Admin tool: queue many AI Influencer templates at once, each with a different
 * random (but valid) appearance across the chosen character types.
 */
export function InfluencerBulkGenerator() {
  const queryClient = useQueryClient();
  const { data: catalog, isLoading: catalogLoading } = useAiInfluencerOptions();

  const [count, setCount] = useState(10);
  const [tiers, setTiers] = useState<AiInfluencerTier[]>(["normal"]);
  const [resolution, setResolution] = useState<IAiInfluencerInput["resolution"]>("2K");
  const [directions, setDirections] = useState("");
  const [progress, setProgress] = useState<{ done: number; failed: number; total: number } | null>(null);
  const stopRef = useRef(false);

  const running = !!progress && progress.done + progress.failed < progress.total;

  const { data: unitCost } = useQuery({
    queryKey: ["generation-cost", MODEL, "bulk", resolution],
    queryFn: () => fetchGenerationCost({ model: MODEL, input: { resolution } as never }),
    staleTime: 60_000,
  });
  const perTemplate = unitCost?.creditsCost ?? 0;

  const toggleTier = (tier: AiInfluencerTier) =>
    setTiers((prev) =>
      prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier],
    );

  const start = async () => {
    if (!catalog || !tiers.length) return;
    const inputs = buildBulkInfluencerInputs(catalog, {
      count,
      tiers,
      resolution,
      directions: directions
        .split("\n")
        .map((d) => d.trim())
        .filter(Boolean)
        .slice(0, 100),
    });
    stopRef.current = false;
    setProgress({ done: 0, failed: 0, total: inputs.length });

    let next = 0;
    let lastError = "";
    const worker = async () => {
      while (!stopRef.current && next < inputs.length) {
        const input = inputs[next++];
        try {
          await createTemplate(input);
          setProgress((p) => p && { ...p, done: p.done + 1 });
        } catch (error) {
          lastError = (error as Error).message;
          setProgress((p) => p && { ...p, failed: p.failed + 1 });
          // Out of credits or not allowed: no point sending the rest.
          if (/credit|balance|forbidden|unauthor/i.test(lastError)) stopRef.current = true;
        }
      }
    };
    await Promise.all(Array.from({ length: PARALLEL }, worker));

    // Anything not sent because of Stop counts as skipped.
    setProgress((p) => p && { ...p, total: p.done + p.failed });
    queryClient.refetchQueries({ queryKey: ["generation-queues"] });
    if (lastError) toast.error(`Some templates failed: ${lastError}`);
    else toast.success("Templates queued — they'll appear below as they finish");
  };

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06]">
          <Layers className="h-4 w-4 text-white/70" />
        </span>
        <div>
          <p className="text-sm font-semibold text-white">Bulk generate influencers</p>
          <p className="text-xs text-white/50">
            Creates many templates, each with a different random look (gender, ethnicity, age,
            skin, hair, eyes, build, plus some style and face details).
          </p>
        </div>
      </div>

      {/* Character types */}
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-medium text-white/60">Character types (spread evenly)</p>
        <div className="flex flex-wrap gap-1.5">
          {AiInfluencerInputConst.tier.map((tier) => {
            const on = tiers.includes(tier);
            return (
              <button
                key={tier}
                type="button"
                disabled={running}
                onClick={() => toggleTier(tier)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  on
                    ? "border-white bg-white text-black"
                    : "border-white/10 text-white/60 hover:border-white/30 hover:text-white"
                }`}
              >
                {TIER_LABELS[tier]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        {/* Count */}
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-white/60">How many</span>
          <input
            type="number"
            min={1}
            max={MAX_COUNT}
            value={count}
            disabled={running}
            onChange={(e) =>
              setCount(Math.min(MAX_COUNT, Math.max(1, parseInt(e.target.value) || 1)))
            }
            className="h-9 w-24 rounded-lg border border-white/10 bg-white/[0.02] px-3 text-sm text-white outline-none focus:border-white/30"
          />
        </label>

        {/* Resolution */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-white/60">Resolution</span>
          <div className="flex rounded-lg border border-white/10 p-1">
            {AiInfluencerInputConst.resolution.map((r) => (
              <button
                key={r}
                type="button"
                disabled={running}
                onClick={() => setResolution(r)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  resolution === r ? "bg-white text-black" : "text-white/60 hover:text-white"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Directions */}
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-white/60">
          Directions (optional, one per line, each influencer gets a random one)
        </span>
        <Textarea
          value={directions}
          disabled={running}
          onChange={(e) => setDirections(e.target.value)}
          placeholder={"Fitness coach in sporty streetwear\nFashion blogger, minimal chic outfit\nTech reviewer, casual hoodie"}
          className="min-h-[90px] resize-none border-white/10 bg-white/[0.02] text-sm text-white"
        />
      </label>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
        <div className="text-xs text-white/50">
          {progress ? (
            <span className="tabular-nums">
              Queued {progress.done}/{progress.total}
              {progress.failed > 0 && <span className="text-red-300"> · {progress.failed} failed</span>}
            </span>
          ) : (
            <span>
              About <span className="text-white">{(perTemplate * count).toLocaleString()} credits</span>{" "}
              ({perTemplate} each), taken from your balance.
            </span>
          )}
        </div>
        {running ? (
          <button
            type="button"
            onClick={() => (stopRef.current = true)}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/5"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending… <Square className="h-3 w-3 fill-current" /> Stop
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            disabled={catalogLoading || !catalog || !tiers.length}
            className="rounded-full px-5 py-2 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: "var(--gradient-create)" }}
          >
            Generate {count} template{count === 1 ? "" : "s"}
          </button>
        )}
      </div>
    </section>
  );
}
