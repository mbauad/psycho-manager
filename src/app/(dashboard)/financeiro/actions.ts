"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const pagamentoSchema = z.object({
  pacienteId: z.string().optional(),
  sessaoId: z.string().optional(),
  valor: z.number().min(0.01, "Valor deve ser maior que zero"),
  data: z.string().min(1, "Informe a data"),
  tipo: z.enum(["sessao", "sinal", "pacote", "outro"]),
  formaPagamento: z.enum(["dinheiro", "pix", "cartao", "transferencia", "outro"]).optional(),
  status: z.enum(["pendente", "recebido", "cancelado"]),
  observacoes: z.string().optional(),
});

export async function createPagamento(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const raw = {
    pacienteId: (formData.get("pacienteId") as string) || undefined,
    sessaoId: (formData.get("sessaoId") as string) || undefined,
    valor: parseFloat(formData.get("valor") as string),
    data: formData.get("data") as string,
    tipo: formData.get("tipo") as string,
    formaPagamento: (formData.get("formaPagamento") as string) || undefined,
    status: (formData.get("status") as string) || "pendente",
    observacoes: (formData.get("observacoes") as string) || undefined,
  };

  const parsed = pagamentoSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Dados invalidos", fields: parsed.error.flatten().fieldErrors };
  }

  await db.pagamento.create({
    data: {
      ...parsed.data,
      data: new Date(parsed.data.data),
      userId: session.user.id,
    },
  });

  revalidatePath("/financeiro");
}

export async function updatePagamento(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const raw = {
    pacienteId: (formData.get("pacienteId") as string) || undefined,
    sessaoId: (formData.get("sessaoId") as string) || undefined,
    valor: parseFloat(formData.get("valor") as string),
    data: formData.get("data") as string,
    tipo: formData.get("tipo") as string,
    formaPagamento: (formData.get("formaPagamento") as string) || undefined,
    status: (formData.get("status") as string) || "pendente",
    observacoes: (formData.get("observacoes") as string) || undefined,
  };

  const parsed = pagamentoSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Dados invalidos", fields: parsed.error.flatten().fieldErrors };
  }

  await db.pagamento.update({
    where: { id, userId: session.user.id },
    data: {
      ...parsed.data,
      data: new Date(parsed.data.data),
    },
  });

  revalidatePath("/financeiro");
}

export async function deletePagamento(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return;
  }

  await db.pagamento.delete({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/financeiro");
}

export async function updateStatusPagamento(id: string, status: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return;
  }

  await db.pagamento.update({
    where: { id, userId: session.user.id },
    data: { status },
  });

  revalidatePath("/financeiro");
}