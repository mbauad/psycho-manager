"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function updateConfig(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const data = {
    nome: (formData.get("nome") as string) || null,
    especialidade: (formData.get("especialidade") as string) || null,
    croCfp: (formData.get("croCfp") as string) || null,
    telefone: (formData.get("telefone") as string) || null,
    email: (formData.get("email") as string) || null,
    endereco: (formData.get("endereco") as string) || null,
    valorSessao: parseFloat(formData.get("valorSessao") as string) || null,
    tempoSessao: parseInt(formData.get("tempoSessao") as string) || 50,
  };

  await db.configuracao.upsert({
    where: { userId },
    create: { ...data, userId },
    update: data,
  });

  revalidatePath("/configuracoes");
  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const senhaAtual = formData.get("senhaAtual") as string;
  const novaSenha = formData.get("novaSenha") as string;
  const confirmarSenha = formData.get("confirmarSenha") as string;

  if (!senhaAtual || !novaSenha || !confirmarSenha) {
    return { error: "Preencha todos os campos." };
  }

  if (novaSenha !== confirmarSenha) {
    return { error: "A nova senha e a confirmacao nao coincidem." };
  }

  if (novaSenha.length < 6) {
    return { error: "A nova senha deve ter pelo menos 6 caracteres." };
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });

  if (!user || !user.password) {
    return { error: "Usuario nao encontrado ou senha nao configurada." };
  }

  const isValid = await bcrypt.compare(senhaAtual, user.password);
  if (!isValid) {
    return { error: "Senha atual incorreta." };
  }

  const hashedPassword = await bcrypt.hash(novaSenha, 10);

  await db.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { success: true };
}