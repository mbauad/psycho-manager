"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const sessaoSchema = z.object({
  pacienteId: z.string().min(1, "Selecione um paciente"),
  dataHoraInicio: z.string().min(1, "Informe a data e hora"),
  dataHoraFim: z.string().optional(),
  tipo: z.enum(["particular", "institucional"]),
  modalidade: z.enum(["presencial", "online", "telefone", "local"]),
  motivoConsulta: z.string().optional(),
  descricao: z.string().optional(),
  observacoes: z.string().optional(),
  status: z.enum(["agendada", "realizada", "cancelada", "faltou"]).default("agendada"),
});

export async function createSessao(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const raw = {
    pacienteId: formData.get("pacienteId") as string,
    dataHoraInicio: formData.get("dataHoraInicio") as string,
    dataHoraFim: (formData.get("dataHoraFim") as string) || undefined,
    tipo: formData.get("tipo") as string,
    modalidade: formData.get("modalidade") as string,
    motivoConsulta: (formData.get("motivoConsulta") as string) || undefined,
    descricao: (formData.get("descricao") as string) || undefined,
    observacoes: (formData.get("observacoes") as string) || undefined,
    status: ((formData.get("status") as string) || "agendada") as "agendada" | "realizada" | "cancelada" | "faltou",
  };

  const parsed = sessaoSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Dados invalidos");
  }

  await db.sessao.create({
    data: {
      ...parsed.data,
      dataHoraInicio: new Date(parsed.data.dataHoraInicio),
      dataHoraFim: parsed.data.dataHoraFim ? new Date(parsed.data.dataHoraFim) : null,
      userId: session.user.id,
    },
  });

  revalidatePath("/sessoes");
  redirect("/sessoes");
}

export async function updateSessao(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const raw = {
    pacienteId: formData.get("pacienteId") as string,
    dataHoraInicio: formData.get("dataHoraInicio") as string,
    dataHoraFim: (formData.get("dataHoraFim") as string) || undefined,
    tipo: formData.get("tipo") as string,
    modalidade: formData.get("modalidade") as string,
    motivoConsulta: (formData.get("motivoConsulta") as string) || undefined,
    descricao: (formData.get("descricao") as string) || undefined,
    observacoes: (formData.get("observacoes") as string) || undefined,
    status: ((formData.get("status") as string) || "agendada") as "agendada" | "realizada" | "cancelada" | "faltou",
  };

  const parsed = sessaoSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Dados invalidos");
  }

  await db.sessao.update({
    where: { id, userId: session.user.id },
    data: {
      ...parsed.data,
      dataHoraInicio: new Date(parsed.data.dataHoraInicio),
      dataHoraFim: parsed.data.dataHoraFim ? new Date(parsed.data.dataHoraFim) : null,
    },
  });

  revalidatePath("/sessoes");
  redirect(`/sessoes/${id}`);
}

export async function deleteSessao(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return;
  }

  await db.sessao.delete({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/sessoes");
}

export async function concluirSessao(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return;
  }

  await db.sessao.update({
    where: { id, userId: session.user.id },
    data: { status: "realizada" },
  });

  revalidatePath("/sessoes");
  revalidatePath(`/sessoes/${id}`);
  redirect(`/sessoes/${id}`);
}