"use client";

import { useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
  ComposedChart,
  Line,
} from "recharts";
import {
  Printer,
  Users,
  Calendar,
  DollarSign,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

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

  const kpis = [
    {
      label: "Pacientes",
      value: resumo.totalPacientes,
      icon: Users,
      gradient: "linear-gradient(135deg, #2563eb, #1d4ed8)",
      iconBg: "rgba(37, 99, 235, 0.2)",
      iconColor: "#60a5fa",
    },
    {
      label: "Sessoes",
      value: resumo.totalSessoes,
      icon: Calendar,
      gradient: "linear-gradient(135deg, #059669, #047857)",
      iconBg: "rgba(5, 150, 105, 0.2)",
      iconColor: "#34d399",
    },
    {
      label: "Receita",
      value: `R$ ${resumo.receitaTotal.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}`,
      icon: DollarSign,
      gradient: "linear-gradient(135deg, #7c3aed, #6d28d9)",
      iconBg: "rgba(124, 58, 237, 0.2)",
      iconColor: "#a78bfa",
    },
    {
      label: "Taxa Comparecimento",
      value: `${resumo.taxa}%`,
      icon: TrendingUp,
      gradient: "linear-gradient(135deg, #d97706, #b45309)",
      iconBg: "rgba(217, 119, 6, 0.2)",
      iconColor: "#fbbf24",
    },
  ];

  const statusIcon = {
    Realizadas: CheckCircle,
    Agendadas: Clock,
    Canceladas: XCircle,
    Faltou: AlertTriangle,
  };

  return (
    <div>
      {/* Header */}
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <h1 className="page-title">Relatorios</h1>
          <p className="page-subtitle">Painel completo da sua clinica</p>
        </div>
        <button
          onClick={handlePrint}
          className="btn btn-primary no-print"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 22px",
            borderRadius: 12,
            fontWeight: 600,
            boxShadow: "0 4px 16px rgba(37, 99, 235, 0.4)",
            fontSize: 14,
          }}
        >
          <Printer className="w-4 h-4" />
          Imprimir / PDF
        </button>
      </div>

      <div ref={printRef} className="print-area">
        {/* KPIs Premium */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {kpis.map((k, i) => (
            <div
              key={i}
              style={{
                background: k.gradient,
                borderRadius: 16,
                padding: "22px 24px",
                display: "flex",
                alignItems: "center",
                gap: 16,
                color: "white",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -20,
                  right: -20,
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.08)",
                }}
              />
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(4px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  zIndex: 1,
                }}
              >
                <k.icon size={22} color="white" />
              </div>
              <div style={{ zIndex: 1 }}>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    opacity: 0.85,
                    marginBottom: 4,
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                  }}
                >
                  {k.label}
                </p>
                <p
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    lineHeight: 1.1,
                  }}
                >
                  {k.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Grafico principal: Receita + Sessoes */}
        <div
          style={{
            background: "linear-gradient(145deg, rgba(30,41,59,0.95), rgba(15,23,42,0.98))",
            border: "1px solid rgba(148,163,184,0.08)",
            borderRadius: 20,
            padding: 28,
            marginBottom: 20,
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc" }}>
              Evolucao Mensal
            </h3>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
              Receita (R$) e quantidade de sessoes por mes
            </p>
          </div>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={receitaPorMes}>
                <defs>
                  <linearGradient id="receitaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
                <XAxis
                  dataKey="mes"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  axisLine={{ stroke: "rgba(148,163,184,0.1)" }}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `R$${v}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15, 23, 42, 0.97)",
                    border: "1px solid rgba(148,163,184,0.15)",
                    borderRadius: 12,
                    color: "#f1f5f9",
                    fontSize: 13,
                    padding: 12,
                  }}
                  formatter={(value, name) => {
                    if (name === "valor") return [`R$ ${Number(value).toFixed(2)}`, "Receita"];
                    return [value, name];
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, color: "#94a3b8", paddingTop: 12 }}
                  formatter={(value) => (value === "valor" ? "Receita (R$)" : value)}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="valor"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="url(#receitaGrad)"
                  dot={{ r: 5, fill: "#10b981", stroke: "#0f172a", strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: "#34d399" }}
                  animationDuration={1500}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grid: 2 colunas */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
          }}
        >
          {/* Sessoes por Mes */}
          <div
            style={{
              background: "linear-gradient(145deg, rgba(30,41,59,0.95), rgba(15,23,42,0.98))",
              border: "1px solid rgba(148,163,184,0.08)",
              borderRadius: 20,
              padding: 28,
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
          >
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc" }}>
                Sessoes por Mes
              </h3>
              <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                Quantidade de atendimentos mensais
              </p>
            </div>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sessoesPorMes}>
                  <defs>
                    <linearGradient id="sessoesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                      <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
                  <XAxis
                    dataKey="mes"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    axisLine={{ stroke: "rgba(148,163,184,0.1)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15, 23, 42, 0.97)",
                      border: "1px solid rgba(148,163,184,0.15)",
                      borderRadius: 10,
                      color: "#f1f5f9",
                      fontSize: 13,
                    }}
                    cursor={{ fill: "rgba(59,130,246,0.06)" }}
                  />
                  <Bar
                    dataKey="quantidade"
                    fill="url(#sessoesGrad)"
                    radius={[8, 8, 0, 0]}
                    animationDuration={1200}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status das Sessoes */}
          <div
            style={{
              background: "linear-gradient(145deg, rgba(30,41,59,0.95), rgba(15,23,42,0.98))",
              border: "1px solid rgba(148,163,184,0.08)",
              borderRadius: 20,
              padding: 28,
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
          >
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc" }}>
                Status das Sessoes
              </h3>
              <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                Distribuicao por situacao
              </p>
            </div>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusSessoes}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="rgba(15,23,42,0.9)"
                    strokeWidth={3}
                    animationDuration={1200}
                  >
                    {statusSessoes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15, 23, 42, 0.97)",
                      border: "1px solid rgba(148,163,184,0.15)",
                      borderRadius: 10,
                      color: "#f1f5f9",
                      fontSize: 13,
                    }}
                    formatter={(value, name) => [`${value} sessoes`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legendas modernas */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 14,
                flexWrap: "wrap",
                marginTop: 8,
              }}
            >
              {statusSessoes.map((s) => {
                const IconComp = (statusIcon as any)[s.name] || Activity;
                return (
                  <div
                    key={s.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: "rgba(148,163,184,0.06)",
                      padding: "6px 12px",
                      borderRadius: 20,
                    }}
                  >
                    <IconComp size={13} color={s.color} />
                    <span style={{ fontSize: 12, color: "#cbd5e1", fontWeight: 500 }}>
                      {s.name} ({s.value})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Resumo Detalhado Premium */}
        <div
          style={{
            background: "linear-gradient(145deg, rgba(30,41,59,0.95), rgba(15,23,42,0.98))",
            border: "1px solid rgba(148,163,184,0.08)",
            borderRadius: 20,
            padding: 28,
            marginTop: 20,
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          }}
        >
          <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Activity size={20} color="white" />
            </div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#f8fafc" }}>
                Resumo Detalhado
              </h3>
              <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                Indicadores completos da clinica
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 12,
            }}
          >
            {[
              { label: "Total de sessoes", value: resumo.totalSessoes, color: "#60a5fa" },
              { label: "Sessoes realizadas", value: resumo.sessoesRealizadas, color: "#34d399" },
              { label: "Sessoes canceladas", value: resumo.sessoesCanceladas, color: "#f87171" },
              { label: "Pacientes ativos", value: resumo.totalPacientes, color: "#a78bfa" },
              {
                label: "Taxa comparecimento",
                value: `${resumo.taxa}%`,
                color: resumo.taxa >= 80 ? "#34d399" : resumo.taxa >= 50 ? "#fbbf24" : "#f87171",
              },
              { label: "Media mensal", value: `${resumo.mediaMensal}`, color: "#f472b6" },
              {
                label: "Receita total",
                value: `R$ ${resumo.receitaTotal.toFixed(2)}`,
                color: "#fbbf24",
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: "rgba(148, 163, 184, 0.04)",
                  border: "1px solid rgba(148, 163, 184, 0.08)",
                  borderRadius: 14,
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
                  {item.label}
                </span>
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: item.color,
                    lineHeight: 1.2,
                  }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
