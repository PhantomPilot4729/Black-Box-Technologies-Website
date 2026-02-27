const { PrismaClient } = require("@prisma/client");
const { PrismaNeon } = require("@prisma/adapter-neon");

function createPrismaClient() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: "mmh858sd@gmail.com" },
    update: { role: "EXECUTIVE" },
    create: { email: "mmh858sd@gmail.com", role: "EXECUTIVE" },
  });
  console.log("User mmh858sd@gmail.com is now EXECUTIVE");
}

main().finally(() => prisma.$disconnect());
