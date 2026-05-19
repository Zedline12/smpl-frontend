"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/features/admin/components/table";
import { SubscribedUser } from "@/features/admin/users/types/types";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

function formatPrice(cents: number | null): string {
  if (!cents) return "—";
  return `$${(cents / 100).toFixed(2)}`;
}

function formatName(user: SubscribedUser): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return name || user.email;
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  past_due: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  canceled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

function StatusBadge({ status }: { status: SubscribedUser["subscriptionStatus"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
        status ? (STATUS_STYLES[status] ?? "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400") : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
      )}
    >
      {status ?? "None"}
    </span>
  );
}

const SKELETON_ROWS = 3;
const COL_COUNT = 7;

export function UsersTable({
  users,
  isLoading,
}: {
  users: SubscribedUser[];
  isLoading?: boolean;
}) {
  const router = useRouter();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Credits Balance</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Billing Period</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: COL_COUNT }).map((_, j) => (
                <TableCell key={j}>
                  <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={COL_COUNT} className="text-center py-6 text-muted-foreground">
              No users found.
            </TableCell>
          </TableRow>
        ) : (
          users.map((user) => (
            <TableRow key={user.id} className="cursor-pointer" onClick={() => router.push(`/admin/users/${user.id}`)}>
              <TableCell className="font-medium">{formatName(user)}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.creditsBalance}</TableCell>
              <TableCell>{user.subscriptionPlanName ?? "Free"}</TableCell>
              <TableCell>{formatPrice(user.subscriptionPlanPriceAmount)}</TableCell>
              <TableCell>{user.billingPeriod ?? "—"}</TableCell>
              <TableCell>
                <StatusBadge status={user.subscriptionStatus} />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
