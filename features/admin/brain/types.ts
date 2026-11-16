/** Smpl Brain shapes, mirroring smpl-backend/src/modules/admin/brain/brain.types.ts. */

export type ValueFormat =
  | "int"
  | "number"
  | "usd_cents"
  | "usd"
  | "pct"
  | "credits"
  | "duration_ms"
  | "date"
  | "datetime"
  | "text";

export interface KpiItem {
  label: string;
  value: number | string | null;
  format?: ValueFormat;
  delta?: number | null;
  hint?: string;
  invert?: boolean;
}

export interface KpisBlock {
  type: "kpis";
  title?: string;
  items: KpiItem[];
}

export interface ChartBlock {
  type: "chart";
  kind: "line" | "bar" | "stacked" | "area" | "pie";
  title: string;
  subtitle?: string;
  x: string;
  series: { key: string; label: string }[];
  data: Record<string, unknown>[];
  format?: ValueFormat;
  xFormat?: "date" | "month" | "hour" | "text";
}

export interface TableColumn {
  key: string;
  label: string;
  format?: ValueFormat;
  link?: string;
}

export interface TableBlock {
  type: "table";
  title: string;
  columns: TableColumn[];
  rows: Record<string, unknown>[];
  total?: number;
}

export interface CalloutBlock {
  type: "callout";
  tone: "info" | "success" | "warning" | "danger";
  text: string;
}

export interface ActionBlock {
  type: "action";
  actionId: string;
  kind: string;
  title: string;
  details: { label: string; value: string }[];
  status: "pending" | "done" | "cancelled" | "failed" | "expired";
  expiresAt: string;
  result?: string | null;
}

export type BrainBlock = KpisBlock | ChartBlock | TableBlock | CalloutBlock | ActionBlock;

export interface BrainToolCall {
  name: string;
  label: string;
  args: Record<string, unknown>;
  ms: number;
  ok: boolean;
  error?: string | null;
}

/** Brain v1 answers kept one list of rows. */
export interface StructuredDataPayload {
  type?: string;
  items: Record<string, unknown>[];
  count?: number;
  query?: string;
}

export interface BrainMessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  structuredData?: StructuredDataPayload;
  blocks?: BrainBlock[];
  toolCalls?: BrainToolCall[];
  usage?: { input: number; output: number } | null;
  model?: string | null;
  createdAt: string;
}

export interface BrainConversation {
  id: string;
  title: string;
  lastMessageAt: string;
  createdAt: string;
}

export interface ConversationPage {
  data: BrainConversation[];
  total: number;
  page: number;
  hasMore: boolean;
}

export type BrainEvent =
  | { type: "conversation"; conversationId: string; title: string }
  | { type: "tool_start"; id: string; name: string; label: string; args: Record<string, unknown> }
  | { type: "tool_end"; id: string; ms: number; ok: boolean; error?: string }
  | { type: "block"; block: BrainBlock; toolId?: string }
  | { type: "text_delta"; delta: string }
  | {
      type: "done";
      messageId: string;
      content: string;
      blocks: BrainBlock[];
      toolCalls: BrainToolCall[];
      usage: { input: number; output: number } | null;
      model: string;
    }
  | { type: "error"; message: string };

/** A tool step as the live timeline shows it. */
export interface ToolStep {
  id: string;
  name: string;
  label: string;
  args: Record<string, unknown>;
  status: "running" | "ok" | "error";
  ms?: number;
  error?: string;
}

export interface BrainOverview {
  users: { total: number; new24h: number; new7d: number; new30d: number };
  revenue: { mrrCents: number; payingCustomers: number; trialing: number; pastDue: number; canceling: number; lapsed: number };
  generations24h: { total: number; failed: number; failureRate: number };
  creditsUsed24h: number;
  openTickets: number;
  openErrors: number;
  newErrors24h: number;
  stuckJobs: number | null;
  queueWaiting: number;
  health: boolean;
}
