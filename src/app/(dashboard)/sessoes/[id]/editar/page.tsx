import { db } from "@/lib/db";
import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Pencil, Trash2, CheckCircle, ArrowLeft } from "lucide-react";
import { updateSessao, deleteSessao } from "../../actions";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditarSessaoPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const sessao = await db.sessao.findFirst({
    where: { id, userId: session.user.id },
    include: { paciente: true },
  });

  if (!sessao) {
    return (
      <div className="fade-in">
        <div className="detail-header">
          <Link href="/sessoes" className="detail-back-btn">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="page-title">Sessao nao encontrada</h1>
          </div>
        </div>
      </div>
    );
  }

  const action = updateSessao.bind(null, id);

  const handleDelete = async () => {
    "use server";
    await deleteSessao(id);
    redirect("/sessoes");
  };

  return (
    <div className="fade-in">
      <div className="detail-header">
        <Link href="/sessoes" className="detail-back-btn">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="page-title">Editar Sessao</h1>
          <p className="page-subtitle">{sessao.paciente?.nomeCompleto}</p>
        </div>
        <form action={handleDelete} style={{ marginLeft: "auto" }}>
          <button type="submit" className="btn btn-danger" onClick={(e) => { if (!confirm("Excluir esta sessao?")) e.preventDefault(); }}>
            <Trash2 className="w-4 h-4" />
            Excluir
          </button>
        </form>
      </div>

      <div className="card" style={{ maxWidth: 700 }}>
        <div className="card-header">
          <h2 className="card-title">Dados da Sessao</h2>
        </div>
        <div className="card-body">
          <form action={action}>
            <div className="form-group">
              <label className="form-label">Paciente</label>
              <input className="form-input" value={sessao.paciente?.nomeCompleto ?? ""} disabled />
              <input type="hidden" name="pacienteId" value={sessao.pacienteId} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div className="form-group">
                <label className="form-label">Data e hora de inicio *</label>
                <input 
                  name="dataHoraInicio" 
                  type="datetime-local" 
                  required 
                  className="form-input" 
                  defaultValue={sessao.dataHoraInicio.toISOString().slice(0, 16)} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Data e hora de termino</label>
                <input 
                  name="dataHoraFim" 
                  type="datetime-local" 
                  className="form-input" 
                  defaultValue={sessao.dataHoraFim ? sessao.dataHoraFim.toISOString().slice(0, 16) : ""} 
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div className="form-group">
                <label className="form-label">Tipo</label>
                <select name="tipo" required className="form-select" defaultValue={sessao.tipo}>
                  <option value="particular">Particular</option>
                  <option value="institucional">Institucional</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Modalidade</label>
                <select name="modalidade" required className="form-select" defaultValue={sessao.modalidade}>
                  <option value="presencial">Presencial</option>
                  <option value="online">Online</option>
                  <option value="telefone">Telefone</option>
                  <option value="local">Local</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" required className="form-select" defaultValue={sessao.status}>
                <option value="agendada">Agendada</option>
                <option value="realizada">Realizada</option>
                <option value="cancelada">Cancelada</option>
                <option value="faltou">Faltou</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Motivo da consulta</label>
              <input name="motivoConsulta" className="form-input" defaultValue={sessao.motivoConsulta ?? ""} />
            </div>

            <div className="form-group">
              <label className="form-label">Descricao</label>
              <textarea name="descricao" rows={3} className="form-input" defaultValue={sessao.descricao ?? ""} />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
              <Link href="/sessoes" className="btn btn-secondary">Cancelar</Link>
              <button type="submit" className="btn btn-primary">
                <CheckCircle className="w-4 h-4" />
                Salvar Alteracoes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}