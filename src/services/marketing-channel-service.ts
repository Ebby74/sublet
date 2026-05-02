/**
 * Marketing Channel Service
 * 
 * Handles CRUD operations for marketing channel configuration.
 * Users can enable/disable Instagram, Facebook, WhatsApp, and Website channels.
 */

import { prisma } from '@/lib/prisma';

export type MarketingChannel = 'instagram' | 'facebook' | 'whatsapp' | 'website';

export interface ChannelConfig {
  instagram?: {
    accessToken: string;
    igUserId: string;
  };
  facebook?: {
    accessToken: string;
    pageId: string;
  };
  whatsapp?: {
    twilioSid: string;
    authToken: string;
    senderNumber: string;
  };
  website?: {
    feedUrl: string;
  };
}

export class MarketingChannelService {
  // Get all channels for a user
  async getChannels(userId: string): Promise<Record<string, { enabled: boolean; config?: ChannelConfig }>> {
    const channels = await prisma.marketingChannel.findMany({
      where: { userId },
    });

    const result: Record<string, { enabled: boolean; config?: ChannelConfig }> = {
      instagram: { enabled: false },
      facebook: { enabled: false },
      whatsapp: { enabled: false },
      website: { enabled: false },
    };

    for (const channel of channels) {
      result[channel.channel] = {
        enabled: channel.enabled,
        config: channel.config ? JSON.parse(channel.config) : undefined,
      };
    }

    return result;
  }

  // Update channel settings
  async updateChannel(
    userId: string,
    channel: MarketingChannel,
    enabled: boolean,
    config?: ChannelConfig
  ): Promise<void> {
    await prisma.marketingChannel.upsert({
      where: {
        userId_channel: { userId, channel },
      },
      update: {
        enabled,
        config: config ? JSON.stringify(config) : null,
      },
      create: {
        channel,
        enabled,
        config: config ? JSON.stringify(config) : null,
        userId,
      },
    });
  }

  // Check if a specific channel is enabled
  async isChannelEnabled(userId: string, channel: MarketingChannel): Promise<boolean> {
    const record = await prisma.marketingChannel.findUnique({
      where: {
        userId_channel: { userId, channel },
      },
    });
    return record?.enabled ?? false;
  }

  // Get channel configuration
  async getChannelConfig(userId: string, channel: MarketingChannel): Promise<ChannelConfig | null> {
    const record = await prisma.marketingChannel.findUnique({
      where: {
        userId_channel: { userId, channel },
      },
    });
    return record?.config ? JSON.parse(record.config) : null;
  }
}

export const marketingChannelService = new MarketingChannelService();
