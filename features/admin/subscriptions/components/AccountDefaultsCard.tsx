"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { NO_PLAN_LABEL } from "@/lib/subscription";

interface AccountSettings {
  noPlanMaxConcurrentJobs: number;
}

const KEY = ["admin", "account-settings"];

async function api(init?: RequestInit): Promise<AccountSettings> {
  const res = await fetch("/api/admin/account-settings", {
    ...init,
    headers: { "Content-Type": "application/json" },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error ?? "Couldn't load the account defaults");
  return json as AccountSettings;
}

/**
 * Defaults for accounts without a paid plan (shown as "Free"): how many generations they
 * can run at once. (Credits for new users: admin → Gifts.)
 */
export function AccountDefaultsCard() {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery({ queryKey: KEY, queryFn: () => api() });
  const [draft, setDraft] = useState<AccountSettings | null>(null);
  const values = draft ?? data ?? null;

  const save = useMutation({
    mutationFn: (next: AccountSettings) => api({ method: "PUT", body: JSON.stringify(next) }),
    onSuccess: (saved) => {
      qc.setQueryData(KEY, saved);
      setDraft(null);
      toast.success("Account defaults saved");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const field = (key: keyof AccountSettings, label: string, hint: string, min: number, max: number) => (
    <label className="flex min-w-0 flex-1 flex-col gap-1.5">
      <span className="text-[11px] font-medium tracking-wide text-white/45 uppercase">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        step={1}
        value={values?.[key] ?? ""}
        onChange={(e) =>
          values && setDraft({ ...values, [key]: Math.max(min, Math.min(max, Math.round(Number(e.target.value) || 0))) })
        }
        className="h-10 rounded-lg border border-white/10 bg-black/40 px-3 text-sm text-white focus:border-primary/50 focus:outline-none"
      />
      <span className="text-[11px] text-white/35">{hint}</span>
    </label>
  );

  return (
    <div className="mb-6 space-y-4 rounded-xl border border-white/10 bg-neutral-900/40 p-5">
      <div>
        <h2 className="text-sm font-semibold text-white">Account defaults</h2>
        <p className="text-xs text-white/50">
          For users without a paid plan (shown as &ldquo;{NO_PLAN_LABEL}&rdquo;). Changes apply within a minute.
        </p>
      </div>

      {isLoading ? (
        <p className="text-xs text-white/40">Loading…</p>
      ) : isError || !values ? (
        <p className="text-xs text-red-300">Couldn&apos;t load the account defaults.</p>
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {field("noPlanMaxConcurrentJobs", "Generations at once", "How many can run at the same time without a plan.", 1, 10)}
          <button
            type="button"
            onClick={() => values && save.mutate(values)}
            disabled={!draft || save.isPending}
            className="bg-primary hover:bg-primary/90 h-10 shrink-0 rounded-lg px-5 text-sm font-semibold text-white disabled:opacity-40 sm:mt-[22px]"
          >
            {save.isPending ? "Saving…" : "Save"}
          </button>
        </div>
      )}
    </div>
  );
}
