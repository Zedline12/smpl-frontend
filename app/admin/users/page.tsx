import { UserAdmin } from "@/features/admin/users/types/types";
import { fetchWithToken } from "@/lib/fetcher";

import { UsersTable } from "@/features/admin/users/components/UsersTable";
import { UsersPrimaryButtons } from "@/features/admin/users/components/UsersPrimaryButtons";

export default async function Users() {
  const users = await fetchWithToken("/admin/users/analytics");
  const data: UserAdmin[] = await users.json().then((res) => res.data);

  return (
    <div className="space-y-6">
       <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
            <p className='text-muted-foreground'>
              Manage your users and their roles here.
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>
      <UsersTable users={data} />
    </div>
  );
}
