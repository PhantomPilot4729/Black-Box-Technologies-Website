const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPatchPassword() {
  // Find test customer
  const customer = await prisma.customer.findFirst({ where: { email: 'testcustomer@example.com' } });
  if (!customer) {
    console.log('Test customer not found.');
    return;
  }
  // PATCH request to API
  const res = await fetch(`http://localhost:3000/api/customers/${customer.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'newTestPassword123' })
  });
  const data = await res.json();
  // Fetch updated customer
  const updated = await prisma.customer.findUnique({ where: { id: customer.id } });
  console.log('Updated password:', updated?.password);
  if (updated?.password && updated.password !== 'newTestPassword123' && updated.password.startsWith('$2a$')) {
    console.log('Password is hashed. Test successful.');
  } else if (updated?.password && updated.password !== 'newTestPassword123' && updated.password.startsWith('$2b$')) {
    console.log('Password is hashed. Test successful.');
  } else {
    console.log('Password is not hashed. Test failed.');
  }
}

testPatchPassword();