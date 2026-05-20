const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.log("❌ Uso: node scripts/force-password-change.js seu-email@exemplo.com");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.log(`❌ Usuário com e-mail ${email} não encontrado.`);
    process.exit(1);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { mustChangePassword: true },
  });

  console.log(`✅ Usuário ${email} marcado para alterar senha no próximo login!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
