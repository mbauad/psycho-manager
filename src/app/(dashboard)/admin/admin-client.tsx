"use client";

import { useState } from "react";
import { Trash2, UserPlus, Shield, User } from "lucide-react";

interface UserItem {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
}

interface Props {
  users: UserItem[];
  createUser: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  updateUserRole: (userId: string, role: string) => Promise<{ error?: string; success?: boolean }>;
  deleteUser: (userId: string) => Promise<{ error?: string; success?: boolean }>;
}

export function AdminClient({ users, createUser, updateUserRole, deleteUser }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleCreate(formData: FormData) {
    setMessage("");
    setError("");
    const result = await createUser(formData);
    if (result.error) {
      setError(result.error);
    } else {
      setMessage("Usuário criado com sucesso!");
      setShowForm(false);
    }
  }

  async function handleRoleChange(userId: string, role: string) {
    setMessage("");
    setError("");
    const result = await updateUserRole(userId, role);
    if (result.error) {
      setError(result.error);
    } else {
      setMessage("Permissão atualizada!");
    }
  }

  async function handleDelete(userId: string) {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
    setMessage("");
    setError("");
    const result = await deleteUser(userId);
    if (result.error) {
      setError(result.error);
    } else {
      setMessage("Usuário excluído!");
    }
  }

  return (
    <div>
      {message && <div className="alert alert-success" style={{ marginTop: 16 }}>{message}</div>}
      {error && <div className="alert alert-error" style={{ marginTop: 16 }}>{error}</div>}

      <div style={{ marginTop: 24, marginBottom: 24 }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <UserPlus className="w-4 h-4" />
          {showForm ? "Cancelar" : "Novo Usuário"}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 32 }}>
          <div className="card-header">
            <div className="card-title">Criar Novo Usuário</div>
          </div>
          <div className="card-body">
            <form action={handleCreate}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Nome</label>
                  <input type="text" name="name" className="form-input" placeholder="Nome completo" required />
                </div>
                <div className="form-group">
                  <label className="form-label">E-mail</label>
                  <input type="email" name="email" className="form-input" placeholder="email@exemplo.com" required />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Senha</label>
                  <input type="password" name="password" className="form-input" placeholder="Mínimo 6 caracteres" required minLength={6} />
                </div>
                <div className="form-group">
                  <label className="form-label">Nível de Acesso</label>
                  <select name="role" className="form-select">
                    <option value="USER">Usuário</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary">Criar Usuário</button>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div className="card-title">Usuários ({users.length})</div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Permissão</th>
                  <th>Criado em</th>
                  <th style={{ width: 120 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name || "—"}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        className="form-select"
                        style={{ minWidth: 140, padding: "6px 32px 6px 10px", fontSize: 13 }}
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      >
                        <option value="USER">Usuário</option>
                        <option value="ADMIN">Administrador</option>
                      </select>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(user.id)}
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
                      Nenhum usuário encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
