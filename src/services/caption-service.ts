import { getRoom } from './room-service';

type Channel = 'whatsapp' | 'facebook' | 'instagram' | 'propertyGuru' | 'mudah';
type Language = 'en' | 'ms';

interface CaptionOptions {
  channel?: Channel;
  language?: Language;
}

interface GeneratedCaption {
  channel: Channel;
  language: Language;
  text: string;
  characterCount: number;
}

export const CAPTION_TEMPLATES = {
  whatsapp: {
    en: `🏠 {roomName}
📍 {propertyAddress}
💰 RM {rent}/month
🛏️ {beds} bed | 🚿 {baths} bath
📐 {area}
{description}

📲 Interested? Chat with us!`,
    ms: `🏠 {roomName}
📍 {alamat}
💰 RM {sewa}/bulan
🛏️ {bilik} katil | 🚿 {bilik_air} bilik air
📐 {saiz}
{description}

📲 Berminat? Hubungi kami!`,
  },
  facebook: {
    en: `🌟 NEW LISTING - {roomName} 🌟

{description}

✅ Price: RM {rent}/month
✅ {beds} Bed, {baths} Bath
✅ Area: {area}

📍 Location: {propertyAddress}

DM or comment if interested! #Rental #Room #Property #Malaysia`,
    ms: `🌟 SENARAI BARU - {roomName} 🌟

{description}

✅ Harga: RM {sewa}/bulan
✅ {bilik} Katil, {bilik_air} Bilik Air
✅ Saiz: {saiz}

📍 Lokasi: {alamat}

DM atau komen jika berminat! #Sewa #Bilik #Hartanah #Malaysia`,
  },
  instagram: {
    en: `{roomName} • RM {rent}/month

{shortDescription}

{hashtagLine}

💫 Direct message to book a viewing!`,
    ms: `{roomName} • RM {sewa}/bulan

{shortDescriptionMs}

{hashtagLineMs}

💫 Hantar mesej untuk tempahan viewing!`,
  },
  propertyGuru: {
    en: `{roomName} - RM {rent}/month

{description}

Property Type: {type}
Bedrooms: {beds}
Bathrooms: {baths}
Size: {area}

For viewing appointments, please contact us.`,
    ms: `{roomName} - RM {sewa}/bulan

{description}

Jenis Hartanah: {jenis}
Bilik Tidur: {bilik}
Bilik Air: {bilik_air}
Saiz: {saiz}

Untuk temujanji viewing, sila hubungi kami.`,
  },
  mudah: {
    en: `{roomName} for rent! RM {rent}/month. {beds}BR/{baths}BA. {area}. {shortDescription}`,
    ms: `{roomName} untuk disewa! RM {sewa}/bulan. {bilik}KT/{bilik_air}BA. {saiz}. {shortDescriptionMs}`,
  },
};

const HASHTAG_LINE = '#RoomForRent #Property #Malaysia #RentalProperty #Sublet';
const HASHTAG_LINE_MS = '#SewaBilik #Hartanah #Malaysia #BilikUntukSewa #Sublet';

function formatCurrency(sen: number): string {
  return (sen / 100).toFixed(0);
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

function translateType(type: string): string {
  const translations: Record<string, string> = {
    master: 'Bilal/ Master',
    single: 'Sederhana/ Single',
    shared: ' Kongsi/ Shared',
  };
  return translations[type] || type;
}

export async function generateCaptions(
  roomId: string,
  options: CaptionOptions
): Promise<{ success: boolean; captions?: GeneratedCaption[]; error?: string }> {
  const room = await getRoom(roomId);
  if (!room) {
    return { success: false, error: 'Room not found' };
  }

  const language = options.language || 'en';
  const channels = options.channel
    ? [options.channel]
    : (Object.keys(CAPTION_TEMPLATES) as Channel[]);

  const property = room.floor?.property;
  const roomDetails = {
    roomName: room.name,
    type: room.type,
    translatedType: translateType(room.type),
    propertyAddress: property?.address || '',
    bedrooms: room.beds,
    bathrooms: room.baths,
    area: room.areaSqft ? `${room.areaSqft} sq ft` : '',
    rent: formatCurrency(room.rentSen),
    description: room.description || 'Cozy room available for rent.',
    shortDescription: room.description
      ? truncate(room.description, 100)
      : 'Cozy room available for rent.',
    shortDescriptionMs: room.description
      ? truncate(room.description, 100)
      : 'Bilik yang selesa untuk disewa.',
  };

  const captions: GeneratedCaption[] = [];

  for (const channel of channels) {
    const template = CAPTION_TEMPLATES[channel]?.[language];
    if (!template) continue;

    let text = template
      .replace('{roomName}', roomDetails.roomName)
      .replace('{propertyAddress}', roomDetails.propertyAddress || 'Contact for location')
      .replace('{alamat}', roomDetails.propertyAddress || 'Hubungi untuk lokasi')
      .replace('{rent}', roomDetails.rent)
      .replace('{sewa}', roomDetails.rent)
      .replace('{beds}', String(roomDetails.bedrooms))
      .replace('{bilik}', String(roomDetails.bedrooms))
      .replace('{baths}', String(roomDetails.bathrooms))
      .replace('{bilik_air}', String(roomDetails.bathrooms))
      .replace('{area}', roomDetails.area)
      .replace('{saiz}', roomDetails.area)
      .replace('{type}', roomDetails.type)
      .replace('{jenis}', roomDetails.translatedType)
      .replace('{description}', roomDetails.description)
      .replace('{shortDescription}', roomDetails.shortDescription)
      .replace('{shortDescriptionMs}', roomDetails.shortDescriptionMs)
      .replace('{hashtagLine}', HASHTAG_LINE)
      .replace('{hashtagLineMs}', HASHTAG_LINE_MS);

    captions.push({
      channel,
      language,
      text: text.trim(),
      characterCount: text.length,
    });
  }

  return { success: true, captions };
}