"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function getUsers() {
  await requireAdmin();
  return db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createUser(formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = (formData.get("role") as string) || "USER";

  if (!name || !email || !password) {
    return { error: "Preencha todos os campos obrigatórios" };
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Este e-mail já está em uso" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function updateUserRole(userId: string, role: string) {
  await requireAdmin();

  await db.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function deleteUser(userId: string) {
  await requireAdmin();

  const currentUser = await requireAdmin();
  if (currentUser.id === userId) {
    return { error: "Você não pode excluir sua própria conta" };
  }

  await db.user.delete({ where: { id: userId } });

  revalidatePath("/admin");
  return { success: true };
}
