"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Download, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { cardClass } from "@/features/admin/components/data-viz/palette";
import type { TableBlock } from "../../types";
import { downloadText, fillLink, formatValue, isNumericFormat, slug, toCsv } from "./format";

const PAGE = 25;

/** A table from Brain: sortable, searchable, CSV export, admin links, "showing N of total". */
export function DataTable({ block, bare = false }: { block: TableBlock; bare?: boolean }) {
  const [sort, setSort] = useState<{ key: string; desc: boolean } | null>(null);
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(PAGE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = block.rows;
    if (q) {
      rows = rows.filter((r) =>
        block.columns.some((c) => formatValue(r[c.key], c.format).toLowerCase().includes(q) || String(r[c.key] ?? "").toLowerCase().includes(q)),
      );
    }
    if (sort) {
      const col = block.columns.find((c) => c.key === sort.key);
      rows = [...rows].sort((a, b) => {
        const x = a[sort.key];
        const y = b[sort.key];
        if (x == null && y == null) return 0;
        if (x == null) return 1;
        if (y == null) return -1;
        const cmp =
          typeof x === "number" && typeof y === "number"
            ? x - y
            : col?.format === "date" || col?.format === "datetime"
              ? new Date(String(x)).getTime() - new Date(String(y)).getTime()
              : String(x).localeCompare(String(y), undefined, { numeric: true });
        return sort.desc ? -cmp : cmp;
      });
    }
    return rows;
  }, [block, query, sort]);

  const total = block.total ?? block.rows.length;
  const visible = filtered.slice(0, shown);

  if (!block.rows.length) {
    return (
      <div className={cn(!bare && cardClass, "px-4 py-3.5")}>
        <p className="text-[13px] font-semibold text-white">{block.title}</p>
        <p className="mt-1 text-[12.5px] text-white/40">Nothing to show.</p>
      </div>
    );
  }

  return (
    <div className={cn(!bare && cardClass, "min-w-0 overflow-hidden")}>
      {!bare && (
        <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px] font-semibold text-white">{block.title}</p>
            <p className="text-[11.5px] text-white/40">
              {query ? `${filtered.length} of ${block.rows.length} rows match` : block.rows.length < total ? `Showing ${block.rows.length} of ${total.toLocaleString()}` : `${total.toLocaleString()} rows`}
            </p>
          </div>
          {block.rows.length > 8 && (
            <label className="flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5">
              <Search className="h-3.5 w-3.5 text-white/35" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShown(PAGE);
                }}
                placeholder="Filter"
                aria-label={`Filter ${block.title}`}
                className="w-28 border-0! bg-transparent! p-0! text-[12.5px]! text-white outline-none! placeholder:text-white/30"
              />
            </label>
          )}
          <button
            type="button"
            onClick={() => downloadText(`${slug(block.title)}.csv`, toCsv(block.columns, filtered))}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 text-[12px] font-medium text-white/60 hover:text-white"
            title="Download these rows as CSV"
          >
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
        </div>
      )}
      <div className="custom-scrollbar max-h-[440px] overflow-auto">
        <table className="w-full text-[12.5px]">
          <thead className="sticky top-0 z-[1] bg-[#181818]">
            <tr className="text-[11px] uppercase tracking-wider text-white/40">
              {block.columns.map((c) => {
                const numeric = isNumericFormat(c.format);
                const active = sort?.key === c.key;
                return (
                  <th key={c.key} className={cn("whitespace-nowrap px-4 py-2.5 font-semibold", numeric ? "text-right" : "text-left")}>
                    <button
                      type="button"
                      onClick={() => setSort((s) => (s?.key === c.key ? { key: c.key, desc: !s.desc } : { key: c.key, desc: numeric }))}
                      className={cn("inline-flex items-center gap-1 hover:text-white", active && "text-white/85")}
                    >
                      {c.label}
                      {active && (sort.desc ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />)}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {visible.map((row, i) => (
              <tr key={i} className="hover:bg-white/[0.02]">
                {block.columns.map((c) => {
                  const text = formatValue(row[c.key], c.format);
                  const href = fillLink(c.link, row);
                  const numeric = isNumericFormat(c.format);
                  return (
                    <td
                      key={c.key}
                      className={cn(
                        "max-w-[320px] truncate px-4 py-2.5",
                        numeric ? "text-right tabular-nums text-white/75" : "text-white/80",
                      )}
                      title={text.length > 40 ? text : undefined}
                    >
                      {href && text !== "—" ? (
                        <Link href={href} className="text-[#b9a4ff] hover:underline">
                          {text}
                        </Link>
                      ) : (
                        text
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length > shown && (
        <button
          type="button"
          onClick={() => setShown((n) => n + 100)}
          className="w-full border-t border-white/[0.06] py-2.5 text-[12px] font-medium text-white/55 hover:bg-white/[0.02] hover:text-white"
        >
          Show more ({filtered.length - shown} left)
        </button>
      )}
    </div>
  );
}
