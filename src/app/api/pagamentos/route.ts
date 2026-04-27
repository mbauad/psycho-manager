import { db } from "@/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const pagamentos = await db.pagamento.findMany({
    where: { userId: session.user.id },
    include: { paciente: true },
    orderBy: { data: "desc" },
  });

  return NextResponse.json(pagamentos);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const { pacienteId, sessaoId, valor, data, tipo, status, observacoes } = body;

  if (!valor || !data || !tipo) {
    return NextResponse.json({ error: "Dados invalidos" }, { status: 400 });
  }

  const pagamento = await db.pagamento.create({
    data: {
      pacienteId: pacienteId || null,
      sessaoId: sessaoId || null,
      valor: parseFloat(valor),
      data: new Date(data),
      tipo,
      status: status || "pendente",
      observacoes: observacoes || null,
      userId: session.user.id,
    },
  });

  revalidatePath("/financeiro");
  return NextResponse.json(pagamento, { status: 201 });
}