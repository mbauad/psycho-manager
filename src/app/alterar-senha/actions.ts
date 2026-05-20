"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export async function alterarSenhaObrigatoria(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const novaSenha = formData.get("novaSenha") as string;
  const confirmarSenha = formData.get("confirmarSenha") as string;

  if (!novaSenha || !confirmarSenha) {
    return { error: "Preencha todos os campos." };
  }

  if (novaSenha !== confirmarSenha) {
    return { error: "As senhas nao coincidem." };
  }

  if (novaSenha.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres." };
  }

  const hashedPassword = await bcrypt.hash(novaSenha, 10);

  await db.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      mustChangePassword: false,
    },
  });

  return { success: true };
}
