import { db } from "@/lib/db";
import { auth } from "@/auth";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { updateProntuario } from "../actions";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditarProntuarioPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id } = await params;

  const paciente = await db.paciente.findFirst({
    where: { id, userId: session.user.id },
    include: { prontuario: true },
  });

  if (!paciente) return notFound();

  const prontuario = paciente.prontuario;
  const action = updateProntuario.bind(null, id);

  return (
    <div className="fade-in">
      <div className="detail-header">
        <Link href={`/pacientes/${id}`} className="detail-back-btn">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="page-title">Prontuario</h1>
          <p className="page-subtitle">{paciente.nomeCompleto}</p>
        </div>
      </div>

      <form action={action}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Queixa e Historico</h2>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Queixa principal</label>
                <textarea name="queixaPrincipal" rows={4} className="form-input" defaultValue={prontuario?.queixaPrincipal ?? paciente.queixaPrincipal ?? ""} />
              </div>
              <div className="form-group">
                <label className="form-label">Historico familiar</label>
                <textarea name="historicoFamiliar" rows={3} className="form-input" defaultValue={prontuario?.historicoFamiliar ?? ""} />
              </div>
              <div className="form-group">
                <label className="form-label">Historico medico</label>
                <textarea name="historicoMedico" rows={3} className="form-input" defaultValue={prontuario?.historicoMedico ?? ""} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Saude e Tratamento</h2>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Uso de medicamentos</label>
                <textarea name="usoMedicamentos" rows={3} className="form-input" defaultValue={prontuario?.usoMedicamentos ?? ""} />
              </div>
              <div className="form-group">
                <label className="form-label">Alergias</label>
                <textarea name="alergias" rows={3} className="form-input" defaultValue={prontuario?.alergias ?? ""} />
              </div>
              <div className="form-group">
                <label className="form-label">Psicoterapia previa</label>
                <textarea name="previaPsicoterapia" rows={3} className="form-input" defaultValue={prontuario?.previaPsicoterapia ?? ""} />
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ maxWidth: 700 }}>
          <div className="card-header">
            <h2 className="card-title">Avaliacao e Plano</h2>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Avaliacao inicial</label>
              <textarea name="avaliacaoInicial" rows={5} className="form-input" defaultValue={prontuario?.avaliacaoInicial ?? ""} />
            </div>
            <div className="form-group">
              <label className="form-label">Plano de tratamento</label>
              <textarea name="planoTratamento" rows={5} className="form-input" defaultValue={prontuario?.planoTratamento ?? ""} />
            </div>
            <div className="form-group">
              <label className="form-label">Observacoes</label>
              <textarea name="observacoes" rows={4} className="form-input" defaultValue={prontuario?.observacoes ?? ""} />
            </div>
          </div>
          <div className="card-footer">
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <Link href={`/pacientes/${id}`} className="btn btn-secondary">Cancelar</Link>
              <button type="submit" className="btn btn-primary">
                <FileText className="w-4 h-4" />
                Salvar Prontuario
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}