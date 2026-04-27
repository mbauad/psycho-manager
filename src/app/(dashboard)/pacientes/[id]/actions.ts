"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateProntuario(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const paciente = await db.paciente.findFirst({
    where: { id, userId: session.user.id },
    include: { prontuario: true },
  });

  if (!paciente) {
    throw new Error("Paciente nao encontrado");
  }

  const data = {
    queixaPrincipal: (formData.get("queixaPrincipal") as string) || null,
    historicoFamiliar: (formData.get("historicoFamiliar") as string) || null,
    historicoMedico: (formData.get("historicoMedico") as string) || null,
    usoMedicamentos: (formData.get("usoMedicamentos") as string) || null,
    alergias: (formData.get("alergias") as string) || null,
    previaPsicoterapia: (formData.get("previaPsicoterapia") as string) || null,
    avaliacaoInicial: (formData.get("avaliacaoInicial") as string) || null,
    planoTratamento: (formData.get("planoTratamento") as string) || null,
    observacoes: (formData.get("observacoes") as string) || null,
  };

  if (paciente.prontuario) {
    await db.prontuario.update({
      where: { id: paciente.prontuario.id },
      data,
    });
  } else {
    await db.prontuario.create({
      data: {
        ...data,
        pacienteId: paciente.id,
        dataAbertura: new Date(),
      },
    });
  }

  revalidatePath(`/pacientes/${id}`);
  revalidatePath(`/pacientes/${id}/prontuario`);
}