import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PsychoManager - Gestao de consultorio",
  description: "Plataforma clinica para gerenciamento de pacientes, sessoes e prontuarios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}