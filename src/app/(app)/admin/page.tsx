import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { getSession } from "@/lib/auth/session";
import { CreateUserCard } from "@/components/admin/create-user-card";
import { UsersList, type AdminUser } from "@/components/admin/users-list";

export const runtime = "nodejs";

export default async function AdminPage() {
  const session = await getSession();
  // The (app) layout already redirects anonymous visitors to /login.
  if (session?.user.role !== "admin") redirect("/print");

  const result = await auth.api.listUsers({
    query: { limit: 100 },
    headers: await headers(),
  });

  const users: AdminUser[] = (result.users ?? []).map((u) => ({
    id: u.id,
    name: u.name ?? "",
    email: u.email,
    role: (u.role as string | undefined) ?? "user",
  }));

  return (
    <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
      <CreateUserCard />
      <UsersList users={users} />
    </div>
  );
}
