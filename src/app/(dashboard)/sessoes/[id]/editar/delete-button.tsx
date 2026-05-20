"use client";

import { Trash2 } from "lucide-react";

export function DeleteButton() {
  return (
    <button
      type="submit"
      className="btn btn-danger"
      onClick={(e) => {
        if (!confirm("Excluir esta sessao?")) {
          e.preventDefault();
        }
      }}
    >
      <Trash2 className="w-4 h-4" />
      Excluir
    </button>
  );
}
