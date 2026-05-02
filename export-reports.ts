import XLSX from 'xlsx';

const MONTHS = ['JAN', 'FEB', 'MAC', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUG'];

const workbook = XLSX.readFile('COLL JAN-AUG 2025.xlsx');
const keramat = XLSX.utils.sheet_to_json(workbook.Sheets['KERAMAT'], { header: 1 });
const pndnLagoon = XLSX.utils.sheet_to_json(workbook.Sheets['PNDN&LAGOON'], { header: 1 });
const sheet2 = XLSX.utils.sheet_to_json(workbook.Sheets['Sheet2'], { header: 1 });
const claim = XLSX.utils.sheet_to_json(workbook.Sheets['CLAIM'], { header: 1 });

// Parse all tenant data
const tenants: any[] = [];
let currentLevel = '';

for (const row of keramat) {
  if (!row) continue;
  const row0 = String(row[0] || '');
  if (row0.includes('LEVEL')) { currentLevel = row0; continue; }
  if (row0 === 'NAMA' || row0 === 'TOTAL' || row[2] === 'DEPOSIT') continue;
  if (row0.trim()) {
    const payments = [];
    for (let m = 5; m < 13; m++) {
      payments.push(row[m] !== null && row[m] !== undefined ? Number(row[m]) : 0);
    }
    tenants.push({ name: row0.trim(), property: 'KERAMAT', level: currentLevel, deposit: row[2], rate: row[4], payments });
  }
}

let currentProp = '';
for (const row of pndnLagoon) {
  if (!row) continue;
  const row0 = String(row[0] || '');
  if (row0.includes('LAGOON PERDANA')) { currentProp = 'LAGOON PERDANA'; continue; }
  if (row0.includes('PANDAN INDAH')) { currentProp = 'PANDAN INDAH'; continue; }
  if (row0.includes('PANDAN JAYA 33')) { currentProp = 'PANDAN JAYA 33'; continue; }
  if (row0.includes('PANDAN JAYA 45')) { currentProp = 'PANDAN JAYA 45'; continue; }
  if (row0.includes('PANDAN CAHAYA')) { currentProp = 'PANDAN CAHAYA'; continue; }
  if (row0 === 'NAMA' || row0 === 'TOTAL' || row0.includes('TELEFON') || row0.includes('Total')) continue;
  if (row0.trim()) {
    const payments = [];
    for (let m = 5; m < 13; m++) {
      payments.push(row[m] !== null && row[m] !== undefined ? Number(row[m]) : 0);
    }
    tenants.push({ name: row0.trim(), property: currentProp, level: '', deposit: row[3], rate: row[4], payments });
  }
}

// Parse bills from Sheet2 by month
const billsByMonth: any = {};
let monthIdx = -1;

for (let i = 0; i < sheet2.length; i++) {
  const row = sheet2[i];
  if (!row) continue;
  const rowStr = JSON.stringify(row);
  
  if (typeof row[0] === 'number' && row[0] > 45000) {
    monthIdx++;
    billsByMonth[MONTHS[monthIdx]] = { tnb: 0, syabas: 0, unifi: 0, pymt: 0, claim: 0 };
  }
  
  // Sum all bills for the month (last TOTAL row has cumulative)
  if (row[0] === 'TOTAL' && row[5] && typeof row[5] === 'number' && row[5] > 1000) {
    billsByMonth[MONTHS[monthIdx]].tnb = (billsByMonth[MONTHS[monthIdx]].tnb || 0) + (Number(row[2]) || 0);
    billsByMonth[MONTHS[monthIdx]].syabas = (billsByMonth[MONTHS[monthIdx]].syabas || 0) + (Number(row[3]) || 0);
    billsByMonth[MONTHS[monthIdx]].unifi = (billsByMonth[MONTHS[monthIdx]].unifi || 0) + (Number(row[4]) || 0);
    billsByMonth[MONTHS[monthIdx]].pymt = (billsByMonth[MONTHS[monthIdx]].pymt || 0) + (Number(row[9]) || 0);
    billsByMonth[MONTHS[monthIdx]].claim = (billsByMonth[MONTHS[monthIdx]].claim || 0) + (Number(row[10]) || 0);
  }
}

// Parse claims
const claimsByMonth: any = {};
let claimMonth = '';

for (const row of claim) {
  if (!row) continue;
  const rowStr = JSON.stringify(row);
  
  if (rowStr.includes('JANUARI')) claimMonth = 'JAN';
  else if (rowStr.includes('FEBRUARY')) claimMonth = 'FEB';
  else if (rowStr.includes('MAC') && !rowStr.includes('MARCH')) claimMonth = 'MAC';
  else if (rowStr.includes('APRIL')) claimMonth = 'APRIL';
  else if (rowStr.includes('MAY')) claimMonth = 'MAY';
  else if (rowStr.includes('JUNE')) claimMonth = 'JUNE';
  else if (rowStr.includes('JULY')) claimMonth = 'JULY';
  else if (rowStr.includes('AUGUST')) claimMonth = 'AUG';
  
  if (row[3] && typeof row[3] === 'number') {
    claimsByMonth[claimMonth] = (claimsByMonth[claimMonth] || 0) + row[3];
  }
}

// Create workbook
const wb = XLSX.utils.book_new();

// Create property reports
const properties = ['KERAMAT', 'LAGOON PERDANA', 'PANDAN INDAH', 'PANDAN JAYA 33'];

for (const propName of properties) {
  const propTenants = tenants.filter(t => t.property === propName);
  if (propTenants.length === 0) continue;
  
  const split = propName === 'KERAMAT' ? 0.8 : 0.75;
  
  // Header rows
  const data: any[] = [
    [propName + ' - MONTHLY REPORT 2025'],
    ['Stakeholder: FAIZAL AZIZ | Manager: AMR HOMES SOLUTIONS | Split: ' + (split === 0.8 ? '80% / 20%' : '75% / 25%')],
    [],
    ['TENANT LIST'],
    ['TENANT NAME', 'DEPOSIT', 'RATE', ...MONTHS.map(m => m + ' 2025')],
  ];
  
  // Tenant rows
  for (const t of propTenants) {
    data.push([t.name, t.deposit, t.rate, ...t.payments]);
  }
  
  // Monthly summary section
  data.push([]);
  data.push(['MONTHLY SUMMARY']);
  data.push(['MONTH', 'COLLECTION', 'TNB', 'SYABAS', 'UNIFI', 'CLAIM', 'TOTAL BILLS', 'PROFIT', 'FAIZAL ' + (split * 100) + '%', 'AMR ' + ((1-split) * 100) + '%', 'PYMT', 'CUMULATIVE']);
  
  let cumulative = 0;
  for (let m = 0; m < MONTHS.length; m++) {
    const month = MONTHS[m];
    const collection = propTenants.reduce((sum, t) => sum + (t.payments[m] || 0), 0);
    const bills = billsByMonth[month] || { tnb: 0, syabas: 0, unifi: 0, claim: 0 };
    const repairs = claimsByMonth[month] || 0;
    const totalBills = (bills.tnb || 0) + (bills.syabas || 0) + (bills.unifi || 0) + repairs;
    const profit = collection - totalBills;
    const faizal = Math.round(profit * split);
    const amir = profit - faizal;
    const pymt = bills.pymt || 0;
    cumulative += faizal - pymt;
    
    data.push([month + ' 2025', collection, bills.tnb || '', bills.syabas || '', bills.unifi || '', repairs, totalBills, profit, faizal, amir, pymt, cumulative]);
  }
  
  // Grand total row
  const totalCollection = propTenants.reduce((sum, t) => sum + t.payments.reduce((a: number, b: number) => a + b, 0), 0);
  const totalBills = MONTHS.reduce((sum, m) => {
    const b = billsByMonth[m] || { tnb: 0, syabas: 0, unifi: 0, claim: 0 };
    return sum + (b.tnb || 0) + (b.syabas || 0) + (b.unifi || 0) + (claimsByMonth[m] || 0);
  }, 0);
  const totalProfit = totalCollection - totalBills;
  const totalFaizal = Math.round(totalProfit * split);
  const totalAmir = totalProfit - totalFaizal;
  
  data.push(['TOTAL', totalCollection, '', '', '', '', totalBills, totalProfit, totalFaizal, totalAmir, '', cumulative]);
  
  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 20 }, // Tenant name
    { wch: 10 }, // Deposit
    { wch: 10 }, // Rate
    { wch: 12 }, // Jan
    { wch: 12 }, // Feb
    { wch: 12 }, // Mac
    { wch: 12 }, // April
    { wch: 12 }, // May
    { wch: 12 }, // June
    { wch: 12 }, // July
    { wch: 12 }, // Aug
  ];
  
  const sheetName = propName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
}

