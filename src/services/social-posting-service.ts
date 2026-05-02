/**
 * Social Posting Service
 * 
 * Handles posting vacant properties to Instagram and Facebook via Meta Graph API.
 */

import { marketingChannelService } from './marketing-channel-service';

interface PropertyData {
  id: string;
  name: string;
  address: string;
  rentAmountSen: number;
  description?: string;
  type: string;
}

export interface PostResult {
  success: boolean;
  postId?: string;
  platform: 'instagram' | 'facebook';
  error?: string;
}

export class SocialPostingService {
  // Post to Instagram
  async postToInstagram(
    userId: string,
    property: PropertyData
  ): Promise<PostResult> {
    // Check if channel is enabled
    const isEnabled = await marketingChannelService.isChannelEnabled(userId, 'instagram');
    if (!isEnabled) {
      return { success: false, platform: 'instagram', error: 'Instagram not enabled' };
    }

    // Get config
    const config = await marketingChannelService.getChannelConfig(userId, 'instagram');
    if (!config?.instagram) {
      return { success: false, platform: 'instagram', error: 'Instagram not configured' };
    }

    const { accessToken, igUserId } = config.instagram;

    // Generate caption
    const caption = this.generateCaption(property);

    // Use a placeholder image for MVP
    // In production, you would upload an actual property photo
    const imageUrl = 'https://via.placeholder.com/1080x1080.png?text=Property+Listing';

    try {
      // Step 1: Create media container
      const containerResponse = await fetch(
        `https://graph.facebook.com/v25.0/${igUserId}/media`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: imageUrl,
            caption: caption,
            access_token: accessToken,
          }),
        }
      );

      const containerData = await containerResponse.json();

      if (containerData.error) {
        return { success: false, platform: 'instagram', error: containerData.error.message };
      }

      // Step 2: Publish the media
      const publishResponse = await fetch(
        `https://graph.facebook.com/v25.0/${igUserId}/media_publish`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            creation_id: containerData.id,
            access_token: accessToken,
          }),
        }
      );

      const publishData = await publishResponse.json();

      if (publishData.error) {
        return { success: false, platform: 'instagram', error: publishData.error.message };
      }

      return { success: true, postId: publishData.id, platform: 'instagram' };
    } catch (error) {
      return {
        success: false,
        platform: 'instagram',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Post to Facebook (via Page Photos API)
  async postToFacebook(
    userId: string,
    property: PropertyData
  ): Promise<PostResult> {
    // Check if channel is enabled
    const isEnabled = await marketingChannelService.isChannelEnabled(userId, 'facebook');
    if (!isEnabled) {
      return { success: false, platform: 'facebook', error: 'Facebook not enabled' };
    }

    const config = await marketingChannelService.getChannelConfig(userId, 'facebook');
    if (!config?.facebook) {
      return { success: false, platform: 'facebook', error: 'Facebook not configured' };
    }

    const { accessToken, pageId } = config.facebook;
    const caption = this.generateCaption(property);
    const imageUrl = 'https://via.placeholder.com/1200x630.png?text=Property+Listing';

    try {
      // Post to Facebook Page
      const response = await fetch(
        `https://graph.facebook.com/v25.0/${pageId}/photos`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: imageUrl,
            caption: caption,
            access_token: accessToken,
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        return { success: false, platform: 'facebook', error: data.error.message };
      }

      return { success: true, postId: data.id, platform: 'facebook' };
    } catch (error) {
      return {
        success: false,
        platform: 'facebook',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Post to both Instagram and Facebook
  async postToAll(userId: string, property: PropertyData): Promise<PostResult[]> {
    const results: PostResult[] = [];

    // Post to Instagram
    const igResult = await this.postToInstagram(userId, property);
    results.push(igResult);

    // Post to Facebook
    const fbResult = await this.postToFacebook(userId, property);
    results.push(fbResult);

    return results;
  }

  // Generate caption for property
  private generateCaption(property: PropertyData): string {
    const rentFormatted = new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 0,
    }).format(property.rentAmountSen / 100);

    let caption = `🏠 ${property.name}\n`;
    caption += `📍 ${property.address}\n`;
    caption += `💰 ${rentFormatted}/month\n`;
    caption += `🏠 Type: ${property.type}\n`;

    if (property.description) {
      caption += `\n${property.description}`;
    }

    caption += `\n\n#rent #property #malaysia #sublet`;

    return caption;
  }
}

export const socialPostingService = new SocialPostingService();
