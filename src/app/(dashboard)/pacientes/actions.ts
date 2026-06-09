"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const pacienteSchema = z.object({
  nomeCompleto: z.string().min(2, "Nome obrigatorio"),
  cpf: z.string().optional(),
  dataNascimento: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email("E-mail invalido").or(z.literal("")).optional(),
  queixaPrincipal: z.string().optional(),
  observacoes: z.string().optional(),
});

function getUploadDir(): string {
  const standaloneDir = path.join(process.cwd(), ".next", "standalone", "public", "uploads");
  if (existsSync(path.join(process.cwd(), ".next", "standalone"))) {
    return standaloneDir;
  }
  return path.join(process.cwd(), "public", "uploads");
}

function sanitizeFilename(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .toLowerCase();
}

async function saveArquivo(file: File, pacienteId: string, userId: string) {
  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE) return null;

  const allowedTypes = [
    "image/jpeg", "image/png", "image/gif", "image/webp",
    "application/pdf",
  ];
  if (!allowedTypes.includes(file.type)) return null;

  const uploadDir = getUploadDir();
  const userDir = path.join(uploadDir, userId);
  if (!existsSync(userDir)) {
    await mkdir(userDir, { recursive: true });
  }

  const ext = path.extname(file.name) || ".bin";
  const baseName = sanitizeFilename(path.basename(file.name, ext));
  const uniqueName = `${Date.now()}_${baseName}${ext}`;
  const filePath = path.join(userDir, uniqueName);
  const relativePath = `/uploads/${userId}/${uniqueName}`;

  const bytes = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(bytes));

  // Também salva em public/uploads para persistência
  const publicDir = path.join(process.cwd(), "public", "uploads", userId);
  if (uploadDir !== publicDir && !existsSync(publicDir)) {
    await mkdir(publicDir, { recursive: true });
  }
  if (uploadDir !== publicDir) {
    await writeFile(path.join(publicDir, uniqueName), Buffer.from(bytes));
  }

  await db.arquivo.create({
    data: {
      nome: uniqueName,
      nomeOriginal: file.name,
      tipo: file.type,
      tamanho: file.size,
      caminho: relativePath,
      categoria: "documento",
      pacienteId,
      userId,
    },
  });

  return relativePath;
}

export async function createPaciente(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const raw = {
    nomeCompleto: formData.get("nomeCompleto") as string,
    cpf: (formData.get("cpf") as string) || undefined,
    dataNascimento: (formData.get("dataNascimento") as string) || undefined,
    telefone: (formData.get("telefone") as string) || undefined,
    email: (formData.get("email") as string) || undefined,
    queixaPrincipal: (formData.get("queixaPrincipal") as string) || undefined,
    observacoes: (formData.get("observacoes") as string) || undefined,
  };

  const parsed = pacienteSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Dados invalidos");
  }

  const paciente = await db.paciente.create({
    data: {
      ...parsed.data,
      dataNascimento: parsed.data.dataNascimento ? new Date(parsed.data.dataNascimento) : null,
      userId: session.user.id,
    },
  });

  // Processar arquivos anexados
  const arquivos = formData.getAll("arquivos") as File[];
  for (const file of arquivos) {
    if (file && file.size > 0) {
      await saveArquivo(file, paciente.id, session.user.id);
    }
  }

  revalidatePath("/pacientes");
  redirect("/pacientes");
}

export async function updatePaciente(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const raw = {
    nomeCompleto: formData.get("nomeCompleto") as string,
    cpf: (formData.get("cpf") as string) || undefined,
    dataNascimento: (formData.get("dataNascimento") as string) || undefined,
    telefone: (formData.get("telefone") as string) || undefined,
    email: (formData.get("email") as string) || undefined,
    queixaPrincipal: (formData.get("queixaPrincipal") as string) || undefined,
    observacoes: (formData.get("observacoes") as string) || undefined,
  };

  const parsed = pacienteSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Dados invalidos");
  }

  await db.paciente.update({
    where: { id, userId: session.user.id },
    data: {
      ...parsed.data,
      dataNascimento: parsed.data.dataNascimento ? new Date(parsed.data.dataNascimento) : null,
    },
  });

  revalidatePath("/pacientes");
  redirect(`/pacientes/${id}`);
}

export async function deletePaciente(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return;
  }

  await db.paciente.delete({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/pacientes");
}
