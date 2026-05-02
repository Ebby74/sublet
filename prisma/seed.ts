import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('12345678', 12);
  
  const ebby = await prisma.user.create({
    data: {
      email: 'ebby@amr.my',
      name: 'Ebby',
      password: hashedPassword,
      role: 'admin',
    }
  });
  
  const annah = await prisma.user.create({
    data: {
      email: 'annah@amr.my',
      name: 'Annah',
      password: hashedPassword,
      role: 'admin',
    }
  });
  
  console.log('Created admins:', ebby.email, annah.email);
  await prisma.$disconnect();
}

main();
