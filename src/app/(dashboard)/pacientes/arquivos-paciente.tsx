"use client";

import { useState, useRef } from "react";
import { Upload, File, Image, Trash2, X, FileText, Download, Paperclip } from "lucide-react";
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
        setMensagem("");
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

  async function handleDelete(arquivoId: string) {
    if (!confirm("Excluir este arquivo?")) return;
    await deleteArquivo(arquivoId, pacienteId);
  }

  const imagens = arquivos.filter((a) => a.tipo.startsWith("image/"));
  const documentos = arquivos.filter((a) => !a.tipo.startsWith("image/"));

  return (
    <div>
      {/* Upload */}
      {modoEdicao && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            style={{ display: "none" }}
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            style={{
              cursor: "pointer",
              border: dragOver ? "2px dashed #3b82f6" : "2px dashed #475569",
              borderRadius: "10px",
              padding: "20px",
              textAlign: "center",
              background: dragOver ? "rgba(59,130,246,0.08)" : "rgba(30,41,59,0.4)",
              transition: "all 0.2s",
              marginBottom: "20px",
            }}
          >
            <Upload style={{ width: 24, height: 24, color: dragOver ? "#60a5fa" : "#64748b", margin: "0 auto 8px" }} />
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
              {isUploading ? "Enviando..." : "Clique ou arraste o arquivo aqui"}
            </p>
            <p style={{ fontSize: 11, color: "#475569", margin: "4px 0 0 0" }}>
              JPG, PNG, PDF, DOC — Máx. 10MB
            </p>
          </div>
        </>
      )}

      {/* Mensagem */}
      {mensagem && (
        <div style={{
          fontSize: 12,
          padding: "8px 12px",
          borderRadius: "6px",
          background: "rgba(239,68,68,0.1)",
          color: "#f87171",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <span>{mensagem}</span>
          <button onClick={() => setMensagem("")} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}>
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>
      )}

      {/* Imagens com miniatura */}
      {imagens.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <p style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 12,
          }}>
            Imagens ({imagens.length})
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10 }}>
            {imagens.map((arquivo) => (
              <div key={arquivo.id} style={{ position: "relative", borderRadius: 8, overflow: "hidden", border: "1px solid #334155" }}>
                <a href={arquivo.caminho} target="_blank" rel="noopener noreferrer">
                  <img
                    src={arquivo.caminho}
                    alt={arquivo.nomeOriginal}
                    style={{ width: "100%", height: 100, objectFit: "cover", display: "block" }}
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%231e293b'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%2364748b' font-size='10'%3EImagem%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </a>
                <div style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "16px 6px 4px",
                  background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                }}>
                  <p style={{ fontSize: 10, color: "#fff", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {arquivo.nomeOriginal}
                  </p>
                  <p style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", margin: 0 }}>
                    {formatBytes(arquivo.tamanho)}
                  </p>
                </div>
                {modoEdicao && (
                  <button
                    onClick={() => handleDelete(arquivo.id)}
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "rgba(239,68,68,0.9)",
                      border: "none",
                      color: "#fff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                    }}
                  >
                    <Trash2 style={{ width: 10, height: 10 }} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documentos com miniatura de ícone */}
      {documentos.length > 0 && (
        <div>
          <p style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 12,
          }}>
            Documentos ({documentos.length})
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {documentos.map((arquivo) => (
              <div
                key={arquivo.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "rgba(30,41,59,0.4)",
                  border: "1px solid #334155",
                }}
              >
                {/* Miniatura do arquivo */}
                <div style={{
                  width: 40,
                  height: 48,
                  borderRadius: 4,
                  background: arquivo.tipo === "application/pdf" ? "rgba(239,68,68,0.15)" : "rgba(59,130,246,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  position: "relative",
                }}>
                  {arquivo.tipo === "application/pdf" ? (
                    <FileText style={{ width: 18, height: 18, color: "#f87171" }} />
                  ) : (
                    <File style={{ width: 18, height: 18, color: "#60a5fa" }} />
                  )}
                  <span style={{
                    position: "absolute",
                    bottom: 2,
                    right: 2,
                    fontSize: 7,
                    fontWeight: 700,
                    color: arquivo.tipo === "application/pdf" ? "#f87171" : "#60a5fa",
                    textTransform: "uppercase",
                  }}>
                    {arquivo.nomeOriginal.split(".").pop()}
                  </span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, color: "#e2e8f0", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {arquivo.nomeOriginal}
                  </p>
                  <p style={{ fontSize: 11, color: "#475569", margin: "2px 0 0 0" }}>
                    {formatBytes(arquivo.tamanho)} · {new Date(arquivo.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>

                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  <a
                    href={arquivo.caminho}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#64748b",
                      textDecoration: "none",
                    }}
                    title="Download"
                  >
                    <Download style={{ width: 14, height: 14 }} />
                  </a>
                  {modoEdicao && (
                    <button
                      onClick={() => handleDelete(arquivo.id)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "none",
                        border: "none",
                        color: "#64748b",
                        cursor: "pointer",
                      }}
                      title="Excluir"
                    >
                      <Trash2 style={{ width: 14, height: 14 }} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vazio */}
      {arquivos.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <Paperclip style={{ width: 32, height: 32, color: "#334155", margin: "0 auto 10px" }} />
          <p style={{ fontSize: 13, color: "#475569", margin: 0 }}>Nenhum arquivo anexado</p>
        </div>
      )}
    </div>
  );
}
