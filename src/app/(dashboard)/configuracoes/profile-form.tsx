"use client";

import { useState } from "react";
import { updateConfig } from "./actions";
import { Save, CheckCircle } from "lucide-react";

interface ProfileFormProps {
  initial: {
    nome: string | null;
    especialidade: string | null;
    croCfp: string | null;
    telefone: string | null;
    email: string | null;
    endereco: string | null;
    valorSessao: number | null;
    tempoSessao: number | null;
  };
}

export function ProfileForm({ initial }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    const formData = new FormData(e.currentTarget);
    await updateConfig(formData);
    setSuccess(true);
    setLoading(false);
  };

  return (
    <form onSubmit={onSubmit} className="fade-in">
      {success && (
        <div className="alert alert-success" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CheckCircle className="w-4 h-4" />
          Configuracoes salvas com sucesso!
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="form-group">
          <label className="form-label">Nome</label>
          <input name="nome" defaultValue={initial.nome ?? ""} className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label">Especialidade</label>
          <input name="especialidade" defaultValue={initial.especialidade ?? ""} className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label">CRO/CFP</label>
          <input name="croCfp" defaultValue={initial.croCfp ?? ""} className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label">Telefone</label>
          <input name="telefone" defaultValue={initial.telefone ?? ""} className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label">E-mail</label>
          <input name="email" type="email" defaultValue={initial.email ?? ""} className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label">Valor da Sessao (R$)</label>
          <input name="valorSessao" type="number" step="0.01" defaultValue={initial.valorSessao ?? ""} className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label">Tempo da Sessao (min)</label>
          <input name="tempoSessao" type="number" defaultValue={initial.tempoSessao ?? 50} className="form-input" />
        </div>
        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
          <label className="form-label">Endereco</label>
          <textarea name="endereco" rows={3} defaultValue={initial.endereco ?? ""} className="form-input" />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
        <button type="submit" disabled={loading} className="btn btn-primary">
          <Save className="w-4 h-4" />
          {loading ? "Salvando..." : "Salvar Configuracoes"}
        </button>
      </div>
    </form>
  );
}