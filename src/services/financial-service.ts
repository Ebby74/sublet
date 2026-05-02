import { prisma } from '@/lib/prisma';

export interface FinancialSummary {
  roomId: string;
  roomName: string;
  rentSen: number;
  occupied: boolean;
  totalIncomeSen: number;
  totalExpensesSen: number;
  maintenanceCostSen: number;
  netProfitSen: number;
  vacancyDays: number;
}

export async function getRoomFinancials(roomId: string, startDate?: Date, endDate?: Date) {
  const dateFilter: Record<string, Date | undefined> = {};
  if (startDate) dateFilter.gte = startDate;
  if (endDate) dateFilter.lte = endDate;

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      leases: {
        where: { status: 'active' },
        include: { tenant: true },
      },
    },
  });

  const payments = await prisma.payment.findMany({
    where: {
      roomId,
      deletedAt: null,
      ...(Object.keys(dateFilter).length > 0 && { paidAt: dateFilter }),
    },
  });

  const income = payments
    .filter(p => p.type === 'income' && p.status === 'paid')
    .reduce((sum, p) => sum + p.amountSen, 0);

  const expenses = payments
    .filter(p => p.type === 'expense' && p.status === 'paid')
    .reduce((sum, p) => sum + p.amountSen, 0);

  const maintenanceCost = room?.maintenanceCostSen ?? 0;
  const netProfit = income - expenses - maintenanceCost;

  let vacancyDays = 0;
  if (room?.vacantSince) {
    vacancyDays = Math.floor((Date.now() - room.vacantSince.getTime()) / (1000 * 60 * 60 * 24));
  }

  return {
    roomId,
    roomName: room?.name ?? 'Unknown',
    rentSen: room?.rentSen ?? 0,
    occupied: room?.leases && room.leases.length > 0,
    totalIncomeSen: income,
    totalExpensesSen: expenses,
    maintenanceCostSen: maintenanceCost,
    netProfitSen: netProfit,
    vacancyDays,
    payments,
    tenant: room?.leases?.[0]?.tenant,
  };
}

export async function getPropertyFinancials(propertyId: string, startDate?: Date, endDate?: Date) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      floors: {
        where: { status: 'active' },
        include: {
          rooms: {
            where: { deletedAt: null },
          },
        },
      },
    },
  });

  if (!property) return null;

  const roomFinancials: FinancialSummary[] = [];
  let totalIncome = 0;
  let totalExpenses = 0;
  let totalRent = 0;
  let occupiedRooms = 0;
  let vacantRooms = 0;

  for (const floor of property.floors) {
    for (const room of floor.rooms) {
      const financials = await getRoomFinancials(room.id, startDate, endDate);
      roomFinancials.push({
        roomId: room.id,
        roomName: `${floor.name} - ${room.name}`,
        rentSen: financials.rentSen,
        occupied: !!financials.occupied,
        totalIncomeSen: financials.totalIncomeSen,
        totalExpensesSen: financials.totalExpensesSen,
        maintenanceCostSen: financials.maintenanceCostSen,
        netProfitSen: financials.netProfitSen,
        vacancyDays: financials.vacancyDays,
      });
      totalIncome += financials.totalIncomeSen;
      totalExpenses += financials.totalExpensesSen;
      totalRent += financials.rentSen;
      if (financials.occupied) occupiedRooms++;
      else vacantRooms++;
    }
  }

  const zakat = Math.floor(totalIncome * 0.025);
  const sst = Math.floor(totalIncome * 0.0008);
  const grossProfit = totalIncome - totalExpenses;
  const netProfit = grossProfit - zakat - sst;

  return {
    propertyId,
    propertyName: property.name,
    floors: property.floors.map(f => ({
      floorId: f.id,
      floorName: f.name,
      roomCount: f.rooms.length,
      rooms: roomFinancials.filter(rf => 
        f.rooms.some(r => r.id === rf.roomId)
      ),
    })),
    summary: {
      totalRooms: roomFinancials.length,
      occupiedRooms,
      vacantRooms,
      totalPotentialRentSen: totalRent,
      totalIncomeSen: totalIncome,
      totalExpensesSen: totalExpenses,
      grossProfitSen: grossProfit,
      zakatSen: zakat,
      sstSen: sst,
      netProfitSen: netProfit,
    },
  };
}