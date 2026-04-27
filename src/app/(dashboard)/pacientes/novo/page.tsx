"use client";

import { useState, useRef } from "react";
import { createPaciente } from "../actions";
import Link from "next/link";
import { UserPlus, ArrowLeft } from "lucide-react";

export default function NovoPacientePage() {
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    await createPaciente(formData);
  };

  return (
    <div className="fade-in">
      <div className="detail-header">
        <Link href="/pacientes" className="detail-back-btn">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="page-title">Novo Paciente</h1>
          <p className="page-subtitle">Cadastre um novo paciente</p>
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
          <form ref={formRef} onSubmit={onSubmit}>
            <div className="form-group">
              <label className="form-label">Nome completo *</label>
              <input name="nomeCompleto" required className="form-input" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div className="form-group">
                <label className="form-label">CPF</label>
                <input name="cpf" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Data de nascimento</label>
                <input name="dataNascimento" type="date" className="form-input" />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div className="form-group">
                <label className="form-label">Telefone</label>
                <input name="telefone" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">E-mail</label>
                <input name="email" type="email" className="form-input" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Queixa principal</label>
              <textarea name="queixaPrincipal" rows={4} className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">Observacoes</label>
              <textarea name="observacoes" rows={3} className="form-input" />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
              <Link href="/pacientes" className="btn btn-secondary">Cancelar</Link>
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? "Salvando..." : "Cadastrar Paciente"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}