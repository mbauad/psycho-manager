import { db } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const pacienteId = searchParams.get("pacienteId");

  if (!pacienteId) {
    return NextResponse.json([]);
  }

  const sessoes = await db.sessao.findMany({
    where: {
      userId: session.user.id,
      pacienteId,
    },
    select: {
      id: true,
      dataHoraInicio: true,
      status: true,
    },
    orderBy: { dataHoraInicio: "desc" },
  });

  return NextResponse.json(sessoes);
}
