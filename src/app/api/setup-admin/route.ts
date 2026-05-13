import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, token } = await req.json();

    const setupToken = process.env.SETUP_TOKEN || "psycho-manager-2024";

    if (!token || token !== setupToken) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    if (!email) {
      return NextResponse.json({ error: "E-mail obrigatório" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    await db.user.update({
      where: { id: user.id },
      data: { role: "ADMIN" },
    });

    return NextResponse.json({
      success: true,
      message: `Usuário ${email} agora é ADMIN`,
    });
  } catch (error) {
    console.error("Setup admin error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
