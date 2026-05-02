import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'scheduler' });

export async function checkPaymentDue(): Promise<number> {
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const duePayments = await prisma.payment.findMany({
    where: {
      status: 'pending',
      dueDate: {
        gte: now,
        lte: threeDaysFromNow,
      },
      userId: { not: null },
    },
    include: {
      tenant: true,
      lease: true,
    },
  });

  let created = 0;
  for (const payment of duePayments) {
    const existing = await prisma.notification.findFirst({
      where: {
        userId: payment.userId!,
        title: 'Payment Due Soon',
        read: false,
      },
    });

    if (!existing && payment.userId) {
      const amount = (payment.amountSen / 100).toFixed(2);
      const dueDate = payment.dueDate ? payment.dueDate.toLocaleDateString('en-MY') : 'N/A';
      await prisma.notification.create({
        data: {
          userId: payment.userId,
          type: 'payment_due',
          title: 'Payment Due Soon',
          message: `Payment of RM${amount} for ${payment.tenant?.name ?? 'tenant'} is due on ${dueDate}`,
        },
      });
      created++;
    }
  }

  if (created > 0) {
    log.info({ count: created }, 'Payment due notifications created');
  }

  return created;
}

export async function checkPaymentOverdue(): Promise<number> {
  const overduePayments = await prisma.payment.findMany({
    where: {
      status: 'pending',
      dueDate: {
        lt: new Date(),
      },
      userId: { not: null },
    },
    include: {
      tenant: true,
      lease: true,
    },
  });

  let created = 0;
  for (const payment of overduePayments) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'overdue' },
    });

    const existing = await prisma.notification.findFirst({
      where: {
        userId: payment.userId!,
        title: 'Payment Overdue',
        read: false,
      },
    });

    if (!existing && payment.userId) {
      const amount = (payment.amountSen / 100).toFixed(2);
      const dueDate = payment.dueDate ? payment.dueDate.toLocaleDateString('en-MY') : 'N/A';
      await prisma.notification.create({
        data: {
          userId: payment.userId,
          type: 'payment_overdue',
          title: 'Payment Overdue',
          message: `Payment of RM${amount} for ${payment.tenant?.name ?? 'tenant'} is overdue since ${dueDate}`,
        },
      });
      created++;
    }
  }

  if (created > 0) {
    log.info({ count: created }, 'Overdue payment notifications created');
  }

  return created;
}

export async function checkLeaseExpiry(): Promise<number> {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const expiringLeases = await prisma.lease.findMany({
    where: {
      status: 'active',
      endDate: {
        gte: now,
        lte: thirtyDaysFromNow,
      },
    },
    include: {
      tenant: true,
      room: true,
    },
  });

  let created = 0;
  for (const lease of expiringLeases) {
    const existing = await prisma.notification.findFirst({
      where: {
        userId: lease.userId,
        title: 'Lease Expiring Soon',
        read: false,
      },
    });

    if (!existing) {
      const daysRemaining = Math.ceil(
        (lease.endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
      );

      await prisma.notification.create({
        data: {
          userId: lease.userId,
          type: 'lease_expiry',
          title: 'Lease Expiring Soon',
          message: `Lease for ${lease.tenant?.name ?? 'tenant'} expires in ${daysRemaining} days (${lease.endDate.toLocaleDateString('en-MY')})`,
        },
      });
      created++;
    }
  }

  if (created > 0) {
    log.info({ count: created }, 'Lease expiry notifications created');
  }

  return created;
}

export async function runAllNotificationChecks() {
  log.info('Running scheduled notification checks');

  const dueCount = await checkPaymentDue();
  const overdueCount = await checkPaymentOverdue();
  const leaseCount = await checkLeaseExpiry();

  const total = dueCount + overdueCount + leaseCount;
  log.info(
    { dueCount, overdueCount, leaseCount, total },
    'Notification check completed'
  );

  return { dueCount, overdueCount, leaseCount, total };
}

let schedulerInterval: ReturnType<typeof setInterval> | null = null;

export function startScheduler(intervalMs: number = 60 * 60 * 1000) {
  if (schedulerInterval) {
    log.warn('Scheduler already running');
    return;
  }

  log.info({ intervalMs }, 'Starting notification scheduler');

  schedulerInterval = setInterval(async () => {
    try {
      await runAllNotificationChecks();
    } catch (error) {
      log.error({ error }, 'Scheduler error');
    }
  }, intervalMs);

  schedulerInterval.unref();
}

export function stopScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    log.info('Scheduler stopped');
  }
}
