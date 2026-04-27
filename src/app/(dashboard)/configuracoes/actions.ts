"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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