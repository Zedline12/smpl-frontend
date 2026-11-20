"use client";

import { useState, type FormEvent } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  fetchBlockedTlds,
  fetchRejectedSignups,
  saveBlockedTlds,
  type SignupRejection,
  type SignupRejectionReason,
} from "../api";
import { ListSpinner, SeeMoreButton } from "./SecurityBadges";

const FILTERS: { value: SignupRejectionReason | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "turnstile", label: "Turnstile" },
  { value: "risky_email", label: "Risky email" },
];

/** Readable names for the risk check's signals. */
const SIGNAL_LABELS: Record<string, string> = {
  name_plus_digits: "name + digits",
  name_dot_name_digits: "name.name + digits",
  long_alphanumeric: "long random string",
  hex_string: "hex string",
  long_digit_run: "long digit run",
  generic_name_digits: "generic name + digits",
  many_dots: "many dots",
  plus_alias: "+ alias",
  risky_tld: "risky TLD",
  disposable_domain: "disposable domain",
  no_mx: "no mail server",
};

function signalLabel(signal: string): string {
  if (signal.startsWith("blocked_tld:")) return `blocked TLD ${signal.slice("blocked_tld:".length)}`;
  return SIGNAL_LABELS[signal] ?? signal;
}

function BlockedTldsCard() {
  const qc = useQueryClient();
  const [value, setValue] = useState("");
  const { data: tlds = [], isLoading, isError } = useQuery({
    queryKey: ["security-blocked-tlds"],
    queryFn: fetchBlockedTlds,
  });

  const save = useMutation({
    mutationFn: (next: string[]) => saveBlockedTlds(next),
    onSuccess: (saved) => qc.setQueryData(["security-blocked-tlds"], saved),
    onError: (err: Error) => toast.error(err.message),
  });

  const add = (e: FormEvent) => {
    e.preventDefault();
    const raw = value.trim().toLowerCase();
    if (!raw || save.isPending) return;
    const tld = raw.startsWith(".") ? raw : `.${raw}`;
    if (tlds.includes(tld)) {
      toast.error(`${tld} is already blocked`);
      return;
    }
    save.mutate([...tlds, tld], {
      onSuccess: () => {
        toast.success(`${tld} blocked`);
        setValue("");
      },
    });
  };

  const remove = (tld: string) =>
    save.mutate(
      tlds.filter((t) => t !== tld),
      { onSuccess: () => toast.success(`${tld} unblocked`) },
    );

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-neutral-900/40 p-4">
      <div>
        <h3 className="text-sm font-semibold">Blocked TLDs</h3>
        <p className="text-xs text-muted-foreground">
          Emails on these domains can&apos;t sign up, whatever their risk score. Existing accounts can still sign in.
        </p>
      </div>

      {isLoading ? (
        <p className="text-xs text-muted-foreground">Loading…</p>
      ) : isError ? (
        <p className="text-xs text-red-300">Couldn&apos;t load blocked TLDs.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {tlds.length === 0 && <span className="text-xs text-muted-foreground">No TLDs blocked.</span>}
          {tlds.map((tld) => (
            <span
              key={tld}
              className="inline-flex items-center gap-1 rounded-full border border-red-700/40 bg-red-900/20 py-0.5 pr-1 pl-2.5 font-mono text-xs text-red-300"
            >
              {tld}
              <button
                type="button"
                onClick={() => remove(tld)}
                disabled={save.isPending}
                aria-label={`Unblock ${tld}`}
                className="flex size-4 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-red-900/50 disabled:opacity-50"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <form onSubmit={add} className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder=".xyz"
          aria-label="TLD to block"
          maxLength={40}
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm outline-none placeholder:text-muted-foreground/60 focus:border-white/25"
        />
        <button
          type="submit"
          disabled={!value.trim() || save.isPending}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-700/40 bg-red-900/20 px-4 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-900/40 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Block TLD
        </button>
      </form>
    </div>
  );
}

function RejectionRow({ row }: { row: SignupRejection }) {
  const isTurnstile = row.reason === "turnstile";
  return (
    <div className="rounded-xl border border-white/10 bg-neutral-900/40 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="min-w-0 truncate font-mono text-sm">{row.email}</p>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-medium",
            isTurnstile ? "bg-red-900/40 text-red-300" : "bg-amber-900/40 text-amber-300",
          )}
        >
          {isTurnstile ? "Turnstile" : "Risky email"}
        </span>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        {isTurnstile ? (
          row.detail && <span className="font-mono">{row.detail}</span>
        ) : (
          <>
            {row.score != null && <span className="tabular-nums">Score {row.score}</span>}
            {row.signals.map((s) => (
              <span key={s} className="rounded-full bg-neutral-800 px-1.5 text-neutral-300">
                {signalLabel(s)}
              </span>
            ))}
          </>
        )}
        {row.clientIp && <span className="font-mono">· {row.clientIp}</span>}
        <span className="inline-flex items-center gap-1">
          · <MapPin className="size-3" />
          {[row.city, row.country].filter(Boolean).join(", ") || "Unknown location"}
        </span>
        <span>· {new Date(row.createdAt).toLocaleString()}</span>
      </div>
    </div>
  );
}

export default function RejectedSignupsTab() {
  const [filter, setFilter] = useState<SignupRejectionReason | "all">("all");
  const reason = filter === "all" ? undefined : filter;

  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["security-rejected-signups", filter],
      queryFn: ({ pageParam }) => fetchRejectedSignups(pageParam, reason),
      initialPageParam: 1,
      getNextPageParam: (last, pages) => (last.hasMore ? pages.length + 1 : undefined),
    });

  const rows = data?.pages.flatMap((p) => p.data ?? []) ?? [];
  const totalCount = data?.pages[0]?.totalCount ?? 0;

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-base font-semibold">Rejected sign-ups</h2>
        <p className="text-xs text-muted-foreground">
          New emails refused before a sign-up code was sent: the Turnstile check failed, or the email looked throwaway
          or bot-made. No account was created for any of them.
        </p>
      </div>

      <BlockedTldsCard />

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              "cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              filter === f.value
                ? "border-white/25 bg-white/10 text-foreground"
                : "border-white/10 text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <ListSpinner />
      ) : isError ? (
        <p className="py-8 text-center text-sm text-red-300">Couldn&apos;t load rejected sign-ups.</p>
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No rejected sign-ups.</p>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground tabular-nums">{totalCount} rejected</p>
          {rows.map((row) => (
            <RejectionRow key={row.id} row={row} />
          ))}
        </div>
      )}

      {hasNextPage && <SeeMoreButton onClick={() => fetchNextPage()} loading={isFetchingNextPage} />}
    </section>
  );
}
