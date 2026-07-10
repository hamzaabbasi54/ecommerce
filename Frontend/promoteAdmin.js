const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeAdmin() {
  const users = await prisma.user.findMany({ take: 1, orderBy: { createdAt: 'asc' } });
  if (users.length === 0) {
    console.log("No users found.");
    return;
  }
  
  const user = users[0];
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { role: 'ADMIN' }
  });
  
  console.log(`Successfully promoted ${updatedUser.email} to ADMIN.`);
}

makeAdmin().catch(console.error).finally(() => prisma.$disconnect());
