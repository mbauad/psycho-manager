import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Calendar, Plus } from "lucide-react";
import Link from "next/link";
import { AgendaClient } from "./calendar-client";

export default async function AgendaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const sessoes = await db.sessao.findMany({
    where: { userId: session.user.id },
    include: { paciente: true },
    orderBy: { dataHoraInicio: "asc" },
  });

  const sessionsForCalendar = sessoes.map((s) => ({
    id: s.id,
    dataHoraInicio: s.dataHoraInicio.toISOString(),
    paciente: { nomeCompleto: s.paciente?.nomeCompleto ?? "" },
    status: s.status,
  }));

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">Agenda</h1>
            <p className="page-subtitle">Calendario de sessoes</p>
          </div>
          <Link href="/sessoes/nova" className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Nova Sessao
          </Link>
        </div>
      </div>

      <AgendaClient sessions={sessionsForCalendar} />
    </div>
  );
}