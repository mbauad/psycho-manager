"use client";

import Link from "next/link";
import { format } from "date-fns";

interface SessaoDetalhesProps {
  sessao: {
    id: string;
    dataHoraInicio: string;
    dataHoraFim: string | null;
    tipo: string;
    modalidade: string;
    motivoConsulta: string | null;
    descricao: string | null;
    observacoes: string | null;
    status: string;
    paciente: { nomeCompleto: string } | null;
  };
}

export function SessaoDetalhesClient({ sessao }: SessaoDetalhesProps) {
  const statusStyles: Record<string, string> = {
    realizada: "bg-[oklch(0.92_0.15_140)] text-[oklch(0.45_0.12_140)]",
    agendada: "bg-[oklch(0.95_0.12_90)] text-[oklch(0.55_0.12_90)]",
    cancelada: "bg-[oklch(0.94_0.14_20)] text-[oklch(0.52_0.14_20)]",
    faltou: "bg-[oklch(0.94_0.01_250)] opacity-80",
  };

  const statusLabels: Record<string, string> = {
    realizada: "Realizada",
    agendada: "Agendada",
    cancelada: "Cancelada",
    faltou: "Faltou",
  };

  return (
    <div className="card space-y-4">
      <div className="space-y-3">
        <div>
          <p className="text-xs uppercase tracking-wide opacity-60 mb-1">Paciente</p>
          <p className="font-medium">{sessao.paciente?.nomeCompleto || "-"}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide opacity-60 mb-1">Data</p>
            <p className="font-medium">
              {format(new Date(sessao.dataHoraInicio), "d/MM/yyyy")}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide opacity-60 mb-1">Horario</p>
            <p className="font-medium">
              {format(new Date(sessao.dataHoraInicio), "HH:mm")}
              {sessao.dataHoraFim && ` - ${format(new Date(sessao.dataHoraFim), "HH:mm")}`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide opacity-60 mb-1">Tipo</p>
            <p className="font-medium capitalize">{sessao.tipo}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide opacity-60 mb-1">Modalidade</p>
            <p className="font-medium capitalize">{sessao.modalidade}</p>
          </div>
        </div>

        {sessao.motivoConsulta && (
          <div>
            <p className="text-xs uppercase tracking-wide opacity-60 mb-1">Motivo</p>
            <p className="font-medium">{sessao.motivoConsulta}</p>
          </div>
        )}

        {sessao.descricao && (
          <div>
            <p className="text-xs uppercase tracking-wide opacity-60 mb-1">Descricao</p>
            <p className="text-sm opacity-80">{sessao.descricao}</p>
          </div>
        )}

        {sessao.observacoes && (
          <div>
            <p className="text-xs uppercase tracking-wide opacity-60 mb-1">Observacoes</p>
            <p className="text-sm opacity-80">{sessao.observacoes}</p>
          </div>
        )}
      </div>
    </div>
  );
}