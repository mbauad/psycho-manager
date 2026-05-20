"use client";

import { useState } from "react";
import { updatePassword } from "./actions";
import { KeyRound, CheckCircle, AlertCircle } from "lucide-react";

export function PasswordForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await updatePassword(formData);

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      e.currentTarget.reset();
    }
  };

  return (
    <form onSubmit={onSubmit} className="fade-in">
      {success && (
        <div className="alert alert-success" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <CheckCircle className="w-4 h-4" />
          Senha alterada com sucesso!
        </div>
      )}

      {error && (
        <div className="alert alert-error" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="form-group">
          <label className="form-label">Senha Atual</label>
          <input
            name="senhaAtual"
            type="password"
            required
            className="form-input"
            placeholder="Digite sua senha atual"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Nova Senha</label>
          <input
            name="novaSenha"
            type="password"
            required
            minLength={6}
            className="form-input"
            placeholder="Minimo 6 caracteres"
          />
        </div>
        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
          <label className="form-label">Confirmar Nova Senha</label>
          <input
            name="confirmarSenha"
            type="password"
            required
            minLength={6}
            className="form-input"
            placeholder="Repita a nova senha"
          />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
        <button type="submit" disabled={loading} className="btn btn-primary">
          <KeyRound className="w-4 h-4" />
          {loading ? "Alterando..." : "Alterar Senha"}
        </button>
      </div>
    </form>
  );
}
