import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Users, Calendar, TrendingUp, BarChart3 } from "lucide-react";

export default async function RelatoriosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [
    totalPacientes,
    totalSessoes,
    sessoesRealizadas,
    sessoesCanceladas,
  ] = await Promise.all([
    db.paciente.count({ where: { userId } }),
    db.sessao.count({ where: { userId } }),
    db.sessao.count({ where: { userId, status: "realizada" } }),
    db.sessao.count({ where: { userId, status: "cancelada" } }),
  ]);

  const pagamentos = await db.pagamento.findMany({
    where: { userId, status: "recebido" },
  });

  const receitaTotal = pagamentos.reduce((sum, p) => sum + p.valor, 0);
  const mediaMensal = totalSessoes > 0 ? (totalSessoes / Math.max(1, new Date().getMonth() + 1)).toFixed(1) : "0";
  const taxa = totalSessoes > 0 ? Math.round((sessoesRealizadas / totalSessoes) * 100) : 0;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Relatorios</h1>
          <p className="page-subtitle">Visao geral da sua clinica</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <p className="stat-card-label">Total Pacientes</p>
            <div className="stat-card-icon blue"><Users /></div>
          </div>
          <p className="stat-card-value">{totalPacientes}</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <p className="stat-card-label">Total de Sessoes</p>
            <div className="stat-card-icon green"><Calendar /></div>
          </div>
          <p className="stat-card-value">{totalSessoes}</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <p className="stat-card-label">Receita Total</p>
            <div className="stat-card-icon purple"><TrendingUp /></div>
          </div>
          <p className="stat-card-value">R$ {receitaTotal.toFixed(2)}</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <p className="stat-card-label">Media Mensal</p>
            <div className="stat-card-icon orange"><BarChart3 /></div>
          </div>
          <p className="stat-card-value">{mediaMensal} sess&#245;es</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Resumo Detalhado</h2>
        </div>
        <div className="card-body">
          <div style={{ display: "flex", flexDirection: "column" }}>
            {[
              { label: "Total de sessoes", value: totalSessoes },
              { label: "Sessoes realizadas", value: sessoesRealizadas },
              { label: "Sessoes canceladas", value: sessoesCanceladas },
              { label: "Pacientes ativos", value: totalPacientes },
              { label: "Taxa de comparecimento", value: `${taxa}%`, color: taxa >= 80 ? "#059669" : taxa >= 50 ? "#d97706" : "#dc2626" },
              { label: "Media de sessoes/mes", value: `${mediaMensal}` },
              { label: "Receita total", value: `R$ ${receitaTotal.toFixed(2)}` },
            ].map((item, i, arr) => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                <span style={{ color: "#64748b", fontSize: 14 }}>{item.label}</span>
                <span className="font-bold text-slate-900 dark:text-slate-100" style={{ color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}