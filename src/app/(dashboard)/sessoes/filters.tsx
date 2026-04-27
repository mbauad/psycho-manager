"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useCallback } from "react";

export function SessionFilters({ currentStatus }: { currentStatus: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "todos") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="filter-bar">
      <div className="search-box">
        <Search className="search-box-icon" />
        <input
          type="text"
          placeholder="Buscar por paciente..."
          defaultValue={searchParams.get("q") ?? ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              update("q", (e.target as HTMLInputElement).value);
            }
          }}
          className="search-box-input"
        />
      </div>

      <select
        value={currentStatus}
        onChange={(e) => update("status", e.target.value)}
        className="form-select"
        style={{ width: "auto", minWidth: 160 }}
      >
        <option value="todos">Todos os status</option>
        <option value="agendada">Agendada</option>
        <option value="realizada">Realizada</option>
        <option value="cancelada">Cancelada</option>
        <option value="faltou">Faltou</option>
      </select>
    </div>
  );
}