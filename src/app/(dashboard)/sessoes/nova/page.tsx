"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createSessao } from "../actions";
import { Calendar, ArrowLeft, Plus } from "lucide-react";

interface Paciente {
  id: string;
  nomeCompleto: string;
}

export default function NovaSessaoPage() {
  const [loading, setLoading] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState("");
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loadingPacientes, setLoadingPacientes] = useState(true);

  useEffect(() => {
    fetch("/api/pacientes")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPacientes(data);
        }
        setLoadingPacientes(false);
      })
      .catch(() => setLoadingPacientes(false));
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedPaciente) {
      return;
    }
    
    setLoading(true);
    const form = e.currentTarget;
    
    await createSessao(new FormData(form));
    window.location.href = "/sessoes";
  };

  return (
    <div className="fade-in">
      <div className="detail-header">
        <Link href="/sessoes" className="detail-back-btn">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="page-title">Nova Sessao</h1>
          <p className="page-subtitle">Agende uma nova sessao</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 700 }}>
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Calendar className="w-5 h-5" style={{ color: "#64748b" }} />
            <h2 className="card-title">Dados da Sessao</h2>
          </div>
        </div>
        <div className="card-body">
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label className="form-label">Paciente *</label>
              <select
                name="pacienteId"
                className="form-select"
                value={selectedPaciente}
                onChange={(e) => setSelectedPaciente(e.target.value)}
                required
                disabled={loadingPacientes}
              >
                <option value="">
                  {loadingPacientes ? "Carregando pacientes..." : "Selecione um paciente..."}
                </option>
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nomeCompleto}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div className="form-group">
                <label className="form-label">Data e Hora *</label>
                <input name="dataHoraInicio" type="datetime-local" required className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Tipo</label>
                <select name="tipo" required className="form-select">
                  <option value="particular">Particular</option>
                  <option value="institucional">Institucional</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div className="form-group">
                <label className="form-label">Modalidade</label>
                <select name="modalidade" required className="form-select">
                  <option value="presencial">Presencial</option>
                  <option value="online">Online</option>
                  <option value="telefone">Telefone</option>
                  <option value="local">Local</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select name="status" required className="form-select">
                  <option value="agendada">Agendada</option>
                  <option value="realizada">Realizada</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Motivo da consulta</label>
              <input name="motivoConsulta" className="form-input" placeholder="Ex: Terapia individual" />
            </div>

            <div className="form-group">
              <label className="form-label">Descricao</label>
              <textarea name="descricao" rows={3} className="form-input" placeholder="Detalhes da sessao" />
            </div>

            <div className="form-group">
              <label className="form-label">Observacoes</label>
              <textarea name="observacoes" rows={2} className="form-input" placeholder="Observacoes internas" />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
              <Link href="/sessoes" className="btn btn-secondary">Cancelar</Link>
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? "Salvando..." : "Agendar Sessao"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}