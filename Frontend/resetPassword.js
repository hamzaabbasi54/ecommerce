const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    const updatedUser = await prisma.user.update({
      where: { email: 'admin@example.com' },
      data: { password: hashedPassword }
    });
    
    console.log(`Password reset successfully for ${updatedUser.email}. New password is: password123`);
  } catch (err) {
    console.error('Error resetting password:', err);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
