"use client";

import { useState, useRef, useCallback } from "react";
import { X, FileText, ImageIcon, Eye, Upload } from "lucide-react";

export interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
}

interface FileUploadWithPreviewProps {
  files: FileWithPreview[];
  onChange: (files: FileWithPreview[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

export function FileUploadWithPreview({
  files,
  onChange,
  maxFiles = 5,
  maxSizeMB = 10,
}: FileUploadWithPreviewProps) {
  const [previewOpen, setPreviewOpen] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files;
      if (!selected) return;

      const newFiles: FileWithPreview[] = [];
      Array.from(selected).forEach((file) => {
        if (file.size > maxSizeMB * 1024 * 1024) {
          alert(`Arquivo "${file.name}" excede o limite de ${maxSizeMB}MB`);
          return;
        }
        if (files.length + newFiles.length >= maxFiles) {
          alert(`Limite de ${maxFiles} arquivo(s) atingido`);
          return;
        }

        const preview = URL.createObjectURL(file);
        newFiles.push({ file, preview, id: `${Date.now()}_${Math.random().toString(36).slice(2)}` });
      });

      onChange([...files, ...newFiles]);
      if (inputRef.current) inputRef.current.value = "";
    },
    [files, onChange, maxFiles, maxSizeMB]
  );

  const removeFile = useCallback(
    (id: string) => {
      const removed = files.find((f) => f.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      onChange(files.filter((f) => f.id !== id));
    },
    [files, onChange]
  );

  const isImage = (file: File) => file.type.startsWith("image/");
  const isPDF = (file: File) => file.type === "application/pdf";

  return (
    <div className="form-group">
      <label className="form-label">Documentos / Fotos</label>

      <div
        onClick={() => inputRef.current?.click()}
        style={{
          border: "2px dashed #475569",
          borderRadius: 12,
          padding: "24px",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.2s",
          background: "rgba(255,255,255,0.03)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "#3b82f6";
          (e.currentTarget as HTMLDivElement).style.background = "rgba(59,130,246,0.05)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "#475569";
          (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)";
        }}
      >
        <Upload style={{ width: 32, height: 32, color: "#64748b", marginBottom: 8 }} />
        <p style={{ fontSize: 14, color: "#94a3b8", margin: 0 }}>
          Clique para selecionar ou arraste arquivos
        </p>
        <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
          Imagens e PDFs até {maxSizeMB}MB ({files.length}/{maxFiles})
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        multiple={maxFiles > 1}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {files.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 12, marginTop: 16 }}>
          {files.map(({ file, preview, id }) => (
            <div
              key={id}
              style={{
                position: "relative",
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid #334155",
                background: "#1e293b",
                aspectRatio: "1",
                cursor: "pointer",
              }}
              onClick={() => setPreviewOpen(preview)}
            >
              {isImage(file) ? (
                <img
                  src={preview}
                  alt={file.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : isPDF(file) ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 6 }}>
                  <FileText style={{ width: 32, height: 32, color: "#ef4444" }} />
                  <span style={{ fontSize: 10, color: "#94a3b8", padding: "0 8px", textAlign: "center", wordBreak: "break-word" }}>
                    PDF
                  </span>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 6 }}>
                  <ImageIcon style={{ width: 32, height: 32, color: "#64748b" }} />
                  <span style={{ fontSize: 10, color: "#94a3b8", padding: "0 8px", textAlign: "center", wordBreak: "break-word" }}>
                    {file.name}
                  </span>
                </div>
              )}

              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0,0,0,0.5)",
                  opacity: 0,
                  transition: "opacity 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "1"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "0"; }}
              >
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setPreviewOpen(preview); }}
                  style={{
                    background: "rgba(255,255,255,0.9)",
                    border: "none",
                    borderRadius: "50%",
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <Eye style={{ width: 16, height: 16, color: "#1e293b" }} />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeFile(id); }}
                  style={{
                    background: "rgba(239,68,68,0.9)",
                    border: "none",
                    borderRadius: "50%",
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <X style={{ width: 16, height: 16, color: "white" }} />
                </button>
              </div>

              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "4px 8px",
                  background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                  fontSize: 10,
                  color: "white",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {file.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de pré-visualização */}
      {previewOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
          onClick={() => setPreviewOpen(null)}
        >
          <button
            type="button"
            onClick={() => setPreviewOpen(null)}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: "50%",
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "white",
            }}
          >
            <X style={{ width: 20, height: 20 }} />
          </button>
          {files.find((f) => f.preview === previewOpen)?.file.type === "application/pdf" ? (
            <iframe
              src={previewOpen}
              style={{ width: "90%", height: "90%", border: "none", borderRadius: 8 }}
              title="Preview PDF"
            />
          ) : (
            <img
              src={previewOpen}
              alt="Preview"
              style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: 8, objectFit: "contain" }}
            />
          )}
        </div>
      )}
    </div>
  );
}
