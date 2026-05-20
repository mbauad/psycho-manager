import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { RelatoriosClient } from "./relatorios-client";

export default async function RelatoriosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [
    totalPacientes,
    totalSessoes,
    sessoesRealizadas,
    sessoesCanceladas,
    sessoes,
    pagamentos,
  ] = await Promise.all([
    db.paciente.count({ where: { userId } }),
    db.sessao.count({ where: { userId } }),
    db.sessao.count({ where: { userId, status: "realizada" } }),
    db.sessao.count({ where: { userId, status: "cancelada" } }),
    db.sessao.findMany({ where: { userId } }),
    db.pagamento.findMany({ where: { userId, status: "recebido" } }),
  ]);

  const receitaTotal = pagamentos.reduce((sum, p) => sum + p.valor, 0);
  const mediaMensal = totalSessoes > 0 ? (totalSessoes / Math.max(1, new Date().getMonth() + 1)).toFixed(1) : "0";
  const taxa = totalSessoes > 0 ? Math.round((sessoesRealizadas / totalSessoes) * 100) : 0;

  // Agrupar sessoes por mes
  const sessoesPorMesMap = new Map<string, number>();
  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  for (const s of sessoes) {
    const d = new Date(s.dataHoraInicio);
    const key = `${meses[d.getMonth()]}/${d.getFullYear()}`;
    sessoesPorMesMap.set(key, (sessoesPorMesMap.get(key) || 0) + 1);
  }
  const sessoesPorMes = Array.from(sessoesPorMesMap.entries())
    .sort((a, b) => {
      const [ma, ya] = a[0].split("/");
      const [mb, yb] = b[0].split("/");
      const ia = meses.indexOf(ma);
      const ib = meses.indexOf(mb);
      return parseInt(ya) - parseInt(yb) || ia - ib;
    })
    .map(([mes, quantidade]) => ({ mes, quantidade }));

  // Agrupar receita por mes
  const receitaPorMesMap = new Map<string, number>();
  for (const p of pagamentos) {
    const d = new Date(p.data);
    const key = `${meses[d.getMonth()]}/${d.getFullYear()}`;
    receitaPorMesMap.set(key, (receitaPorMesMap.get(key) || 0) + p.valor);
  }
  const receitaPorMes = Array.from(receitaPorMesMap.entries())
    .sort((a, b) => {
      const [ma, ya] = a[0].split("/");
      const [mb, yb] = b[0].split("/");
      const ia = meses.indexOf(ma);
      const ib = meses.indexOf(mb);
      return parseInt(ya) - parseInt(yb) || ia - ib;
    })
    .map(([mes, valor]) => ({ mes, valor }));

  // Status das sessoes
  const statusCount = { realizada: 0, agendada: 0, cancelada: 0, faltou: 0 };
  for (const s of sessoes) {
    if (statusCount[s.status as keyof typeof statusCount] !== undefined) {
      statusCount[s.status as keyof typeof statusCount]++;
    }
  }
  const statusSessoes = [
    { name: "Realizadas", value: statusCount.realizada, color: "#059669" },
    { name: "Agendadas", value: statusCount.agendada, color: "#2563eb" },
    { name: "Canceladas", value: statusCount.cancelada, color: "#dc2626" },
    { name: "Faltou", value: statusCount.faltou, color: "#d97706" },
  ].filter((s) => s.value > 0);

  return (
    <div className="fade-in">
      <RelatoriosClient
        sessoesPorMes={sessoesPorMes}
        receitaPorMes={receitaPorMes}
        statusSessoes={statusSessoes}
        resumo={{
          totalPacientes,
          totalSessoes,
          sessoesRealizadas,
          sessoesCanceladas,
          receitaTotal,
          mediaMensal,
          taxa,
        }}
      />
    </div>
  );
}
