import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, FileText, Calendar, User, FileSignature, Clock, Pencil } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type PageProps = { params: Promise<{ id: string }> };

export default async function PacienteDetalhePage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id } = await params;

  const paciente = await db.paciente.findFirst({
    where: { id, userId: session.user.id },
    include: { prontuario: true, sessoes: { orderBy: { dataHoraInicio: "desc" }, take: 5 } },
  });

  if (!paciente) return notFound();

  return (
    <div className="fade-in">
      <div className="detail-header">
        <Link href="/pacientes" className="detail-back-btn">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="page-title">Perfil do Paciente</h1>
          <p className="page-subtitle">{paciente.nomeCompleto}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24 }}>
        <div className="detail-aside">
          <div className="detail-avatar" style={{ fontSize: 28 }}>
            <User />
          </div>
          <h2 style={{ textAlign: "center", fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{paciente.nomeCompleto}</h2>
          <p style={{ textAlign: "center", fontSize: 13, color: "#64748b", marginBottom: 24 }}>
            Cadastrado em {format(new Date(paciente.createdAt), "d MMM yyyy", { locale: ptBR })}
          </p>

          <div>
            {paciente.telefone && (
              <div className="detail-info-item">
                <div className="detail-info-icon"><Phone /></div>
                <div>
                  <p className="detail-info-label">Telefone</p>
                  <p className="detail-info-value">{paciente.telefone}</p>
                </div>
              </div>
            )}
            {paciente.cpf && (
              <div className="detail-info-item">
                <div className="detail-info-icon"><FileText /></div>
                <div>
                  <p className="detail-info-label">CPF</p>
                  <p className="detail-info-value">{paciente.cpf}</p>
                </div>
              </div>
            )}
            {paciente.dataNascimento && (
              <div className="detail-info-item">
                <div className="detail-info-icon"><Calendar /></div>
                <div>
                  <p className="detail-info-label">Nascimento</p>
                  <p className="detail-info-value">{format(new Date(paciente.dataNascimento), "d/MM/yyyy")}</p>
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 8 }}>
            <Link href={`/pacientes/${id}/editar`} className="btn btn-secondary" style={{ justifyContent: "center" }}>
              <Pencil className="w-4 h-4" />
              Editar Dados
            </Link>
            <Link href={`/pacientes/${id}/prontuario`} className="btn btn-primary" style={{ justifyContent: "center" }}>
              <FileSignature className="w-4 h-4" />
              Prontuario
            </Link>
            <Link href="/sessoes/nova" className="btn btn-secondary" style={{ justifyContent: "center" }}>
              <Clock className="w-4 h-4" />
              Agendar Sessao
            </Link>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Resumo Clinico</h2>
            </div>
            <div className="card-body">
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>Queixa Principal</p>
                <p style={{ fontSize: 14, color: "#334155" }}>
                  {paciente.queixaPrincipal || paciente.prontuario?.queixaPrincipal || "-"}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>Observacoes</p>
                <p style={{ fontSize: 14, color: "#334155", whiteSpace: "pre-wrap" }}>
                  {paciente.observacoes || paciente.prontuario?.observacoes || "Nenhuma observacao registrada."}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Ultimas Sessoes</h2>
              <Link href="/sessoes" className="btn btn-ghost btn-sm">Ver todas</Link>
            </div>
            <div className="card-body">
              {paciente.sessoes.length === 0 ? (
                <div className="empty-state" style={{ padding: "30px 20px" }}>
                  <Clock className="empty-state-icon" style={{ width: 40, height: 40 }} />
                  <p className="empty-state-desc">Nenhuma sessao registrada</p>
                </div>
              ) : (
                <div className="session-list">
                  {paciente.sessoes.map((s) => (
                    <div key={s.id} className="session-card">
                      <div className="session-card-date">
                        <span className="session-card-date-day">{format(new Date(s.dataHoraInicio), "d")}</span>
                        <span className="session-card-date-month">{format(new Date(s.dataHoraInicio), "MMM")}</span>
                      </div>
                      <div className="session-card-content">
                        <p className="session-card-name" style={{ textTransform: "capitalize" }}>{s.tipo} / {s.modalidade}</p>
                        <p className="session-card-time">{format(new Date(s.dataHoraInicio), "HH:mm")} — {s.descricao || "-"}</p>
                      </div>
                      <Link href={`/sessoes/${s.id}`} className="btn btn-ghost btn-sm">Abrir</Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}