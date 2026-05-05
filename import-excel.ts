import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '@prisma/client';
import XLSX from 'xlsx';

const adapter = new PrismaLibSql({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

const USER_ID = 'eaad7794-bc06-46ad-a1d0-b2cd1dbf056c';
const MONTHS = ['JAN', 'FEB', 'MAC', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUG'];
const YEAR = 2025;

function parseNumber(val: unknown): number {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return val;
  const str = String(val).replace(/[RM,\s]/g, '');
  return parseFloat(str) || 0;
}

function parseDate(serial: unknown): Date | null {
  if (!serial || typeof serial !== 'number') return null;
  return new Date((serial - 25569) * 86400 * 1000);
}

async function main() {
  const workbook = XLSX.readFile('COLL JAN-AUG 2025.xlsx');

  console.log('=== Starting Import ===\n');

  const properties = [
    { code: 'G-LKK10', name: 'KERAMAT Level G', address: 'KERAMAT Level G, LKK10', rentAmountSen: 45000 },
    { code: '1-LKK10', name: 'KERAMAT Level 1', address: 'KERAMAT Level 1, LKK10', rentAmountSen: 43000 },
    { code: '2-LKK10', name: 'KERAMAT Level 2', address: 'KERAMAT Level 2, LKK10', rentAmountSen: 43000 },
    { code: 'LAGOON', name: 'Lagoon Perdana', address: 'Lagoon Perdana', rentAmountSen: 50000 },
    { code: 'PDN-INDAH', name: 'Pandan Indah', address: 'Pandan Indah', rentAmountSen: 35000 },
    { code: 'PDN-JAYA-33', name: 'Pandan Jaya 33', address: 'Pandan Jaya 33', rentAmountSen: 30000 },
    { code: 'PDN-JAYA-45', name: 'Pandan Jaya 45', address: 'Pandan Jaya 45', rentAmountSen: 30000 },
    { code: 'PDN-CAHAYA', name: 'Pandan Cahaya', address: 'Pandan Cahaya', rentAmountSen: 30000 },
  ];

  const propertyMap = new Map<string, string>();
  for (const p of properties) {
    const existing = await prisma.property.findFirst({
      where: { userId: USER_ID, name: p.name }
    });
    
    let property;
    if (existing) {
      property = existing;
      console.log(`Property exists: ${p.name}`);
    } else {
      property = await prisma.property.create({
        data: {
          name: p.name,
          address: p.address,
          rentAmountSen: p.rentAmountSen,
          status: 'occupied',
          userId: USER_ID,
        }
      });
      console.log(`Created property: ${p.name}`);
    }
    propertyMap.set(p.code, property.id);
  }

  console.log('\n=== Parsing KERAMAT ===');
  const keramatRaw = XLSX.utils.sheet_to_json(workbook.Sheets['KERAMAT'], { header: 1 }) as (string | number | null)[][];
  
  interface TenantData {
    name: string;
    phone: string | null;
    deposit: number;
    contractDate: Date | null;
    rent: number;
    payments: number[];
    property: string;
  }

  const keramatTenants: TenantData[] = [];
  let currentProperty = 'G-LKK10';

  for (let i = 0; i < keramatRaw.length; i++) {
    const row = keramatRaw[i];
    if (!row || row.every(c => c === null || c === '')) continue;

    const rowStr = JSON.stringify(row);
    
    if (rowStr.includes('LEVEL 1')) { currentProperty = '1-LKK10'; continue; }
    if (rowStr.includes('LEVEL 2')) { currentProperty = '2-LKK10'; continue; }
    if (rowStr.includes('TOTAL') || rowStr.includes('NAMA') || rowStr.includes('NO ') || rowStr.includes('DEPOSIT')) continue;
    
    const name = row[0];
    if (typeof name === 'string' && name.trim()) {
      const payments = MONTHS.map((_, idx) => parseNumber(row[idx + 5]));
      keramatTenants.push({
        name: name.trim(),
        phone: null,
        deposit: parseNumber(row[2]),
        contractDate: parseDate(row[3]),
        rent: parseNumber(row[4]),
        payments,
        property: currentProperty,
      });
    }
  }

  console.log('=== Parsing PNDN&LAGOON ===');
  const pndnRaw = XLSX.utils.sheet_to_json(workbook.Sheets['PNDN&LAGOON'], { header: 1 }) as (string | number | null)[][];
  
  const pndnTenants: TenantData[] = [];
  let currentPndnProperty = 'LAGOON';

  for (let i = 0; i < pndnRaw.length; i++) {
    const row = pndnRaw[i];
    if (!row || row.every(c => c === null || c === '')) continue;

    const rowStr = JSON.stringify(row);
    
    if (rowStr.includes('PANDAN INDAH')) { currentPndnProperty = 'PDN-INDAH'; continue; }
    if (rowStr.includes('PANDAN JAYA 33')) { currentPndnProperty = 'PDN-JAYA-33'; continue; }
    if (rowStr.includes('TOTAL') || rowStr.includes('NAMA') || rowStr.includes('TELEFON') || rowStr.includes('LAGOON PERDANA')) continue;
    
    const name = row[0];
    if (typeof name === 'string' && name.trim() && !name.includes('Total')) {
      const payments = MONTHS.map((_, idx) => parseNumber(row[idx + 5]));
      pndnTenants.push({
        name: name.trim(),
        phone: row[1] ? String(row[1]) : null,
        deposit: parseNumber(row[3]),
        contractDate: null,
        rent: parseNumber(row[4]),
        payments,
        property: currentPndnProperty,
      });
    }
  }

  const allTenants = [...keramatTenants, ...pndnTenants];
  console.log(`\nTotal tenants to import: ${allTenants.length}`);

  let tenantCount = 0;
  let paymentCount = 0;

  for (const tenantData of allTenants) {
    const propertyId = propertyMap.get(tenantData.property);
    if (!propertyId) continue;

    let tenant = await prisma.tenant.findFirst({
      where: { userId: USER_ID, name: tenantData.name }
    });

    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          name: tenantData.name,
          phone: tenantData.phone || null,
          userId: USER_ID,
        }
      });
      tenantCount++;
    }

    const startDate = tenantData.contractDate || new Date(`${YEAR}-01-01`);
    const lease = await prisma.lease.create({
      data: {
        startDate,
        endDate: new Date(`${YEAR}-12-31`),
        monthlyRentSen: Math.round(tenantData.rent * 100),
        depositSen: Math.round(tenantData.deposit * 100),
        status: 'available',
        property: { connect: { id: propertyId } },
        tenant: { connect: { id: tenant.id } },
        user: { connect: { id: USER_ID } },
      }
    });

    for (let m = 0; m < MONTHS.length; m++) {
      const amount = tenantData.payments[m];
      if (amount > 0) {
        const paidDate = new Date(YEAR, m, 15);
        await prisma.payment.create({
          data: {
            type: 'income',
            amountSen: Math.round(amount * 100),
            description: `Rent for ${MONTHS[m]} ${YEAR}`,
            status: 'paid',
            paidAt: paidDate,
            leaseId: lease.id,
            tenantId: tenant.id,
            incomeSource: 'sublet',
          }
        });
        paymentCount++;
      }
    }
  }

  console.log(`\n=== Import Complete ===`);
  console.log(`Properties: ${properties.length}`);
  console.log(`New Tenants: ${tenantCount}`);
  console.log(`Payments: ${paymentCount}`);

  await prisma.$disconnect();
}

main().catch(console.error);
