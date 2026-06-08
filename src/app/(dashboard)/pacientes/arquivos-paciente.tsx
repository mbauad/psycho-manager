"use client";

import { useState, useRef } from "react";
import { Upload, File, Image, Trash2, X, FileText, Download } from "lucide-react";
import { uploadArquivo, deleteArquivo } from "./arquivos-actions";

interface Arquivo {
  id: string;
  nomeOriginal: string;
  tipo: string;
  tamanho: number;
  caminho: string;
  categoria: string;
  createdAt: Date;
}

interface ArquivosPacienteProps {
  pacienteId: string;
  arquivos: Arquivo[];
  modoEdicao?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getFileIcon(tipo: string) {
  if (tipo.startsWith("image/")) return <Image className="w-5 h-5" />;
  if (tipo === "application/pdf") return <FileText className="w-5 h-5" />;
  return <File className="w-5 h-5" />;
}

export function ArquivosPaciente({ pacienteId, arquivos, modoEdicao = false }: ArquivosPacienteProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setMensagem("");

    const formData = new FormData();
    formData.append("arquivo", file);

    try {
      const result = await uploadArquivo(pacienteId, formData);
      if (result.error) {
        setMensagem(result.error);
      } else {
        setMensagem("Arquivo enviado com sucesso!");
      }
    } catch {
      setMensagem("Erro ao enviar arquivo.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(arquivoId: string) {
    if (!confirm("Tem certeza que deseja excluir este arquivo?")) return;

    const result = await deleteArquivo(arquivoId, pacienteId);
    if (result.error) {
      setMensagem(result.error);
    } else {
      setMensagem("Arquivo excluído.");
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload */}
      {modoEdicao && (
        <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            id="arquivo-upload"
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <label
            htmlFor="arquivo-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <Upload className="w-8 h-8 text-slate-400" />
            <span className="text-sm text-slate-300">
              {isUploading ? "Enviando..." : "Clique para enviar imagem ou arquivo de diagnóstico"}
            </span>
            <span className="text-xs text-slate-500">
              JPG, PNG, GIF, PDF, DOC, DOCX, TXT (máx. 10MB)
            </span>
          </label>
        </div>
      )}

      {/* Mensagem */}
      {mensagem && (
        <div className={`text-sm p-3 rounded-lg flex items-center justify-between ${mensagem.includes("sucesso") || mensagem.includes("excluído") ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}>
          <span>{mensagem}</span>
          <button onClick={() => setMensagem("")} className="hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Lista de arquivos */}
      {arquivos.length > 0 ? (
        <div className="grid gap-3">
          {arquivos.map((arquivo) => (
            <div
              key={arquivo.id}
              className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                {getFileIcon(arquivo.tipo)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">
                  {arquivo.nomeOriginal}
                </p>
                <p className="text-xs text-slate-500">
                  {formatBytes(arquivo.tamanho)} • {new Date(arquivo.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={arquivo.caminho}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                  title="Visualizar / Download"
                >
                  <Download className="w-4 h-4" />
                </a>
                {modoEdicao && (
                  <button
                    onClick={() => handleDelete(arquivo.id)}
                    className="btn btn-ghost btn-sm text-red-400 hover:text-red-300"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500">
          <File className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Nenhum arquivo anexado</p>
        </div>
      )}

      {/* Preview de imagens */}
      {arquivos.some((a) => a.tipo.startsWith("image/")) && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-slate-400 mb-3">Imagens</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {arquivos
              .filter((a) => a.tipo.startsWith("image/"))
              .map((arquivo) => (
                <div key={arquivo.id} className="relative group">
                  <a href={arquivo.caminho} target="_blank" rel="noopener noreferrer">
                    <img
                      src={arquivo.caminho}
                      alt={arquivo.nomeOriginal}
                      className="w-full h-24 object-cover rounded-lg border border-slate-700 hover:border-slate-500 transition-colors"
                    />
                  </a>
                  {modoEdicao && (
                    <button
                      onClick={() => handleDelete(arquivo.id)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
