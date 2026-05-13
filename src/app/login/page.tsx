"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

function LoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await signIn("credentials", { email, password, redirect: false });

      if (res?.error) {
        setError("Credenciais invalidas. Verifique seu e-mail e senha.");
      } else {
        window.location.href = "/dashboard";
      }
    } catch {
      setError("Ocorreu um erro ao tentar fazer login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      {error && <div className="login-form-error">{error}</div>}

      <div className="form-group">
        <label className="form-label" htmlFor="email">E-mail</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="form-input"
          placeholder="seu@email.com"
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="password">Senha</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="form-input"
          placeholder="Sua senha"
        />
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ width: "100%" }}>
        {loading ? "Entrando..." : "Entrar"}
      </button>

      <p className="login-form-link" style={{ fontSize: 12, color: "#94a3b8" }}>
        Acesso restrito. Entre em contato com o administrador.
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="login-page">
      <section className="login-left">
        <div className="login-left-brand">
          <div className="login-left-brand-icon">PM</div>
          <span className="login-left-brand-text">PsychoManager</span>
        </div>

        <div className="login-left-content">
          <p className="login-left-tag">Plataforma Clinica</p>
          <h1 className="login-left-title">
            Gestao completa para psicologos.
          </h1>
          <p className="login-left-desc">
            Pacientes, sessoes, prontuarios, agenda e financeiro — tudo em um unico lugar, com a seguranca que sua clinica precisa.
          </p>
        </div>

        <div className="login-left-footer">
          Sistema de gestao para consultorios de psicologia
        </div>
      </section>

      <section className="login-right">
        <div className="login-form-wrapper">
          <h2 className="login-form-title">Entrar</h2>
          <p className="login-form-subtitle">Acesse sua conta para continuar</p>
          <LoginForm />
        </div>
      </section>
    </div>
  );
}