// Summary sheet
const summaryData: any[] = [
  ['SUBLET PROPERTY MANAGEMENT - SUMMARY REPORT 2025'],
  ['AMR HOMES SOLUTIONS'],
  [],
  ['PROPERTY', 'SPLIT', 'COLLECTION', 'BILLS', 'PROFIT', 'FAIZAL', 'AMR'],
];

let grandCollection = 0;
let grandBills = 0;
let grandProfit = 0;

for (const propName of properties) {
  const propTenants = tenants.filter(t => t.property === propName);
  if (propTenants.length === 0) continue;
  
  const split = propName === 'KERAMAT' ? 0.8 : 0.75;
  const collection = propTenants.reduce((sum, t) => sum + t.payments.reduce((a: number, b: number) => a + b, 0), 0);
  const bills = MONTHS.reduce((sum, m) => {
    const b = billsByMonth[m] || { tnb: 0, syabas: 0, unifi: 0, claim: 0 };
    return sum + (b.tnb || 0) + (b.syabas || 0) + (b.unifi || 0) + (claimsByMonth[m] || 0);
  }, 0) / properties.length; // Approximate
  
  const profit = collection - bills;
  const faizal = Math.round(profit * split);
  const amir = profit - faizal;
  
  grandCollection += collection;
  grandBills += bills;
  grandProfit += profit;
  
  summaryData.push([propName, split === 0.8 ? '80/20' : '75/25', collection, bills, profit, faizal, amir]);
}

summaryData.push(['TOTAL', '', grandCollection, grandBills, grandProfit, Math.round(grandProfit * 0.8), grandProfit - Math.round(grandProfit * 0.8)]);

const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
XLSX.utils.book_append_sheet(wb, wsSummary, 'SUMMARY');

XLSX.writeFile(wb, 'Sublet_Report_2025.xlsx');
console.log('Report saved: Sublet_Report_2025.xlsx');
console.log('Sheets: SUMMARY, KERAMAT, LAGOON_PERDANA, PANDAN_INDAH, PANDAN_JAYA_33');
