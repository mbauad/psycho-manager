import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Settings, KeyRound } from "lucide-react";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";

export default async function ConfiguracoesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const config = await db.configuracao.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Configuracoes</h1>
          <p className="page-subtitle">Personalize seu perfil profissional</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 700, marginBottom: 24 }}>
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Settings className="w-5 h-5" style={{ color: "#64748b" }} />
            <h2 className="card-title">Dados Profissionais</h2>
          </div>
        </div>
        <div className="card-body">
          <ProfileForm
            initial={{
              nome: config?.nome ?? "",
              especialidade: config?.especialidade ?? "",
              croCfp: config?.croCfp ?? "",
              telefone: config?.telefone ?? "",
              email: config?.email ?? "",
              endereco: config?.endereco ?? "",
              valorSessao: config?.valorSessao ?? 0,
              tempoSessao: config?.tempoSessao ?? 50,
            }}
          />
        </div>
      </div>

      <div className="card" style={{ maxWidth: 700 }}>
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <KeyRound className="w-5 h-5" style={{ color: "#64748b" }} />
            <h2 className="card-title">Seguranca</h2>
          </div>
        </div>
        <div className="card-body">
          <PasswordForm />
        </div>
      </div>
    </div>
  );
}