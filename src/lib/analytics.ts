// Analytics utility for tracking user interactions across GA4, Meta Pixel, TikTok Pixel, and WhatsApp
// Aligned with AIrene's mission: track all engagements automatically

declare global {
  interface Window {
    gtag?: (command: string, targetId: string, config?: Record<string, unknown>) => void;
    fbq?: (command: string, eventName: string, params?: Record<string, unknown>) => void;
    ttq?: (command: string, eventName: string, params?: Record<string, unknown>) => void;
  }
}

export type TrackingEvent =
  | 'page_view'
  | 'cta_click'
  | 'carousel_interaction'
  | 'chat_launched'
  | 'inquiry_start'
  | 'inquiry_complete'
  | 'lead_magnet_download'
  | 'room_share'
  | 'whatsapp_click'
  | 'phone_click'
  | 'scroll_depth'
  | 'form_step_complete';

interface TrackEventParams {
  event: TrackingEvent;
  params?: Record<string, unknown>;
}

interface IdentifyParams {
  email?: string;
  phone?: string;
  name?: string;
  userId?: string;
}

// Main tracking function - fires to all platforms simultaneously
export function trackEvent({ event, params = {} }: TrackEventParams) {
  if (typeof window === 'undefined') return;

  const eventParams = {
    ...params,
    timestamp: new Date().toISOString(),
  };

  // Google Analytics 4
  if (window.gtag) {
    window.gtag('event', event, eventParams);
  }

  // Meta (Facebook) Pixel
  if (window.fbq) {
    window.fbq('track', event, eventParams);
  }

  // TikTok Pixel
  if (window.ttq) {
    window.ttq('track', event, eventParams);
  }
}

// Identify user across platforms (for logged-in users or after inquiry)
export function identifyUser({ email, phone, name, userId }: IdentifyParams) {
  if (typeof window === 'undefined') return;

  // GA4 User Properties
  if (window.gtag && userId) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
      user_id: userId,
      user_properties: {
        email,
        phone,
        name,
      },
    });
  }

  // Meta Pixel - track complete registration
  if (window.fbq && email) {
    window.fbq('track', 'CompleteRegistration', {
      content_name: 'user_identified',
      email,
      phone,
    });
  }
}

// Track UTM parameters on page load
export function trackUTMParams() {
  if (typeof window === 'undefined') return;

  const urlParams = new URLSearchParams(window.location.search);
  const utmParams = {
    utm_source: urlParams.get('utm_source'),
    utm_medium: urlParams.get('utm_medium'),
    utm_campaign: urlParams.get('utm_campaign'),
    utm_content: urlParams.get('utm_content'),
    utm_term: urlParams.get('utm_term'),
    gclid: urlParams.get('gclid'), // Google Ads
    fbclid: urlParams.get('fbclid'), // Facebook
    ttclid: urlParams.get('ttclid'), // TikTok
  };

  // Filter out nulls
  const filteredParams = Object.fromEntries(
    Object.entries(utmParams).filter(([, v]) => v !== null)
  );

  if (Object.keys(filteredParams).length > 0) {
    trackEvent({
      event: 'page_view',
      params: filteredParams,
    });
  }

  return filteredParams;
}

// WhatsApp click tracking with pre-filled message
export function trackWhatsAppClick(phoneNumber: string, message?: string) {
  trackEvent({
    event: 'whatsapp_click',
    params: { phone_number: phoneNumber, message },
  });
}

// Scroll depth tracking helper
let maxScrollDepth = 0;
export function trackScrollDepth() {
  if (typeof window === 'undefined') return;

  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;

  if (scrollPercent > maxScrollDepth) {
    maxScrollDepth = scrollPercent;

    // Track at 25%, 50%, 75%, 100%
    if (maxScrollDepth >= 25 && maxScrollDepth < 50) {
      trackEvent({ event: 'scroll_depth', params: { depth: '25%' } });
    } else if (maxScrollDepth >= 50 && maxScrollDepth < 75) {
      trackEvent({ event: 'scroll_depth', params: { depth: '50%' } });
    } else if (maxScrollDepth >= 75 && maxScrollDepth < 100) {
      trackEvent({ event: 'scroll_depth', params: { depth: '75%' } });
    } else if (maxScrollDepth >= 100) {
      trackEvent({ event: 'scroll_depth', params: { depth: '100%' } });
    }
  }
}

// Hook for React components to use tracking
export function useTracking() {
  return {
    trackEvent,
    identifyUser,
    trackUTMParams,
    trackWhatsAppClick,
    trackScrollDepth,
  };
}
