"use client";

import { useState, useRef } from "react";
import { Upload, File, Image, Trash2, X, FileText, Download, Paperclip, CheckCircle } from "lucide-react";
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
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getFileIcon(tipo: string) {
  if (tipo.startsWith("image/")) return <Image className="w-5 h-5 text-blue-400" />;
  if (tipo === "application/pdf") return <FileText className="w-5 h-5 text-red-400" />;
  return <File className="w-5 h-5 text-slate-400" />;
}

function getFileExtension(nome: string): string {
  const ext = nome.split(".").pop()?.toUpperCase() || "";
  return ext;
}

export function ArquivosPaciente({ pacienteId, arquivos, modoEdicao = false }: ArquivosPacienteProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file || file.size === 0) return;

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
        setTimeout(() => setMensagem(""), 3000);
      }
    } catch {
      setMensagem("Erro ao enviar arquivo.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
  }

  async function handleDelete(arquivoId: string) {
    if (!confirm("Tem certeza que deseja excluir este arquivo?")) return;
    const result = await deleteArquivo(arquivoId, pacienteId);
    if (result.error) {
      setMensagem(result.error);
    }
  }

  const imagens = arquivos.filter((a) => a.tipo.startsWith("image/"));
  const outrosArquivos = arquivos.filter((a) => !a.tipo.startsWith("image/"));

  return (
    <div className="space-y-5">
      {/* Área de Upload */}
      {modoEdicao && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            id="arquivo-upload"
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 p-6 text-center
              ${dragOver 
                ? "border-blue-400 bg-blue-500/10" 
                : "border-slate-600 bg-slate-800/30 hover:border-slate-500 hover:bg-slate-800/50"
              }
            `}
          >
            <div className="flex flex-col items-center gap-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                dragOver ? "bg-blue-500/20" : "bg-slate-700/50"
              }`}>
                <Upload className={`w-5 h-5 ${dragOver ? "text-blue-400" : "text-slate-400"}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-300">
                  {isUploading ? "Enviando arquivo..." : "Clique ou arraste o arquivo aqui"}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  JPG, PNG, GIF, PDF, DOC, TXT — Máximo 10MB
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mensagem de sucesso/erro */}
      {mensagem && (
        <div className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-lg ${
          mensagem.includes("sucesso") 
            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
            : "bg-red-500/10 text-red-400 border border-red-500/20"
        }`}>
          {mensagem.includes("sucesso") ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <X className="w-4 h-4 shrink-0" />
          )}
          <span className="flex-1">{mensagem}</span>
          <button onClick={() => setMensagem("")} className="hover:opacity-70 shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Grid de Imagens */}
      {imagens.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Image className="w-3.5 h-3.5" />
            Imagens ({imagens.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {imagens.map((arquivo) => (
              <div key={arquivo.id} className="group relative rounded-lg overflow-hidden border border-slate-700 bg-slate-800/50">
                <a href={arquivo.caminho} target="_blank" rel="noopener noreferrer" className="block">
                  <img
                    src={arquivo.caminho}
                    alt={arquivo.nomeOriginal}
                    className="w-full h-28 object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                </a>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
                  <p className="text-[11px] text-white/90 truncate font-medium">{arquivo.nomeOriginal}</p>
                  <p className="text-[10px] text-white/60">{formatBytes(arquivo.tamanho)}</p>
                </div>
                {modoEdicao && (
                  <button
                    onClick={() => handleDelete(arquivo.id)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500/90 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                    title="Excluir"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Documentos */}
      {outrosArquivos.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Paperclip className="w-3.5 h-3.5" />
            Documentos ({outrosArquivos.length})
          </h4>
          <div className="space-y-2">
            {outrosArquivos.map((arquivo) => (
              <div
                key={arquivo.id}
                className="group flex items-center gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/60 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-700/60 flex items-center justify-center shrink-0">
                  {getFileIcon(arquivo.tipo)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {arquivo.nomeOriginal}
                  </p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400 text-[10px] font-medium">
                      {getFileExtension(arquivo.nomeOriginal)}
                    </span>
                    <span>{formatBytes(arquivo.tamanho)}</span>
                    <span>•</span>
                    <span>{new Date(arquivo.createdAt).toLocaleDateString("pt-BR")}</span>
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a
                    href={arquivo.caminho}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                    title="Abrir / Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  {modoEdicao && (
                    <button
                      onClick={() => handleDelete(arquivo.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {arquivos.length === 0 && (
        <div className="text-center py-10">
          <div className="w-14 h-14 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-3">
            <Paperclip className="w-6 h-6 text-slate-600" />
          </div>
          <p className="text-sm text-slate-500 font-medium">Nenhum arquivo anexado</p>
          {modoEdicao && (
            <p className="text-xs text-slate-600 mt-1">Arraste ou clique acima para enviar</p>
          )}
        </div>
      )}
    </div>
  );
}
