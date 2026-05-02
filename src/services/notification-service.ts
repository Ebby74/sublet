/**
 * Notification Service
 * 
 * Handles CRUD operations for notifications.
 * Supports payment due reminders and lease expiry alerts.
 * Also sends email notifications via emailService.
 */

import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/format';
import { emailService } from './email-service';
import { whatsappService } from './whatsapp-service';
import type { Notification as PrismaNotification } from '@prisma/client';

export type NotificationType = 'payment_due' | 'payment_overdue' | 'lease_expiry' | 'lease_expired';

export interface NotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  readAt: Date | null;
  createdAt: Date;
}

export interface CreateNotificationInput {
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  data?: Record<string, unknown>;
}

/**
 * Create a notification
 */
export async function createNotification(input: CreateNotificationInput): Promise<NotificationData> {
  const notification = await prisma.notification.create({
    data: {
      type: input.type,
      title: input.title,
      message: input.message,
      data: input.data ? JSON.stringify(input.data) : null,
      userId: input.userId,
    },
  });

  return {
    ...notification,
    data: notification.data ? JSON.parse(notification.data) : undefined,
  };
}

/**
 * Get all notifications for a user
 */
export async function getNotificationsForUser(
  userId: string,
  unreadOnly = false
): Promise<NotificationData[]> {
  const notifications = await prisma.notification.findMany({
    where: {
      userId,
      ...(unreadOnly ? { read: false } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return notifications.map(n => ({
    ...n,
    data: n.data ? JSON.parse(n.data) : undefined,
  }));
}

/**
 * Get unread count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, read: false },
  });
}

/**
 * Mark a notification as read
 */
export async function markAsRead(id: string): Promise<void> {
  await prisma.notification.update({
    where: { id },
    data: { read: true, readAt: new Date() },
  });
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true, readAt: new Date() },
  });
}

/**
 * Check and create payment due notifications (3 days before)
 * Also sends email notifications to users with configured SMTP
 */
export async function checkPaymentReminders(): Promise<{ created: number; emailsSent: number; whatsAppSent: number }> {
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);

  // Find pending payments due in 1-3 days
  const duePayments = await prisma.payment.findMany({
    where: {
      status: 'pending',
      dueDate: {
        gte: tomorrow,
        lte: threeDaysFromNow,
      },
    },
    include: {
      tenant: true,
      lease: {
        include: {
          room: {
            include: {
              floor: {
                include: {
                  property: {
                    select: { id: true, name: true, userId: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  let created = 0;
  let emailsSent = 0;
  let whatsAppSent = 0;

  for (const payment of duePayments) {
    const propertyId = payment.lease?.room.floor.property.id;
    const propertyName = payment.lease?.room.floor.property.name || 'Unknown';
    const propertyUserId = payment.lease?.room.floor.property.userId || payment.tenant?.userId;
    const userId = propertyUserId;
    if (!userId) continue;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.email) continue;

    const existing = await prisma.notification.findFirst({
      where: {
        userId,
        type: 'payment_due',
        data: { contains: payment.id },
      },
    });

    if (!existing) {
      const daysUntilDue = Math.ceil(
        (new Date(payment.dueDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      await createNotification({
        type: 'payment_due',
        title: 'Payment Due Soon',
        message: `Payment of ${formatCurrency(payment.amountSen)} for ${propertyName} is due in ${daysUntilDue} days`,
        userId,
        data: { paymentId: payment.id, tenantId: payment.tenantId, leaseId: payment.leaseId, propertyId },
      });
      created++;

      try {
        await emailService.sendPaymentReminder({
          tenantName: payment.tenant?.name || 'N/A',
          propertyName,
          amountSen: payment.amountSen,
          dueDate: new Date(payment.dueDate!),
          daysUntilDue,
        }, user.email);
        emailsSent++;
      } catch (emailError) {
        console.error(`Failed to send payment reminder email for payment ${payment.id}:`, emailError);
      }

      if (payment.tenant?.phone) {
        try {
          await whatsappService.sendMessage(
            payment.tenant.phone,
            `💰 Payment Reminder\n\nHi ${payment.tenant?.name || 'there'}!\n\nA payment of ${formatCurrency(payment.amountSen)} for ${propertyName} is due in ${daysUntilDue} days.\n\nPlease ensure timely payment.\n\n- AMR Home Solutions`
          );
          whatsAppSent++;
        } catch (whatsAppError) {
          console.error(`Failed to send payment reminder WhatsApp for payment ${payment.id}:`, whatsAppError);
        }
      }
    }
  }

  return { created, emailsSent, whatsAppSent };
}

/**
 * Check and create lease expiry notifications (60/30/7 days before)
 * Also sends email notifications to users with configured SMTP
 */
export async function checkLeaseExpiry(): Promise<{ created: number; emailsSent: number }> {
  const days = [60, 30, 7];
  let created = 0;
  let emailsSent = 0;

  for (const day of days) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + day);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Find active leases expiring on this date
    const expiringLeases = await prisma.lease.findMany({
      where: {
        status: 'active',
        endDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        tenant: true,
        room: {
          include: {
            floor: {
              include: {
                property: {
                  select: { id: true, name: true, userId: true },
                },
              },
            },
          },
        },
      },
    });

    for (const lease of expiringLeases) {
      const propertyId = lease.room.floor.property.id;
      const propertyName = lease.room.floor.property.name;
      const propertyUserId = lease.room.floor.property.userId;
      const user = await prisma.user.findUnique({ where: { id: propertyUserId } });
      if (!user?.email) continue;

      // Check if notification already exists
      const existing = await prisma.notification.findFirst({
        where: {
          userId: propertyUserId,
          type: 'lease_expiry',
          data: { contains: lease.id },
        },
      });

      if (!existing) {
        await createNotification({
          type: 'lease_expiry',
          title: 'Lease Expiring Soon',
          message: `Lease for ${lease.tenant.name} at ${propertyName} expires in ${day} days`,
          userId: propertyUserId,
          data: { leaseId: lease.id, tenantId: lease.tenantId, propertyId },
        });
        created++;

        // Send email notification
        try {
          await emailService.sendLeaseExpiryNotice({
            tenantName: lease.tenant.name,
            propertyName,
            endDate: new Date(lease.endDate),
            daysUntilExpiry: day,
          }, user.email);
          emailsSent++;
        } catch (emailError) {
          console.error(`Failed to send lease expiry email for lease ${lease.id}:`, emailError);
        }
      }
    }
  }

  return { created, emailsSent };
}
