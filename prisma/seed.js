const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@psychomanager.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@1234";
  const adminName = process.env.ADMIN_NAME || "Administrador";

  const existingAdmin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (existingAdmin) {
    console.log("✅ Já existe um ADMIN no sistema:", existingAdmin.email);
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.create({
    data: {
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("🎉 ADMIN criado com sucesso!");
  console.log("   Email:", admin.email);
  console.log("   Senha:", adminPassword);
  console.log("   → Altere a senha após o primeiro login.");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
