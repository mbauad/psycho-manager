"use client";

import { useState, useEffect, useRef } from "react";
import { createPagamento, deletePagamento, updatePagamento } from "./actions";
import { Plus, Pencil, Trash2, X, CheckCircle, CreditCard, TrendingUp, Clock } from "lucide-react";
import React from "react";

interface Paciente {
  id: string;
  nomeCompleto: string;
}

interface SessaoOption {
  id: string;
  dataHoraInicio: string;
  status: string;
}

interface Pagamento {
  id: string;
  valor: number;
  data: string;
  tipo: string;
  formaPagamento: string | null;
  status: string;
  paciente: { nomeCompleto: string } | null;
  observacoes: string | null;
}

interface FinanceiroClientProps {
  pagamentos: Pagamento[];
  pacientes: Paciente[];
  totalRecebido: number;
  totalPendente: number;
  totalCancelado: number;
}

export function FinanceiroClient({ pagamentos, pacientes, totalRecebido, totalPendente, totalCancelado }: FinanceiroClientProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);
  const [success, setSuccess] = useState(false);
  const [sessoes, setSessoes] = useState<SessaoOption[]>([]);
  const [pacienteSelecionado, setPacienteSelecionado] = useState("");

  const statusBadge: Record<string, string> = {
    recebido: "badge-green",
    pendente: "badge-orange",
    cancelado: "badge-red",
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    let res;
    if (editingId) {
      res = await updatePagamento(editingId, formData);
    } else {
      res = await createPagamento(formData);
    }
    
    setLoading(false);
    if (!res?.error) {
      setSuccess(true);
      setShowModal(false);
      setEditingId(null);
      if (formRef.current) {
        formRef.current.reset();
      }
      window.location.reload();
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Excluir este pagamento?")) return;
    await deletePagamento(id);
    window.location.reload();
  };

  const openEdit = (pagamento: Pagamento) => {
    setEditingId(pagamento.id);
    setShowModal(true);
  };

  const openCreate = () => {
    setEditingId(null);
    setPacienteSelecionado("");
    setSessoes([]);
    setShowModal(true);
  };

  useEffect(() => {
    if (!pacienteSelecionado) {
      setSessoes([]);
      return;
    }
    fetch(`/api/sessoes-paciente?pacienteId=${pacienteSelecionado}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSessoes(data);
      });
  }, [pacienteSelecionado]);

  const handleSessaoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sessaoId = e.target.value;
    const sessao = sessoes.find((s) => s.id === sessaoId);
    if (sessao && formRef.current) {
      const dataInput = formRef.current.querySelector<HTMLInputElement>('input[name="data"]');
      if (dataInput) {
        dataInput.value = new Date(sessao.dataHoraInicio).toISOString().split("T")[0];
      }
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">Financeiro</h1>
            <p className="page-subtitle">Controle de pagamentos e receitas</p>
          </div>
          <button onClick={openCreate} className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Novo Pagamento
          </button>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <p className="stat-card-label">Total Recebido</p>
            <div className="stat-card-icon green"><TrendingUp /></div>
          </div>
          <p className="stat-card-value" style={{ color: "#059669" }}>R$ {totalRecebido.toFixed(2)}</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <p className="stat-card-label">Pendente</p>
            <div className="stat-card-icon orange"><Clock /></div>
          </div>
          <p className="stat-card-value" style={{ color: "#d97706" }}>R$ {totalPendente.toFixed(2)}</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <p className="stat-card-label">Cancelado</p>
            <div className="stat-card-icon red"><CreditCard /></div>
          </div>
          <p className="stat-card-value" style={{ color: "#dc2626" }}>R$ {totalCancelado.toFixed(2)}</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <p className="stat-card-label">Total de Registros</p>
            <div className="stat-card-icon blue"><CreditCard /></div>
          </div>
          <p className="stat-card-value">{pagamentos.length}</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Historico de Pagamentos</h2>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Paciente</th>
                <th>Tipo</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Valor</th>
                <th style={{ textAlign: "right" }}>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {pagamentos.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <CreditCard className="empty-state-icon" />
                      <p className="empty-state-title">Nenhum pagamento registrado</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pagamentos.map((p) => (
                  <tr key={p.id}>
                    <td>{new Date(p.data).toLocaleDateString("pt-BR")}</td>
                    <td>{p.paciente?.nomeCompleto || "-"}</td>
                    <td style={{ textTransform: "capitalize" }}>{p.tipo}</td>
                    <td><span className={`badge ${statusBadge[p.status] || "badge-gray"}`}>{p.status}</span></td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>R$ {p.valor.toFixed(2)}</td>
                    <td>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                        <button onClick={() => openEdit(p)} className="btn btn-ghost btn-sm" style={{ color: "#2563eb" }}>
                          <Pencil className="w-3 h-3" />
                          Editar
                        </button>
                        <button onClick={() => onDelete(p.id)} className="btn btn-ghost btn-sm" style={{ color: "#dc2626" }}>
                          <Trash2 className="w-3 h-3" />
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingId ? "Editar Pagamento" : "Novo Pagamento"}</h3>
              <button onClick={() => setShowModal(false)} className="modal-close">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form ref={formRef} onSubmit={onSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Paciente</label>
                  <select
                    name="pacienteId"
                    className="form-select"
                    value={pacienteSelecionado}
                    onChange={(e) => setPacienteSelecionado(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {pacientes.map((p) => (
                      <option key={p.id} value={p.id}>{p.nomeCompleto}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Sessao vinculada</label>
                  <select name="sessaoId" className="form-select" onChange={handleSessaoChange}>
                    <option value="">Nenhuma / Manual...</option>
                    {sessoes.map((s) => (
                      <option key={s.id} value={s.id}>
                        {new Date(s.dataHoraInicio).toLocaleDateString("pt-BR")} - {s.status}
                      </option>
                    ))}
                  </select>
                  <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                    Selecione uma sessao para preencher a data automaticamente
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Valor (R$) *</label>
                    <input name="valor" type="number" step="0.01" required className="form-input" placeholder="0.00" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Data *</label>
                    <input name="data" type="date" required className="form-input" />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Tipo</label>
                    <select name="tipo" required className="form-select">
                      <option value="sessao">Sessao</option>
                      <option value="sinal">Sinal</option>
                      <option value="pacote">Pacote</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Forma de Pagamento</label>
                    <select name="formaPagamento" required className="form-select">
                      <option value="">Selecione...</option>
                      <option value="dinheiro">Dinheiro</option>
                      <option value="pix">PIX</option>
                      <option value="cartao">Cartao</option>
                      <option value="transferencia">Transferencia</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select name="status" required className="form-select">
                      <option value="pendente">Pendente</option>
                      <option value="recebido">Recebido</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Observacoes</label>
                  <textarea name="observacoes" rows={3} className="form-input" placeholder="Opcional" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? "Salvando..." : (editingId ? "Salvar Alteracoes" : "Criar Pagamento")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}