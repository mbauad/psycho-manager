import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { FinanceiroClient } from "./financeiro-client";

export default async function FinanceiroPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const pagamentos = await db.pagamento.findMany({
    where: { userId: session.user.id },
    include: { paciente: true },
    orderBy: { data: "desc" },
  });

  const pacientes = await db.paciente.findMany({
    where: { userId: session.user.id },
    select: { id: true, nomeCompleto: true },
    orderBy: { nomeCompleto: "asc" },
  });

  const totalRecebido = pagamentos.filter((p) => p.status === "recebido").reduce((sum, p) => sum + p.valor, 0);
  const totalPendente = pagamentos.filter((p) => p.status === "pendente").reduce((sum, p) => sum + p.valor, 0);
  const totalCancelado = pagamentos.filter((p) => p.status === "cancelado").reduce((sum, p) => sum + p.valor, 0);

  return (
    <FinanceiroClient
      pagamentos={pagamentos.map((p) => ({
        id: p.id,
        valor: p.valor,
        data: p.data.toISOString(),
        tipo: p.tipo,
        formaPagamento: p.formaPagamento || null,
        status: p.status,
        paciente: p.paciente ? { nomeCompleto: p.paciente.nomeCompleto } : null,
        observacoes: p.observacoes,
      }))}
      pacientes={pacientes}
      totalRecebido={totalRecebido}
      totalPendente={totalPendente}
      totalCancelado={totalCancelado}
    />
  );
}