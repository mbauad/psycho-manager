"use client";

import { useState, useCallback } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AgendaSessao {
  id: string;
  dataHoraInicio: string;
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

  const firstDayOffset = start.getDay();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "realizada": return "green";
      case "agendada": return "blue";
      case "cancelada": return "red";
      case "faltou": return "orange";
      default: return "blue";
    }
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <h2 className="calendar-title">
          {format(currentDate, "MMMM yyyy", { locale: ptBR })}
        </h2>
        <div className="calendar-nav">
          <button type="button" onClick={prev} className="calendar-nav-btn">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentDate(new Date())}
            className="btn btn-ghost btn-sm"
          >
            Hoje
          </button>
          <button type="button" onClick={next} className="calendar-nav-btn">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((d) => (
          <div key={d} className="calendar-weekday">{d}</div>
        ))}

        {Array.from({ length: firstDayOffset }).map((_, i) => {
          const prevDay = new Date(start);
          prevDay.setDate(start.getDate() - (firstDayOffset - i));
          return (
            <div key={`empty-${i}`} className="calendar-day other-month">
              <div className="calendar-day-number">{prevDay.getDate()}</div>
            </div>
          );
        })}

        {days.map((day) => {
          const daySessions = sessions.filter((s) => isSameDay(new Date(s.dataHoraInicio), day));
          return (
            <div
              key={day.toISOString()}
              className={`calendar-day ${isToday(day) ? "today" : ""}`}
            >
              <div className="calendar-day-number">{format(day, "d")}</div>
              {daySessions.slice(0, 3).map((s) => (
                <div key={s.id} className={`calendar-event ${getStatusColor(s.status)}`}>
                  {format(new Date(s.dataHoraInicio), "HH:mm")} {s.paciente.nomeCompleto.split(" ")[0]}
                </div>
              ))}
              {daySessions.length > 3 && (
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                  +{daySessions.length - 3} mais
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}