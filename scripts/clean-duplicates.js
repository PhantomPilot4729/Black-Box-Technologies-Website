const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDuplicates() {
  const customers = await prisma.customer.findMany({ where: { email: { not: null } } });
  const emailCounts = customers.reduce((acc, c) => {
    if (!c.email) return acc;
    acc[c.email] = (acc[c.email] || 0) + 1;
    return acc;
  }, {});
  for (const [email, count] of Object.entries(emailCounts)) {
    if (count > 1) {
      const toDelete = await prisma.customer.findMany({ where: { email }, orderBy: { createdAt: 'desc' } });
      for (let i = 1; i < toDelete.length; i++) {
        await prisma.customer.delete({ where: { id: toDelete[i].id } });
      }
    }
  }
  console.log('Duplicates cleaned.');
}

cleanDuplicates().finally(() => prisma.$disconnect());