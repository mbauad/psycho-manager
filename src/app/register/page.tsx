"use client";

import { useState } from "react";
import { registerUser } from "./actions";
import Link from "next/link";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const formData = new FormData(e.currentTarget);
    const res = await registerUser(formData);
    if (res?.error) {
      setErrors(res.error as Record<string, string[]>);
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <section className="login-left">
        <div className="login-left-brand">
          <img src="/logo.png?v=3" alt="Logo" style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover" }} />
          <span className="login-left-brand-text">PsychoManager</span>
        </div>

        <div className="login-left-content">
          <p className="login-left-tag">Plataforma Clínica</p>
          <h1 className="login-left-title">
            Comece a gerenciar sua clínica hoje.
          </h1>
          <p className="login-left-desc">
            Crie sua conta gratuita e tenha acesso a um sistema completo para gestão de pacientes, sessões, prontuários e financeiro.
          </p>
        </div>

        <div className="login-left-footer">
          Cadastro rápido e gratuito
        </div>
      </section>

      <section className="login-right">
        <div className="login-form-wrapper">
          <h2 className="login-form-title">Criar Conta</h2>
          <p className="login-form-subtitle">Preencha seus dados para começar</p>

          <form onSubmit={onSubmit}>
            {Object.keys(errors).length > 0 && (
              <div className="alert alert-error">Por favor, corrija os erros abaixo.</div>
            )}

            <div className="form-group">
              <label className="form-label">Nome completo</label>
              <input name="name" required className="form-input" placeholder="Seu nome" />
              {errors.name && <p className="form-error">{errors.name[0]}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input name="email" type="email" required className="form-input" placeholder="seu@email.com" />
              {errors.email && <p className="form-error">{errors.email[0]}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Senha</label>
              <input name="password" type="password" required className="form-input" placeholder="Minimo 6 caracteres" />
              {errors.password && <p className="form-error">{errors.password[0]}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirmar senha</label>
              <input name="confirmPassword" type="password" required className="form-input" placeholder="Repita a senha" />
              {errors.confirmPassword && <p className="form-error">{errors.confirmPassword[0]}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ width: "100%" }}>
              {loading ? "Criando conta..." : "Criar Conta"}
            </button>

            <p className="login-form-link">
              Já tem conta? <Link href="/login">Faça login</Link>
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}