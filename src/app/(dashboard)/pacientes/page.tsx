import { db } from "@/lib/db";
import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Search, Plus, Users, Pencil, Trash2 } from "lucide-react";

type PageProps = { searchParams: Promise<{ q?: string }> };

export default async function PacientesPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { q } = await searchParams;
  const searchQuery = q ?? "";

  const pacientes = await db.paciente.findMany({
    where: {
      userId: session.user.id,
      ...(searchQuery ? {
        OR: [
          { nomeCompleto: { contains: searchQuery } },
          { cpf: { contains: searchQuery } },
          { telefone: { contains: searchQuery } },
          { email: { contains: searchQuery } },
        ],
      } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">Pacientes</h1>
            <p className="page-subtitle">{pacientes.length} paciente(s) cadastrado(s)</p>
          </div>
          <Link href="/pacientes/novo" className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Novo Paciente
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="filter-bar">
            <div className="search-box">
              <Search className="search-box-icon" />
              <form>
                <input
                  type="text"
                  name="q"
                  defaultValue={searchQuery}
                  placeholder="Buscar por nome, CPF, telefone..."
                  className="search-box-input"
                />
              </form>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Contato</th>
                  <th>Queixa</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {pacientes.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-state">
                        <Users className="empty-state-icon" />
                        <p className="empty-state-title">Nenhum paciente encontrado</p>
                        <p className="empty-state-desc">
                          {searchQuery ? "Tente outro termo de busca" : "Cadastre seu primeiro paciente"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pacientes.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{p.nomeCompleto}</div>
                        {p.cpf && <div style={{ fontSize: 12, color: "#94a3b8" }}>CPF: {p.cpf}</div>}
                      </td>
                      <td>
                        <div style={{ fontSize: 14 }}>{p.email || "-"}</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>{p.telefone || "-"}</div>
                      </td>
                      <td style={{ maxWidth: 200 }}>
                        <div style={{ fontSize: 13, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.queixaPrincipal || "-"}
                        </div>
                      </td>
                      <td><span className="badge badge-green">Ativo</span></td>
                      <td>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                          <Link href={`/pacientes/${p.id}`} className="btn btn-ghost btn-sm">
                            Ver
                          </Link>
                          <Link href={`/pacientes/${p.id}/editar`} className="btn btn-ghost btn-sm" style={{ color: "#2563eb" }}>
                            <Pencil className="w-3 h-3" />
                            Editar
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}