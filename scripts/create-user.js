const { PrismaClient } = require("@prisma/client");
const { PrismaNeon } = require("@prisma/adapter-neon");
const bcrypt = require("bcryptjs");

function createPrismaClient() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  const role = process.argv[4] || "EMPLOYEE";
  if (!email || !password) {
    console.log("Usage: node scripts/create-user.js <email> <password> [role]");
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hash, role },
    create: { email, password: hash, role },
  });
  console.log(`User created/updated: ${user.email} (${user.role})`);
}

main().finally(() => prisma.$disconnect());
