const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.log("❌ Uso: node scripts/make-admin.js seu-email@exemplo.com");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.log(`❌ Usuário com e-mail ${email} não encontrado.`);
    process.exit(1);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: "ADMIN" },
  });

  console.log(`✅ Usuário ${email} promovido para ADMIN com sucesso!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
