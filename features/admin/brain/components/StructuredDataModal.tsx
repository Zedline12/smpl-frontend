"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { X, ExternalLink } from "lucide-react";
import { StructuredDataPayload } from "../types";

interface StructuredDataModalProps {
  data: StructuredDataPayload | null;
  onClose: () => void;
}

function formatDate(value: unknown): string {
  if (!value) return "—";
  try {
    return new Date(value as string).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return String(value);
  }
}

function getString(obj: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    if (obj[key] != null) return String(obj[key]);
  }
  return "—";
}

function UsersTable({
  items,
  onClose,
}: {
  items: Record<string, unknown>[];
  onClose: () => void;
}) {
  return (
    <table className="w-full text-[13px]">
      <thead>
        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <th className="py-2 px-3 text-left font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>Name</th>
          <th className="py-2 px-3 text-left font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>Email</th>
          <th className="py-2 px-3 text-left font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>Joined</th>
          <th className="py-2 px-3" />
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => {
          const id = getString(item, "id", "_id");
          const name = [getString(item, "firstName"), getString(item, "lastName")]
            .filter((s) => s !== "—")
            .join(" ") || "—";
          const email = getString(item, "email");
          const joined = formatDate(item.createdAt);
          return (
            <tr
              key={id || i}
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
            >
              <td className="py-2 px-3 text-white">{name}</td>
              <td className="py-2 px-3" style={{ color: "rgba(255,255,255,0.6)" }}>{email}</td>
              <td className="py-2 px-3" style={{ color: "rgba(255,255,255,0.4)" }}>{joined}</td>
              <td className="py-2 px-3">
                {id && id !== "—" && (
                  <Link
                    href={`/admin/users/${id}`}
                    onClick={onClose}
                    className="flex items-center gap-1 text-[12px] transition-colors"
                    style={{ color: "#9370ff" }}
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function SubscriptionsTable({
  items,
  onClose,
}: {
  items: Record<string, unknown>[];
  onClose: () => void;
}) {
  return (
    <table className="w-full text-[13px]">
      <thead>
        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <th className="py-2 px-3 text-left font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>User</th>
          <th className="py-2 px-3 text-left font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>Plan</th>
          <th className="py-2 px-3 text-left font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>Status</th>
          <th className="py-2 px-3 text-left font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>Date</th>
          <th className="py-2 px-3" />
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => {
          const id = getString(item, "id", "_id");
          const userId = getString(item, "userId", "user");
          const plan = getString(item, "planName", "plan", "name");
          const status = getString(item, "status");
          const date = formatDate(item.createdAt ?? item.startDate);
          return (
            <tr
              key={id || i}
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
            >
              <td className="py-2 px-3 text-white">{userId !== "—" ? userId.slice(0, 8) + "…" : "—"}</td>
              <td className="py-2 px-3" style={{ color: "rgba(255,255,255,0.8)" }}>{plan}</td>
              <td className="py-2 px-3">
                <span
                  className="rounded px-1.5 py-0.5 text-[11px] font-medium"
                  style={{
                    background: status === "active" ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.08)",
                    color: status === "active" ? "#22c55e" : "rgba(255,255,255,0.5)",
                  }}
                >
                  {status}
                </span>
              </td>
              <td className="py-2 px-3" style={{ color: "rgba(255,255,255,0.4)" }}>{date}</td>
              <td className="py-2 px-3">
                {userId && userId !== "—" && (
                  <Link
                    href={`/admin/users/${userId}`}
                    onClick={onClose}
                    className="flex items-center gap-1 text-[12px] transition-colors"
                    style={{ color: "#9370ff" }}
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function GenerationsTable({
  items,
  onClose,
}: {
  items: Record<string, unknown>[];
  onClose: () => void;
}) {
  return (
    <table className="w-full text-[13px]">
      <thead>
        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <th className="py-2 px-3 text-left font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>ID</th>
          <th className="py-2 px-3 text-left font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>Model</th>
          <th className="py-2 px-3 text-left font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>Status</th>
          <th className="py-2 px-3 text-left font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>Date</th>
          <th className="py-2 px-3" />
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => {
          const id = getString(item, "id", "_id");
          const model = getString(item, "model", "modelId");
          const status = getString(item, "status");
          const date = formatDate(item.createdAt);
          return (
            <tr
              key={id || i}
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
            >
              <td className="py-2 px-3" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>{id !== "—" ? id.slice(0, 10) + "…" : "—"}</td>
              <td className="py-2 px-3 text-white">{model}</td>
              <td className="py-2 px-3">
                <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>{status}</span>
              </td>
              <td className="py-2 px-3" style={{ color: "rgba(255,255,255,0.4)" }}>{date}</td>
              <td className="py-2 px-3">
                {id && id !== "—" && (
                  <Link
                    href={`/admin/generations/${id}`}
                    onClick={onClose}
                    className="flex items-center gap-1 text-[12px]"
                    style={{ color: "#9370ff" }}
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function MediaTable({
  items,
  onClose,
}: {
  items: Record<string, unknown>[];
  onClose: () => void;
}) {
  return (
    <table className="w-full text-[13px]">
      <thead>
        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <th className="py-2 px-3 text-left font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>ID</th>
          <th className="py-2 px-3 text-left font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>Type</th>
          <th className="py-2 px-3 text-left font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>User</th>
          <th className="py-2 px-3 text-left font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>Date</th>
          <th className="py-2 px-3" />
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => {
          const id = getString(item, "id", "_id");
          const type = getString(item, "type", "mediaType", "mimeType");
          const userId = getString(item, "userId", "user");
          const date = formatDate(item.createdAt);
          return (
            <tr
              key={id || i}
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
            >
              <td className="py-2 px-3" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>{id !== "—" ? id.slice(0, 10) + "…" : "—"}</td>
              <td className="py-2 px-3 text-white">{type}</td>
              <td className="py-2 px-3" style={{ color: "rgba(255,255,255,0.4)" }}>{userId !== "—" ? userId.slice(0, 8) + "…" : "—"}</td>
              <td className="py-2 px-3" style={{ color: "rgba(255,255,255,0.4)" }}>{date}</td>
              <td className="py-2 px-3">
                {id && id !== "—" && (
                  <Link
                    href={`/admin/media/${id}`}
                    onClick={onClose}
                    className="flex items-center gap-1 text-[12px]"
                    style={{ color: "#9370ff" }}
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function StructuredDataModal({ data, onClose }: StructuredDataModalProps) {
  if (!data) return null;

  const count = data.count ?? data.items.length;

  function renderTable() {
    if (!data) return null;
    switch (data.type) {
      case "users":
        return <UsersTable items={data.items} onClose={onClose} />;
      case "subscriptions":
        return <SubscriptionsTable items={data.items} onClose={onClose} />;
      case "generations":
        return <GenerationsTable items={data.items} onClose={onClose} />;
      case "media":
        return <MediaTable items={data.items} onClose={onClose} />;
      default:
        return (
          <pre
            className="rounded-lg p-4 text-[12px] overflow-x-auto"
            style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.7)" }}
          >
            {JSON.stringify(data.items, null, 2)}
          </pre>
        );
    }
  }

  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-50"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 flex flex-col"
          style={{
            background: "#161616",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "16px",
            width: "min(90vw, 800px)",
            maxHeight: "80vh",
          }}
        >
          {/* Header */}
          <div
            className="flex items-start justify-between px-6 py-5 flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider"
                  style={{ background: "rgba(107,65,255,0.15)", color: "#9370ff" }}
                >
                  {data.type}
                </span>
                <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {count} {count === 1 ? "result" : "results"}
                </span>
              </div>
              {data.query && (
                <p className="text-white font-medium text-[14px]">{data.query}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 transition-colors"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Table */}
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {data.items.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.3)" }}>No results found</p>
              </div>
            ) : (
              <div className="px-3 py-2">
                {renderTable()}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
