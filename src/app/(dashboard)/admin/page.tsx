import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getUsers, createUser, updateUserRole, deleteUser } from "./actions";
import { AdminClient } from "./admin-client";

export default async function AdminPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/dashboard");
  }

  const users = await getUsers();

  return (
    <div className="page-header">
      <div className="page-header-top">
        <div>
          <h1 className="page-title">Administração</h1>
          <p className="page-subtitle">Gerencie os usuários do sistema</p>
        </div>
      </div>
      <AdminClient users={users} createUser={createUser} updateUserRole={updateUserRole} deleteUser={deleteUser} />
    </div>
  );
}
