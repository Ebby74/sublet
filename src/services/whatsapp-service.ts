/**
 * WhatsApp Service
 *
 * Handles sending WhatsApp broadcasts and messages via Meta WhatsApp Cloud API.
 */

import { prisma } from '@/lib/prisma';
import { marketingChannelService } from './marketing-channel-service';
import {
  sendWhatsAppMessage,
  sendWhatsAppTemplate,
  sendViewingConfirmation,
  sendInquiryAlert,
  formatPhoneNumber,
  isValidMalaysianPhone,
} from '@/lib/whatsapp';

interface PropertyData {
  id: string;
  name: string;
  address: string;
  rentAmountSen: number;
  type: string;
}

interface BroadcastResult {
  success: boolean;
  sentCount: number;
  failedCount: number;
  errors?: string[];
}

export class WhatsAppService {
  async sendMessage(
    to: string,
    body: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const formattedPhone = formatPhoneNumber(to);

      if (!isValidMalaysianPhone(formattedPhone)) {
        return {
          success: false,
          error: 'Invalid phone number',
        };
      }

      const result = await sendWhatsAppMessage(formattedPhone, body);

      if (result.success) {
        return {
          success: true,
          messageId: (result.data as Record<string, any>)?.messages?.[0]?.id as string | undefined,
        };
      }

      return {
        success: false,
        error: result.error as string | undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
      };
    }
  }

  async sendTemplate(
    to: string,
    templateName: string,
    variables: string[]
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const formattedPhone = formatPhoneNumber(to);

      if (!isValidMalaysianPhone(formattedPhone)) {
        return {
          success: false,
          error: 'Invalid phone number',
        };
      }

      const result = await sendWhatsAppTemplate(formattedPhone, templateName, variables);

      if (result.success) {
        return {
          success: true,
          messageId: (result.data as Record<string, any>)?.messages?.[0]?.id as string | undefined,
        };
      }

      return {
        success: false,
        error: result.error as string | undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send template',
      };
    }
  }

  async notifyViewingConfirmation(
    to: string,
    name: string,
    date: string,
    time: string
  ): Promise<{ success: boolean; error?: string }> {
    const result = await sendViewingConfirmation(to, name, date, time);
    return {
      success: result.success,
      error: result.error as string | undefined,
    };
  }

  async notifyAdminInquiry(
    adminPhone: string,
    prospectName: string,
    prospectPhone: string,
    message: string
  ): Promise<{ success: boolean; error?: string }> {
    const result = await sendInquiryAlert(adminPhone, prospectName, prospectPhone, message);
    return {
      success: result.success,
      error: result.error as string | undefined,
    };
  }

  async broadcastToTenants(
    userId: string,
    property: PropertyData,
    tenantIds?: string[]
  ): Promise<BroadcastResult> {
    const isEnabled = await marketingChannelService.isChannelEnabled(userId, 'whatsapp');
    if (!isEnabled) {
      return {
        success: false,
        sentCount: 0,
        failedCount: 0,
        errors: ['WhatsApp channel not enabled'],
      };
    }

    const config = await marketingChannelService.getChannelConfig(userId, 'whatsapp');
    if (!config?.whatsapp) {
      return {
        success: false,
        sentCount: 0,
        failedCount: 0,
        errors: ['WhatsApp not configured in settings'],
      };
    }

    const tenantWhere: Record<string, unknown> = {
      userId,
      phone: { not: null },
    };

    if (tenantIds && tenantIds.length > 0) {
      tenantWhere.id = { in: tenantIds };
    }

    const tenants = await prisma.tenant.findMany({
      where: tenantWhere,
      select: { id: true, name: true, phone: true },
    });

    if (tenants.length === 0) {
      return {
        success: true,
        sentCount: 0,
        failedCount: 0,
        errors: ['No tenants with phone numbers found'],
      };
    }

    const rentFormatted = new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 0,
    }).format(property.rentAmountSen / 100);

    const message =
      `🏠 New Property Available!\n\n` +
      `Name: ${property.name}\n` +
      `Address: ${property.address}\n` +
      `Rent: ${rentFormatted}/month\n` +
      `Type: ${property.type}\n\n` +
      `Interested? Reply YES to arrange a viewing!`;

    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const tenant of tenants) {
      if (!tenant.phone) continue;

      const result = await this.sendMessage(tenant.phone, message);

      if (result.success) {
        sentCount++;
      } else {
        failedCount++;
        errors.push(`${tenant.name}: ${result.error}`);
      }
    }

    return {
      success: failedCount === 0,
      sentCount,
      failedCount,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}

export const whatsappService = new WhatsAppService();
