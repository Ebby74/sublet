/**
 * Marketing Trigger Service
 * 
 * Handles automatic and manual marketing triggers for vacant properties.
 * Auto-triggers when properties become vacant, manual trigger available via API.
 */

import { prisma } from '@/lib/prisma';
import { getRoom } from './room-service';
import { createPost, markPostPublished, markPostFailed } from './post-history-service';
import { marketingChannelService } from './marketing-channel-service';
import { socialPostingService } from './social-posting-service';
import { whatsappService } from './whatsapp-service';

interface PropertyData {
  id: string;
  name: string;
  address: string;
  type: string;
  rentAmountSen?: number;
  userId?: string;
}

interface RoomData {
  id: string;
  name: string;
  address: string;
  rentAmountSen: number;
  type: string;
  userId: string;
  description?: string;
  caption?: string;
  photos?: string[];
}

interface TriggerResult {
  success: boolean;
  channels: {
    instagram?: { success: boolean; postId?: string; error?: string };
    facebook?: { success: boolean; postId?: string; error?: string };
    whatsapp?: { success: boolean; sentCount: number; error?: string };
  };
  triggeredAt: Date;
}

export class MarketingTriggerService {
  // Auto-trigger: Called when property becomes vacant
  async onPropertyVacant(propertyId: string): Promise<TriggerResult> {
    // Get property with user info and floors/rooms
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { 
        user: true,
        floors: {
          include: {
            rooms: {
              where: { status: 'active', deletedAt: null },
            },
          },
        },
      },
    });

    if (!property || property.floors.every(f => f.rooms.length === 0)) {
      return {
        success: false,
        channels: {},
        triggeredAt: new Date(),
      };
    }

    // Get min rent from active rooms
    const allRooms = property.floors.flatMap(f => f.rooms);
    const minRentSen = allRooms.length > 0 ? Math.min(...allRooms.map(r => r.rentSen)) : 0;

    const propertyData: PropertyData = {
      id: property.id,
      name: property.name,
      address: property.address,
      type: property.type,
      rentAmountSen: minRentSen,
    };

    return this.triggerMarketing(property.userId, propertyData);
  }

  // Manual trigger: User explicitly requests marketing
  async manualTrigger(userId: string, propertyId: string): Promise<TriggerResult> {
    const property = await prisma.property.findFirst({
      where: { id: propertyId, userId },
      include: {
        floors: {
          include: {
            rooms: {
              where: { status: 'active', deletedAt: null },
            },
          },
        },
      },
    });

    if (!property || property.floors.every(f => f.rooms.length === 0)) {
      return {
        success: false,
        channels: {},
        triggeredAt: new Date(),
      };
    }

    const allRooms = property.floors.flatMap(f => f.rooms);
    const minRentSen = allRooms.length > 0 ? Math.min(...allRooms.map(r => r.rentSen)) : 0;

    const propertyData: PropertyData = {
      id: property.id,
      name: property.name,
      address: property.address,
      type: property.type,
      rentAmountSen: minRentSen,
    };

    return this.triggerMarketing(userId, propertyData);
  }

  // Core trigger logic
  private async triggerMarketing(userId: string, property: PropertyData): Promise<TriggerResult> {
    const result: TriggerResult = {
      success: true,
      channels: {},
      triggeredAt: new Date(),
    };

    // Get enabled channels
    const channels = await marketingChannelService.getChannels(userId);

    // Trigger social media (Instagram + Facebook)
    if (channels.instagram?.enabled || channels.facebook?.enabled) {
      try {
        // Try Instagram
        if (channels.instagram?.enabled) {
          const igResult = await socialPostingService.postToInstagram(userId, {
            ...property,
            rentAmountSen: 0, // Not needed for current implementation
          });
          result.channels.instagram = {
            success: igResult.success,
            postId: igResult.postId,
            error: igResult.error,
          };
        }

        // Try Facebook
        if (channels.facebook?.enabled) {
          const fbResult = await socialPostingService.postToFacebook(userId, {
            ...property,
            rentAmountSen: 0,
          });
          result.channels.facebook = {
            success: fbResult.success,
            postId: fbResult.postId,
            error: fbResult.error,
          };
        }
      } catch (error) {
        console.error('Social posting failed:', error);
        result.success = false;
      }
    }

    // Trigger WhatsApp broadcast (to all interested tenants)
    if (channels.whatsapp?.enabled) {
      try {
        const whatsappResult = await whatsappService.broadcastToTenants(userId, {
          ...property,
          rentAmountSen: 0,
        });
        result.channels.whatsapp = {
          success: whatsappResult.success,
          sentCount: whatsappResult.sentCount,
          error: whatsappResult.errors?.join(', '),
        };
      } catch (error) {
        console.error('WhatsApp broadcast failed:', error);
        result.success = false;
      }
    }

    // Note: Website feed is always "published" - it just reflects current state

    return result;
  }

  // Check if property should auto-post (called from lease status changes)
  async checkAutoPost(propertyId: string): Promise<void> {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { status: true },
    });

    if (property?.status === 'vacant') {
      await this.onPropertyVacant(propertyId);
    }
  }

  // ============ Room-specific triggers ============

  // Auto-trigger: Called when room status becomes 'active'
  async onRoomActive(roomId: string): Promise<TriggerResult> {
    const room = await getRoom(roomId);
    if (!room || room.status !== 'active') {
      return {
        success: false,
        channels: {},
        triggeredAt: new Date(),
      };
    }

    const property = room.floor?.property;
    const roomData: RoomData = {
      id: room.id,
      name: room.name,
      address: property?.address ?? '',
      rentAmountSen: room.rentSen,
      type: room.type,
      userId: property?.userId ?? '',
      description: room.description ?? undefined,
      caption: room.caption ?? undefined,
      photos: room.photos ? JSON.parse(room.photos) : [],
    };

    return this.triggerMarketing(roomData.userId, roomData);
  }

  // Manual trigger: User explicitly requests room marketing
  async manualRoomTrigger(userId: string, roomId: string): Promise<TriggerResult> {
    const room = await getRoom(roomId);
    if (!room) {
      return {
        success: false,
        channels: {},
        triggeredAt: new Date(),
      };
    }

    const property = room.floor?.property;
    const roomData: RoomData = {
      id: room.id,
      name: room.name,
      address: property?.address ?? '',
      rentAmountSen: room.rentSen,
      type: room.type,
      userId: property?.userId ?? '',
      description: room.description ?? undefined,
      caption: room.caption ?? undefined,
      photos: room.photos ? JSON.parse(room.photos) : [],
    };

    return this.triggerMarketing(userId, roomData);
  }

  // Core trigger logic for rooms
  private async triggerRoomMarketing(userId: string, room: RoomData): Promise<TriggerResult> {
    const result: TriggerResult = {
      success: true,
      channels: {},
      triggeredAt: new Date(),
    };

    const channels = await marketingChannelService.getChannels(userId);

    // Trigger social media (Instagram + Facebook)
    if (channels.instagram?.enabled || channels.facebook?.enabled) {
      try {
        // Try Instagram
        if (channels.instagram?.enabled) {
          const postContent = room.caption ?? room.description ?? `Room available: ${room.name}`;
          const igResult = await socialPostingService.postToInstagram(userId, {
            id: room.id,
            name: room.name,
            address: room.address,
            rentAmountSen: room.rentAmountSen,
            type: room.type,
          });
          result.channels.instagram = {
            success: igResult.success,
            postId: igResult.postId,
            error: igResult.error,
          };
        }

        // Try Facebook
        if (channels.facebook?.enabled) {
          const fbResult = await socialPostingService.postToFacebook(userId, {
            id: room.id,
            name: room.name,
            address: room.address,
            rentAmountSen: room.rentAmountSen,
            type: room.type,
          });
          result.channels.facebook = {
            success: fbResult.success,
            postId: fbResult.postId,
            error: fbResult.error,
          };
        }
      } catch (error) {
        console.error('Social posting failed:', error);
        result.success = false;
      }
    }

    // Trigger WhatsApp broadcast
    if (channels.whatsapp?.enabled) {
      try {
        const whatsappResult = await whatsappService.broadcastToTenants(userId, {
          id: room.id,
          name: room.name,
          address: room.address,
          rentAmountSen: room.rentAmountSen,
          type: room.type,
        });
        result.channels.whatsapp = {
          success: whatsappResult.success,
          sentCount: whatsappResult.sentCount,
          error: whatsappResult.errors?.join(', '),
        };
      } catch (error) {
        console.error('WhatsApp broadcast failed:', error);
        result.success = false;
      }
    }

    return result;
  }
}

export const marketingTriggerService = new MarketingTriggerService();
