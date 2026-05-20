import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, CheckCircle, Pencil, Trash2, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { deleteSessao, concluirSessao } from "../actions";

type PageProps = { params: Promise<{ id: string }> };

const statusBadge: Record<string, { label: string; class: string }> = {
  realizada: { label: "Realizada", class: "badge-green" },
  agendada: { label: "Agendada", class: "badge-blue" },
  cancelada: { label: "Cancelada", class: "badge-red" },
  faltou: { label: "Faltou", class: "badge-orange" },
};

export default async function SessaoDetalhePage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id } = await params;

  const sessao = await db.sessao.findFirst({
    where: { id, userId: session.user.id },
    include: { paciente: true },
  });

  if (!sessao) return notFound();

  const cfg = statusBadge[sessao.status] || { label: sessao.status, class: "badge-gray" };

  return (
    <div className="fade-in">
      <div className="detail-header">
        <Link href="/sessoes" className="detail-back-btn">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div style={{ flex: 1 }}>
          <h1 className="page-title">Sessao</h1>
          <p className="page-subtitle">
            {format(new Date(sessao.dataHoraInicio), "d MMMM yyyy 'as' HH:mm", { locale: ptBR })}
          </p>
        </div>
        <span className={`badge ${cfg.class}`} style={{ fontSize: 14, padding: "6px 16px" }}>{cfg.label}</span>
      </div>

      <div className="card" style={{ maxWidth: 700 }}>
        <div className="card-body">
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>Paciente</p>
                <p style={{ fontSize: 15, fontWeight: 600 }}>{sessao.paciente?.nomeCompleto || "-"}</p>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>Horario</p>
                <p style={{ fontSize: 15, fontWeight: 600 }}>
                  {format(new Date(sessao.dataHoraInicio), "HH:mm")}
                  {sessao.dataHoraFim && ` - ${format(new Date(sessao.dataHoraFim), "HH:mm")}`}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>Tipo</p>
                <p style={{ fontSize: 15, textTransform: "capitalize" }}>{sessao.tipo}</p>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>Modalidade</p>
                <p style={{ fontSize: 15, textTransform: "capitalize" }}>{sessao.modalidade}</p>
              </div>
            </div>

            {sessao.motivoConsulta && (
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>Motivo</p>
                <p style={{ fontSize: 14 }}>{sessao.motivoConsulta}</p>
              </div>
            )}

            {sessao.descricao && (
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>Descricao</p>
                <p style={{ fontSize: 14, whiteSpace: "pre-wrap" }}>{sessao.descricao}</p>
              </div>
            )}

            {sessao.observacoes && (
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>Observacoes</p>
                <p style={{ fontSize: 14 }}>{sessao.observacoes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="card-footer">
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <Link href="/sessoes" className="btn btn-secondary">
              <X className="w-4 h-4" />
              Fechar
            </Link>
            <Link href={`/sessoes/${id}/editar`} className="btn btn-secondary">
              <Pencil className="w-4 h-4" />
              Editar
            </Link>
            {sessao.status === "agendada" && (
              <form action={concluirSessao.bind(null, id)}>
                <button type="submit" className="btn btn-primary">
                  <CheckCircle className="w-4 h-4" />
                  Marcar como Realizada
                </button>
              </form>
            )}
            <form action={deleteSessao.bind(null, id)}>
              <button type="submit" className="btn btn-danger">
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}