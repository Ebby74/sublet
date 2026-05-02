require('dotenv/config');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db',
    },
  },
});

async function main() {
  const properties = await prisma.property.findMany();
  console.log('=== Properties ===');
  console.log('Count:', properties.length);
  properties.forEach(p => console.log(JSON.stringify(p)));
  
  const leases = await prisma.lease.findMany({ include: { property: true } });
  console.log('\n=== Leases ===');
  console.log('Count:', leases.length);
  leases.forEach(l => console.log(JSON.stringify(l)));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
