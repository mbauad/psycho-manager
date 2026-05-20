"use client";

import { useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Printer, TrendingUp } from "lucide-react";

interface RelatoriosClientProps {
  sessoesPorMes: { mes: string; quantidade: number }[];
  receitaPorMes: { mes: string; valor: number }[];
  statusSessoes: { name: string; value: number; color: string }[];
  resumo: {
    totalPacientes: number;
    totalSessoes: number;
    sessoesRealizadas: number;
    sessoesCanceladas: number;
    receitaTotal: number;
    mediaMensal: string;
    taxa: number;
  };
}

export function RelatoriosClient({
  sessoesPorMes,
  receitaPorMes,
  statusSessoes,
  resumo,
}: RelatoriosClientProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">Relatorios</h1>
          <p className="page-subtitle">Visao geral da sua clinica</p>
        </div>
        <button onClick={handlePrint} className="btn btn-primary no-print">
          <Printer className="w-4 h-4" />
          Imprimir / Salvar PDF
        </button>
      </div>

      <div ref={printRef} className="print-area">
        {/* Cards resumo */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-card-header">
              <p className="stat-card-label">Total Pacientes</p>
              <div className="stat-card-icon blue"><TrendingUp /></div>
            </div>
            <p className="stat-card-value">{resumo.totalPacientes}</p>
          </div>
          <div className="stat-card">
            <div className="stat-card-header">
              <p className="stat-card-label">Total de Sessoes</p>
              <div className="stat-card-icon green"><TrendingUp /></div>
            </div>
            <p className="stat-card-value">{resumo.totalSessoes}</p>
          </div>
          <div className="stat-card">
            <div className="stat-card-header">
              <p className="stat-card-label">Receita Total</p>
              <div className="stat-card-icon purple"><TrendingUp /></div>
            </div>
            <p className="stat-card-value">R$ {resumo.receitaTotal.toFixed(2)}</p>
          </div>
          <div className="stat-card">
            <div className="stat-card-header">
              <p className="stat-card-label">Media Mensal</p>
              <div className="stat-card-icon orange"><TrendingUp /></div>
            </div>
            <p className="stat-card-value">{resumo.mediaMensal} sessoes</p>
          </div>
        </div>

        {/* Graficos */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 24 }}>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Sessoes por Mes</h2>
            </div>
            <div className="card-body" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sessoesPorMes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantidade" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Status das Sessoes</h2>
            </div>
            <div className="card-body" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusSessoes}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {statusSessoes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header">
            <h2 className="card-title">Receita por Mes</h2>
          </div>
          <div className="card-body" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={receitaPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                <Line type="monotone" dataKey="valor" stroke="#059669" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resumo detalhado */}
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header">
            <h2 className="card-title">Resumo Detalhado</h2>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", flexDirection: "column" }}>
              {[
                { label: "Total de sessoes", value: resumo.totalSessoes },
                { label: "Sessoes realizadas", value: resumo.sessoesRealizadas },
                { label: "Sessoes canceladas", value: resumo.sessoesCanceladas },
                { label: "Pacientes ativos", value: resumo.totalPacientes },
                { label: "Taxa de comparecimento", value: `${resumo.taxa}%`, color: resumo.taxa >= 80 ? "#059669" : resumo.taxa >= 50 ? "#d97706" : "#dc2626" },
                { label: "Media de sessoes/mes", value: `${resumo.mediaMensal}` },
                { label: "Receita total", value: `R$ ${resumo.receitaTotal.toFixed(2)}` },
              ].map((item, i, arr) => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                  <span style={{ color: "#64748b", fontSize: 14 }}>{item.label}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100" style={{ color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
