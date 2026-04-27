import { db } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const pacientes = await db.paciente.findMany({
    where: { userId: session.user.id },
    select: { id: true, nomeCompleto: true },
    orderBy: { nomeCompleto: "asc" },
  });

  return NextResponse.json(pacientes);
}