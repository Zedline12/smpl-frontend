import { Suspense } from "react";
import UsersPageClient from "@/features/admin/users/components/UsersPageClient";

export default function Users() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Users</h2>
        <p className="text-muted-foreground">
          Browse users by subscription status, including former payers (Lapsed).
        </p>
      </div>
      {/* UsersPageClient reads ?billing= from the URL. */}
      <Suspense>
        <UsersPageClient />
      </Suspense>
    </div>
  );
}
