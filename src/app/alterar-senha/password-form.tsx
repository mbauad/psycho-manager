"use client";

import { useState } from "react";
import { alterarSenhaObrigatoria } from "./actions";
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
    const result = await alterarSenhaObrigatoria(formData);

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      {success && (
        <div className="alert alert-success" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <CheckCircle className="w-4 h-4" />
          Senha alterada com sucesso! Redirecionando...
        </div>
      )}

      {error && (
        <div className="alert alert-error" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

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

      <div className="form-group">
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

      <button type="submit" disabled={loading || success} className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: 8 }}>
        <KeyRound className="w-4 h-4" />
        {loading ? "Alterando..." : "Definir Nova Senha"}
      </button>
    </form>
  );
}
