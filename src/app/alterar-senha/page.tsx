import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { KeyRound, ShieldAlert } from "lucide-react";
import { PasswordForm } from "./password-form";

export default async function AlterarSenhaPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="login-page">
      <section className="login-left">
        <div className="login-left-brand">
          <div className="login-left-brand-icon">PM</div>
          <span className="login-left-brand-text">PsychoManager</span>
        </div>

        <div className="login-left-content">
          <p className="login-left-tag">Seguranca</p>
          <h1 className="login-left-title">
            Proteja sua conta.
          </h1>
          <p className="login-left-desc">
            Para continuar utilizando o sistema, voce precisa definir uma nova senha pessoal. Isso garante a seguranca dos seus dados e dos seus pacientes.
          </p>
        </div>

        <div className="login-left-footer">
          Sistema de gestao para consultorios de psicologia
        </div>
      </section>

      <section className="login-right">
        <div className="login-form-wrapper">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldAlert className="w-5 h-5" style={{ color: "#fff" }} />
            </div>
            <div>
              <h2 className="login-form-title" style={{ marginBottom: 0 }}>
                Alterar Senha
              </h2>
              <p className="login-form-subtitle" style={{ marginTop: 2 }}>
                Defina uma nova senha para continuar
              </p>
            </div>
          </div>

          <div
            style={{
              background: "rgba(245, 158, 11, 0.1)",
              border: "1px solid rgba(245, 158, 11, 0.2)",
              borderRadius: 8,
              padding: "12px 16px",
              marginBottom: 20,
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
            }}
          >
            <ShieldAlert className="w-4 h-4" style={{ color: "#f59e0b", marginTop: 2, flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: "#d97706", lineHeight: 1.5, margin: 0 }}>
              Sua conta foi criada com uma senha temporaria. Por seguranca, voce deve definir uma nova senha antes de acessar o sistema.
            </p>
          </div>

          <PasswordForm />
        </div>
      </section>
    </div>
  );
}
