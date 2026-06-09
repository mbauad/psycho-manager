"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deletePaciente } from "./actions";

interface DeletePacienteButtonProps {
  pacienteId: string;
  nome: string;
}

export function DeletePacienteButton({ pacienteId, nome }: DeletePacienteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleClick() {
    if (!confirm(`Tem certeza que deseja excluir o paciente "${nome}"?\n\nEsta acao nao pode ser desfeita.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deletePaciente(pacienteId);
      if (result?.error) {
        alert(result.error);
      }
    } catch {
      alert("Erro ao excluir paciente.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDeleting}
      className="btn btn-ghost btn-sm"
      style={{ color: "#dc2626" }}
      title="Excluir paciente"
    >
      <Trash2 className="w-3 h-3" />
      {isDeleting ? "Excluindo..." : "Excluir"}
    </button>
  );
}
