"use client";

import { useState, useCallback } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AgendaSessao {
  id: string;
  dataHoraInicio: string;
  dataHoraFim: string | null;
  status: string;
  paciente: { nomeCompleto: string };
}

interface AgendaClientProps {
  sessions: AgendaSessao[];
}

export function AgendaClient({ sessions }: AgendaClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const prev = useCallback(() => setCurrentDate((d) => subMonths(d, 1)), []);
  const next = useCallback(() => setCurrentDate((d) => addMonths(d, 1)), []);

  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start, end });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button type="button" onClick={prev} className="btn-ghost p-2">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h2 className="text-lg font-semibold">
          {format(currentDate, "MMMM yyyy", { locale: ptBR })}
        </h2>
        <button type="button" onClick={next} className="btn-ghost p-2">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((d) => (
          <div key={d} className="p-2 text-xs font-medium uppercase opacity-60">{d}</div>
        ))}
        {Array.from({ length: start.getDay() }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map((day) => {
          const daySessions = sessions.filter((s) => isSameDay(new Date(s.dataHoraInicio), day));
          return (
            <div
              key={day.toISOString()}
              className={`min-h-[80px] p-2 border rounded-lg ${isToday(day) ? "bg-[oklch(0.95_0.01_250)]" : ""}`}
            >
              <div className={`text-sm font-medium mb-1 ${isToday(day) ? "bg-[oklch(0.18_0.03_250)] text-white w-6 h-6 rounded-full flex items-center justify-center" : ""}`}>
                {format(day, "d")}
              </div>
              {daySessions.slice(0, 2).map((s) => (
                <div key={s.id} className="text-xs p-1 bg-[oklch(0.95_0.12_90)] rounded truncate">
                  {format(new Date(s.dataHoraInicio), "HH:mm")} {s.paciente.nomeCompleto}
                </div>
              ))}
              {daySessions.length > 2 && (
                <div className="text-xs opacity-60">+{daySessions.length - 2}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}