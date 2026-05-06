import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('12345678', 12);
  
  const existing = await prisma.user.findUnique({
    where: { email: 'amrhomes4845@gmail.com' }
  });

  if (existing) {
    await prisma.user.update({
      where: { email: 'amrhomes4845@gmail.com' },
      data: { password: hashedPassword, role: 'admin' }
    });
    console.log('Updated admin:', 'amrhomes4845@gmail.com');
  } else {
    await prisma.user.create({
      data: {
        email: 'amrhomes4845@gmail.com',
        name: 'Admin',
        password: hashedPassword,
        role: 'admin',
      }
    });
    console.log('Created admin:', 'amrhomes4845@gmail.com');
  }
  
  console.log('Login: amrhomes4845@gmail.com / 12345678');
  await prisma.$disconnect();
}

main();
