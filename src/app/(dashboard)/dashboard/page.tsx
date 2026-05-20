import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  Users,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [
    totalPacientes,
    totalSessoes,
    sessoesEsteMes,
    sessoesRealizadas,
    ultimoPagamento,
    proximasSessoes,
  ] = await Promise.all([
    db.paciente.count({ where: { userId } }),
    db.sessao.count({ where: { userId } }),
    db.sessao.count({
      where: {
        userId,
        dataHoraInicio: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    db.sessao.count({
      where: { userId, status: "realizada" },
    }),
    db.pagamento.findFirst({
      where: { userId },
      orderBy: { data: "desc" },
    }),
    db.sessao.findMany({
      where: {
        userId,
        status: "agendada",
        dataHoraInicio: { gte: new Date() },
      },
      include: { paciente: true },
      orderBy: { dataHoraInicio: "asc" },
      take: 5,
    }),
  ]);

  const taxa = totalSessoes > 0 ? Math.round((sessoesRealizadas / totalSessoes) * 100) : 0;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Bem-vindo de volta, {session.user.name || "Psicologo"}</p>
          </div>
          <Link href="/sessoes/nova" className="btn btn-primary">
            <Calendar className="w-4 h-4" />
            Nova Sessao
          </Link>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <p className="stat-card-label">Total de Pacientes</p>
            <div className="stat-card-icon blue">
              <Users />
            </div>
          </div>
          <p className="stat-card-value">{totalPacientes}</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <p className="stat-card-label">Sessoes este Mes</p>
            <div className="stat-card-icon purple">
              <Calendar />
            </div>
          </div>
          <p className="stat-card-value">{sessoesEsteMes}</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <p className="stat-card-label">Sessoes Realizadas</p>
            <div className="stat-card-icon green">
              <CheckCircle />
            </div>
          </div>
          <p className="stat-card-value">{sessoesRealizadas}</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <p className="stat-card-label">Ultimo Pagamento</p>
            <div className="stat-card-icon orange">
              <CreditCard />
            </div>
          </div>
          <p className="stat-card-value">
            {ultimoPagamento ? `R$ ${ultimoPagamento.valor.toFixed(2)}` : "R$ 0,00"}
          </p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Proximas Sessoes</h2>
            <Link href="/sessoes" className="btn btn-ghost btn-sm">Ver todas</Link>
          </div>
          <div className="card-body">
            {proximasSessoes.length === 0 ? (
              <div className="empty-state">
                <Clock className="empty-state-icon" />
                <p className="empty-state-title">Nenhuma sessao agendada</p>
                <p className="empty-state-desc">Agende uma nova sessao para comecar</p>
              </div>
            ) : (
              <div className="session-list">
                {proximasSessoes.map((sessao) => (
                  <div key={sessao.id} className="session-card">
                    <div className="session-card-date">
                      <span className="session-card-date-day">
                        {format(new Date(sessao.dataHoraInicio), "d")}
                      </span>
                      <span className="session-card-date-month">
                        {format(new Date(sessao.dataHoraInicio), "MMM", { locale: ptBR })}
                      </span>
                    </div>
                    <div className="session-card-content">
                      <p className="session-card-name">{sessao.paciente?.nomeCompleto}</p>
                      <p className="session-card-time">
                        {format(new Date(sessao.dataHoraInicio), "HH:mm")} — {sessao.modalidade}
                      </p>
                    </div>
                    <Link href={`/sessoes/${sessao.id}`} className="btn btn-ghost btn-sm">
                      Ver
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Estatisticas</h2>
            <Link href="/relatorios" className="btn btn-ghost btn-sm">Relatorios</Link>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "#64748b", fontSize: 14 }}>Total de sessoes</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{totalSessoes}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "#64748b", fontSize: 14 }}>Pacientes ativos</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{totalPacientes}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "#64748b", fontSize: 14 }}>Taxa de comparecimento</span>
                <span style={{ fontWeight: 700, color: taxa >= 80 ? "#059669" : taxa >= 50 ? "#d97706" : "#dc2626" }}>{taxa}%</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0" }}>
                <span style={{ color: "#64748b", fontSize: 14 }}>Media de sessoes/mes</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {(totalSessoes / Math.max(1, new Date().getMonth() + 1)).toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}