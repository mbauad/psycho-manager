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
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { Printer, Users, Calendar, DollarSign, Activity, TrendingUp } from "lucide-react";

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

const CARD_COLORS = [
  { bg: "rgba(37, 99, 235, 0.15)", iconColor: "#2563eb", border: "rgba(37, 99, 235, 0.3)" },
  { bg: "rgba(5, 150, 105, 0.15)", iconColor: "#059669", border: "rgba(5, 150, 105, 0.3)" },
  { bg: "rgba(139, 92, 246, 0.15)", iconColor: "#8b5cf6", border: "rgba(139, 92, 246, 0.3)" },
  { bg: "rgba(217, 119, 6, 0.15)", iconColor: "#d97706", border: "rgba(217, 119, 6, 0.3)" },
];

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

  const stats: {
    label: string;
    value: string | number;
    icon: React.ElementType;
    bg: string;
    iconColor: string;
    border: string;
    suffix?: string;
  }[] = [
    {
      label: "Total Pacientes",
      value: resumo.totalPacientes,
      icon: Users,
      ...CARD_COLORS[0],
    },
    {
      label: "Total de Sessoes",
      value: resumo.totalSessoes,
      icon: Calendar,
      ...CARD_COLORS[1],
    },
    {
      label: "Receita Total",
      value: `R$ ${resumo.receitaTotal.toFixed(2)}`,
      icon: DollarSign,
      ...CARD_COLORS[2],
    },
    {
      label: "Media Mensal",
      value: `${resumo.mediaMensal}`,
      suffix: "sessoes",
      icon: Activity,
      ...CARD_COLORS[3],
    },
  ];

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
          <p className="page-subtitle">Visao geral da sua clinica</p>
        </div>
        <button
          onClick={handlePrint}
          className="btn btn-primary no-print"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            borderRadius: 12,
            fontWeight: 600,
            boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
          }}
        >
          <Printer className="w-4 h-4" />
          Imprimir / Salvar PDF
        </button>
      </div>

      <div ref={printRef} className="print-area">
        {/* Cards resumo modernos */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 20,
            marginBottom: 24,
          }}
        >
          {stats.map((s, i) => (
            <div
              key={i}
              style={{
                background: "linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))",
                border: `1px solid ${s.border}`,
                borderRadius: 16,
                padding: 24,
                display: "flex",
                alignItems: "center",
                gap: 16,
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              className="stat-card-hover"
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: s.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <s.icon size={24} color={s.iconColor} />
              </div>
              <div>
                <p
                  style={{
                    fontSize: 13,
                    color: "#94a3b8",
                    fontWeight: 500,
                    marginBottom: 4,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {s.label}
                </p>
                <p
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: "#f8fafc",
                    lineHeight: 1.2,
                  }}
                >
                  {s.value}
                </p>
                {s.suffix && (
                  <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{s.suffix}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Graficos - linha 1 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
          }}
        >
          {/* Sessoes por mes */}
          <div
            style={{
              background: "linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))",
              border: "1px solid rgba(148, 163, 184, 0.1)",
              borderRadius: 16,
              padding: 24,
            }}
          >
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#f1f5f9" }}>Sessoes por Mes</h3>
              <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Evolucao da quantidade de atendimentos</p>
            </div>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sessoesPorMes}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                      <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
                  <XAxis
                    dataKey="mes"
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(148,163,184,0.15)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15, 23, 42, 0.95)",
                      border: "1px solid rgba(148,163,184,0.2)",
                      borderRadius: 10,
                      color: "#f1f5f9",
                      fontSize: 13,
                    }}
                    cursor={{ fill: "rgba(59, 130, 246, 0.08)" }}
                  />
                  <Bar dataKey="quantidade" fill="url(#barGradient)" animationDuration={1200} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status das sessoes */}
          <div
            style={{
              background: "linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))",
              border: "1px solid rgba(148, 163, 184, 0.1)",
              borderRadius: 16,
              padding: 24,
            }}
          >
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#f1f5f9" }}>Status das Sessoes</h3>
              <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Distribuicao por situacao</p>
            </div>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusSessoes}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                    animationDuration={1200}
                  >
                    {statusSessoes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15, 23, 42, 0.95)",
                      border: "1px solid rgba(148,163,184,0.2)",
                      borderRadius: 10,
                      color: "#f1f5f9",
                      fontSize: 13,
                    }}
                    formatter={(value: number, name: string) => [`${value} sessoes`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Legendas customizadas */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 16,
                  flexWrap: "wrap",
                  marginTop: -10,
                }}
              >
                {statusSessoes.map((s) => (
                  <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 3,
                        background: s.color,
                      }}
                    />
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>
                      {s.name} ({s.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Receita por mes - Area Chart */}
        <div
          style={{
            background: "linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))",
            border: "1px solid rgba(148, 163, 184, 0.1)",
            borderRadius: 16,
            padding: 24,
            marginTop: 20,
          }}
        >
          <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "rgba(5, 150, 105, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrendingUp size={18} color="#059669" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#f1f5f9" }}>Receita por Mes</h3>
              <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Evolucao financeira da clinica</p>
            </div>
          </div>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={receitaPorMes}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
                <XAxis
                  dataKey="mes"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  axisLine={{ stroke: "rgba(148,163,184,0.15)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `R$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid rgba(148,163,184,0.2)",
                    borderRadius: 10,
                    color: "#f1f5f9",
                    fontSize: 13,
                  }}
                  formatter={(value) =>
                    typeof value === "number" ? `R$ ${value.toFixed(2)}` : value
                  }
                />
                <Area
                  type="monotone"
                  dataKey="valor"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="url(#areaGradient)"
                  animationDuration={1500}
                  dot={{ r: 4, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#34d399", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resumo detalhado */}
        <div
          style={{
            background: "linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))",
            border: "1px solid rgba(148, 163, 184, 0.1)",
            borderRadius: 16,
            padding: 24,
            marginTop: 20,
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#f1f5f9" }}>Resumo Detalhado</h3>
            <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Indicadores gerais da clinica</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[
              { label: "Total de sessoes", value: resumo.totalSessoes },
              { label: "Sessoes realizadas", value: resumo.sessoesRealizadas },
              { label: "Sessoes canceladas", value: resumo.sessoesCanceladas },
              { label: "Pacientes ativos", value: resumo.totalPacientes },
              {
                label: "Taxa de comparecimento",
                value: `${resumo.taxa}%`,
                color: resumo.taxa >= 80 ? "#34d399" : resumo.taxa >= 50 ? "#fbbf24" : "#f87171",
              },
              { label: "Media de sessoes/mes", value: `${resumo.mediaMensal}` },
              { label: "Receita total", value: `R$ ${resumo.receitaTotal.toFixed(2)}` },
            ].map((item, i, arr) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 16px",
                  background: i % 2 === 0 ? "rgba(148, 163, 184, 0.03)" : "transparent",
                  borderRadius: 10,
                }}
              >
                <span style={{ fontSize: 14, color: "#94a3b8", fontWeight: 500 }}>{item.label}</span>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: (item as any).color || "#f8fafc",
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
