require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require("@prisma/client");
const { PrismaNeon } = require("@prisma/adapter-neon");

function createPrismaClient() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "mmh858sd@gmail.com" },
    select: { id: true, email: true, role: true, password: true }
  });
  console.log(user);
}

main().finally(() => prisma.$disconnect());