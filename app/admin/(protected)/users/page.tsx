import UsersPageClient from "@/features/admin/users/components/UsersPageClient";

export default function Users() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Subscribed Users</h2>
        <p className="text-muted-foreground">Users with active paid subscriptions.</p>
      </div>
      <UsersPageClient />
    </div>
  );
}
