"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const pacienteSchema = z.object({
  nomeCompleto: z.string().min(2, "Nome obrigatorio"),
  cpf: z.string().optional(),
  dataNascimento: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email("E-mail invalido").or(z.literal("")).optional(),
  queixaPrincipal: z.string().optional(),
  observacoes: z.string().optional(),
});

export async function createPaciente(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const raw = {
    nomeCompleto: formData.get("nomeCompleto") as string,
    cpf: (formData.get("cpf") as string) || undefined,
    dataNascimento: (formData.get("dataNascimento") as string) || undefined,
    telefone: (formData.get("telefone") as string) || undefined,
    email: (formData.get("email") as string) || undefined,
    queixaPrincipal: (formData.get("queixaPrincipal") as string) || undefined,
    observacoes: (formData.get("observacoes") as string) || undefined,
  };

  const parsed = pacienteSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Dados invalidos");
  }

  await db.paciente.create({
    data: {
      ...parsed.data,
      dataNascimento: parsed.data.dataNascimento ? new Date(parsed.data.dataNascimento) : null,
      userId: session.user.id,
    },
  });

  revalidatePath("/pacientes");
  redirect("/pacientes");
}

export async function updatePaciente(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const raw = {
    nomeCompleto: formData.get("nomeCompleto") as string,
    cpf: (formData.get("cpf") as string) || undefined,
    dataNascimento: (formData.get("dataNascimento") as string) || undefined,
    telefone: (formData.get("telefone") as string) || undefined,
    email: (formData.get("email") as string) || undefined,
    queixaPrincipal: (formData.get("queixaPrincipal") as string) || undefined,
    observacoes: (formData.get("observacoes") as string) || undefined,
  };

  const parsed = pacienteSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Dados invalidos");
  }

  await db.paciente.update({
    where: { id, userId: session.user.id },
    data: {
      ...parsed.data,
      dataNascimento: parsed.data.dataNascimento ? new Date(parsed.data.dataNascimento) : null,
    },
  });

  revalidatePath("/pacientes");
  redirect(`/pacientes/${id}`);
}

export async function deletePaciente(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return;
  }

  await db.paciente.delete({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/pacientes");
}