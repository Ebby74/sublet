const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'amrhomes4845@gmail.com';
  const password = 'admin123';
  const hashed = await bcrypt.hash(password, 12);

  // Check if user exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Update password and role
    await prisma.user.update({
      where: { email },
      data: { password: hashed, role: 'admin' }
    });
    console.log('Updated existing user!');
  } else {
    await prisma.user.create({
      data: {
        id: 'admin-001',
        email,
        password: hashed,
        role: 'admin',
        name: 'Admin001'
      }
    });
    console.log('Created new user!');
  }
  console.log('Done. You can now login with:');
  console.log('Email:', email);
  console.log('Password:', password);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
