import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

function getUploadDir(): string {
  const standaloneDir = path.join(process.cwd(), ".next", "standalone", "public", "uploads");
  if (existsSync(path.join(process.cwd(), ".next", "standalone"))) {
    return standaloneDir;
  }
  return path.join(process.cwd(), "public", "uploads");
}

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  if (!segments || segments.length === 0) {
    return new NextResponse("Not found", { status: 404 });
  }

  const uploadDir = getUploadDir();
  const requestedPath = path.join(uploadDir, ...segments);
  const resolvedPath = path.resolve(requestedPath);

  // Segurança: garantir que o arquivo está dentro do diretório de uploads
  if (!resolvedPath.startsWith(path.resolve(uploadDir))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const fileBuffer = await fs.readFile(resolvedPath);
    const ext = path.extname(resolvedPath).toLowerCase();
    const contentType = CONTENT_TYPES[ext] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=0, must-revalidate",
        "Accept-Ranges": "bytes",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
