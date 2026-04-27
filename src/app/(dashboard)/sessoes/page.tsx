import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  FileText,
  Clock,
  CheckCircle,
  X,
  AlertTriangle,
  Pencil,
} from "lucide-react";
import { format } from "date-fns";
import { SessionFilters } from "./filters";

type PageProps = {
  searchParams: Promise<{ q?: string; status?: string }>;
};

const statusConfig: Record<string, { label: string; class: string }> = {
  realizada: { label: "Realizada", class: "badge-green" },
  agendada: { label: "Agendada", class: "badge-blue" },
  cancelada: { label: "Cancelada", class: "badge-red" },
  faltou: { label: "Faltou", class: "badge-orange" },
};

export default async function SessoesPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { q, status } = await searchParams;
  const searchQuery = q ?? "";
  const currentStatus = status ?? "todos";

  const sessoes = await db.sessao.findMany({
    where: {
      userId: session.user.id,
      ...(currentStatus !== "todos" ? { status: currentStatus } : {}),
      ...(searchQuery ? { paciente: { nomeCompleto: { contains: searchQuery } } } : {}),
    },
    include: { paciente: true },
    orderBy: { dataHoraInicio: "desc" },
  });

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">Sessoes</h1>
            <p className="page-subtitle">{sessoes.length} sessao(oes) encontrada(s)</p>
          </div>
          <Link href="/sessoes/nova" className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Nova Sessao
          </Link>
        </div>
      </div>

      <SessionFilters currentStatus={currentStatus} />

      <div className="card">
        <div className="card-body">
          {sessoes.length === 0 ? (
            <div className="empty-state">
              <FileText className="empty-state-icon" />
              <p className="empty-state-title">Nenhuma sessao encontrada</p>
              <p className="empty-state-desc">Agende uma nova sessao para comecar</p>
            </div>
          ) : (
            <div className="session-list">
              {sessoes.map((sessao) => {
                const cfg = statusConfig[sessao.status] || { label: sessao.status, class: "badge-gray" };
                return (
                  <div key={sessao.id} className="session-card">
                    <div className="session-card-date">
                      <span className="session-card-date-day">
                        {format(new Date(sessao.dataHoraInicio), "d")}
                      </span>
                      <span className="session-card-date-month">
                        {format(new Date(sessao.dataHoraInicio), "MMM")}
                      </span>
                    </div>
                    <div className="session-card-content">
                      <p className="session-card-name">{sessao.paciente?.nomeCompleto}</p>
                      <p className="session-card-time">
                        {format(new Date(sessao.dataHoraInicio), "HH:mm")}
                        {sessao.dataHoraFim && ` - ${format(new Date(sessao.dataHoraFim), "HH:mm")}`}
                        {" • "}
                        <span style={{ textTransform: "capitalize" }}>{sessao.tipo}</span>
                        {" / "}
                        <span style={{ textTransform: "capitalize" }}>{sessao.modalidade}</span>
                      </p>
                      {sessao.descricao && (
                        <p className="session-card-desc">{sessao.descricao}</p>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className={`badge ${cfg.class}`}>{cfg.label}</span>
                      <Link href={`/sessoes/${sessao.id}/editar`} className="btn btn-ghost btn-sm" style={{ color: "#2563eb" }}>
                        <Pencil className="w-3 h-3" />
                        Editar
                      </Link>
                      <Link href={`/sessoes/${sessao.id}`} className="btn btn-ghost btn-sm">
                        Ver
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}