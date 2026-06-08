"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function sanitizeFilename(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .toLowerCase();
}

export async function uploadArquivo(pacienteId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const file = formData.get("arquivo") as File;
  if (!file || file.size === 0) {
    return { error: "Nenhum arquivo selecionado" };
  }

  // Verificar se o paciente pertence ao usuário
  const paciente = await db.paciente.findFirst({
    where: { id: pacienteId, userId: session.user.id },
  });
  if (!paciente) {
    return { error: "Paciente não encontrado" };
  }

  // Limites
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_SIZE) {
    return { error: "Arquivo muito grande. Máximo 10MB." };
  }

  const allowedTypes = [
    "image/jpeg", "image/png", "image/gif", "image/webp",
    "application/pdf", "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];
  if (!allowedTypes.includes(file.type)) {
    return { error: "Tipo de arquivo não permitido." };
  }

  // Criar diretório do usuário se não existir
  const userDir = path.join(UPLOAD_DIR, session.user.id);
  if (!existsSync(userDir)) {
    await mkdir(userDir, { recursive: true });
  }

  // Gerar nome único
  const ext = path.extname(file.name) || ".bin";
  const baseName = sanitizeFilename(path.basename(file.name, ext));
  const uniqueName = `${Date.now()}_${baseName}${ext}`;
  const filePath = path.join(userDir, uniqueName);
  const relativePath = `/uploads/${session.user.id}/${uniqueName}`;

  // Salvar arquivo
  const bytes = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(bytes));

  // Salvar no banco
  await db.arquivo.create({
    data: {
      nome: uniqueName,
      nomeOriginal: file.name,
      tipo: file.type,
      tamanho: file.size,
      caminho: relativePath,
      categoria: "diagnostico",
      pacienteId,
      userId: session.user.id,
    },
  });

  revalidatePath(`/pacientes/${pacienteId}`);
  revalidatePath(`/pacientes/${pacienteId}/editar`);
  return { success: true };
}

export async function deleteArquivo(arquivoId: string, pacienteId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Não autenticado" };
  }

  const arquivo = await db.arquivo.findFirst({
    where: { id: arquivoId, userId: session.user.id, pacienteId },
  });

  if (!arquivo) {
    return { error: "Arquivo não encontrado" };
  }

  // Remover arquivo do disco
  try {
    const fullPath = path.join(process.cwd(), "public", arquivo.caminho);
    if (existsSync(fullPath)) {
      await unlink(fullPath);
    }
  } catch {
    // Ignora erro se arquivo não existir no disco
  }

  // Remover do banco
  await db.arquivo.delete({
    where: { id: arquivoId },
  });

  revalidatePath(`/pacientes/${pacienteId}`);
  revalidatePath(`/pacientes/${pacienteId}/editar`);
  return { success: true };
}

export async function listarArquivos(pacienteId: string) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const paciente = await db.paciente.findFirst({
    where: { id: pacienteId, userId: session.user.id },
  });
  if (!paciente) return [];

  return db.arquivo.findMany({
    where: { pacienteId, userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
}
