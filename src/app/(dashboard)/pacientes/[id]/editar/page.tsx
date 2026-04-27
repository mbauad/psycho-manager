import { db } from "@/lib/db";
import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { UserPlus, ArrowLeft, CheckCircle } from "lucide-react";
import { updatePaciente } from "../../actions";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditarPacientePage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const paciente = await db.paciente.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!paciente) {
    return (
      <div className="fade-in">
        <div className="detail-header">
          <Link href="/pacientes" className="detail-back-btn">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="page-title">Paciente nao encontrado</h1>
          </div>
        </div>
      </div>
    );
  }

  const action = updatePaciente.bind(null, id);

  return (
    <div className="fade-in">
      <div className="detail-header">
        <Link href="/pacientes" className="detail-back-btn">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="page-title">Editar Paciente</h1>
          <p className="page-subtitle">{paciente.nomeCompleto}</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 700 }}>
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <UserPlus className="w-5 h-5" style={{ color: "#64748b" }} />
            <h2 className="card-title">Dados Pessoais</h2>
          </div>
        </div>
        <div className="card-body">
          <form action={action}>
            <div className="form-group">
              <label className="form-label">Nome completo *</label>
              <input name="nomeCompleto" required className="form-input" defaultValue={paciente.nomeCompleto} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div className="form-group">
                <label className="form-label">CPF</label>
                <input name="cpf" className="form-input" defaultValue={paciente.cpf ?? ""} />
              </div>
              <div className="form-group">
                <label className="form-label"> Data de nascimento</label>
                <input 
                  name="dataNascimento" 
                  type="date" 
                  className="form-input" 
                  defaultValue={paciente.dataNascimento ? new Date(paciente.dataNascimento).toISOString().split("T")[0] : ""} 
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div className="form-group">
                <label className="form-label">Telefone</label>
                <input name="telefone" className="form-input" defaultValue={paciente.telefone ?? ""} />
              </div>
              <div className="form-group">
                <label className="form-label">E-mail</label>
                <input name="email" type="email" className="form-input" defaultValue={paciente.email ?? ""} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Queixa principal</label>
              <textarea name="queixaPrincipal" rows={4} className="form-input" defaultValue={paciente.queixaPrincipal ?? ""} />
            </div>

            <div className="form-group">
              <label className="form-label">Observacoes</label>
              <textarea name="observacoes" rows={3} className="form-input" defaultValue={paciente.observacoes ?? ""} />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
              <Link href="/pacientes" className="btn btn-secondary"> Cancelar</Link>
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