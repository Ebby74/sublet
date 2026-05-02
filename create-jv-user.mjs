import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createJvUser() {
  try {
    const password = await bcrypt.hash('jvpassword123', 10);
    
    const jvUser = await prisma.user.create({
      data: {
        email: 'jv-stakeholder@test.com',
        name: 'JV Test Stakeholder',
        password: password,
        role: 'jv',
        jvProperties: '[]'
      }
    });
    
    console.log('✅ JV User created successfully!');
    console.log('Email: jv-stakeholder@test.com');
    console.log('Password: jvpassword123');
    console.log('Role: jv');
    console.log('\nUse this account to test JV/Stakeholder view at /jv');
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️ JV user already exists');
      console.log('Email: jv-stakeholder@test.com');
      console.log('Password: jvpassword123');
    } else {
      console.error('Error:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createJvUser();
