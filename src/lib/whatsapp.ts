// WhatsApp Business API integration using Meta Cloud API (Free tier: 1,000 conversations/month)
// Handles automated WhatsApp messages for AIrene

const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_ADMIN_PHONE = process.env.WHATSAPP_ADMIN_PHONE;

const WHATSAPP_API_URL = 'https://graph.facebook.com/v20.0';

interface WhatsAppResponse {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<WhatsAppResponse> {
  if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
    console.log('[WhatsApp] Not configured. Would send to:', to, 'message:', message);
    return { success: false, error: 'whatsapp_not_configured' };
  }

  const url = `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: message },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[WhatsApp] Send failed:', data);
      return { success: false, error: data.error?.message || 'Send failed' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('[WhatsApp] Send error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  variables: string[]
): Promise<WhatsAppResponse> {
  if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
    console.log('[WhatsApp] Not configured. Would send template:', templateName, 'to:', to);
    return { success: false, error: 'whatsapp_not_configured' };
  }

  const url = `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: variables.map((text) => ({ type: 'text', text })),
            },
          ],
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[WhatsApp] Template send failed:', data);
      return { success: false, error: data.error?.message || 'Template send failed' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('[WhatsApp] Template send error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sendViewingConfirmation(
  to: string,
  name: string,
  date: string,
  time: string
): Promise<WhatsAppResponse> {
  const formattedPhone = formatPhoneNumber(to);

  if (!isValidMalaysianPhone(formattedPhone)) {
    return { success: false, error: 'Invalid phone number' };
  }

  const message =
    `Hi ${name}! ✅\n\n` +
    `Your viewing is confirmed!\n` +
    `📅 Date: ${date}\n` +
    `⏰ Time: ${time}\n\n` +
    `See you there! 🤝\n\n` +
    `- AIrene, AMR Home Solutions`;

  return sendWhatsAppMessage(formattedPhone, message);
}

export async function sendInquiryAlert(
  adminPhone: string,
  prospectName: string,
  prospectPhone: string,
  message: string
): Promise<WhatsAppResponse> {
  const formattedAdminPhone = formatPhoneNumber(adminPhone);

  if (!isValidMalaysianPhone(formattedAdminPhone)) {
    return { success: false, error: 'Invalid admin phone number' };
  }

  const alert =
    `🔔 New Inquiry Alert\n\n` +
    `Prospect: ${prospectName}\n` +
    `Phone: ${prospectPhone}\n` +
    `Message: ${message || 'No message'}\n\n` +
    `- AIrene Bot`;

  return sendWhatsAppMessage(formattedAdminPhone, alert);
}

export async function sendPaymentReminder(
  to: string,
  tenantName: string,
  propertyName: string,
  amount: string,
  dueDate: string
): Promise<WhatsAppResponse> {
  const formattedPhone = formatPhoneNumber(to);

  if (!isValidMalaysianPhone(formattedPhone)) {
    return { success: false, error: 'Invalid phone number' };
  }

  const reminder =
    `💰 Payment Reminder\n\n` +
    `Hi ${tenantName}!\n\n` +
    `A payment of ${amount} for ${propertyName} is due on ${dueDate}.\n\n` +
    `Please ensure timely payment to avoid any issues.\n\n` +
    `- AMR Home Solutions`;

  return sendWhatsAppMessage(formattedPhone, reminder);
}

export function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');

  if (!cleaned.startsWith('60')) {
    if (cleaned.startsWith('0')) {
      cleaned = '60' + cleaned.slice(1);
    } else {
      cleaned = '60' + cleaned;
    }
  }

  return cleaned;
}

export function isValidMalaysianPhone(phone: string): boolean {
  const cleaned = formatPhoneNumber(phone);
  return /^601[0-9]\d{7,9}$/.test(cleaned);
}

export function isWhatsAppConfigured(): boolean {
  return !!(WHATSAPP_PHONE_NUMBER_ID && WHATSAPP_ACCESS_TOKEN);
}

export { WHATSAPP_ADMIN_PHONE };
