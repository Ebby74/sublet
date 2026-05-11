import { prisma } from '@/lib/prisma';
import { getRoom } from './room-service';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface RoomDetails {
  name: string;
  type: string;
  beds: number;
  baths: number;
  areaSqft?: number;
  rentSen: number;
  propertyName?: string;
  propertyAddress?: string;
  property?: {
    name: string;
    address: string;
  };
}

function extractRoomDetails(room: Awaited<ReturnType<typeof getRoom>>): RoomDetails | null {
  if (!room) return null;
  const property = room.floor?.property;
  return {
    name: room.name,
    type: room.type,
    beds: room.beds,
    baths: room.baths,
    areaSqft: room.areaSqft ?? undefined,
    rentSen: room.rentSen,
    propertyName: property?.name,
    propertyAddress: property?.address,
    property: property,
  };
}

function buildPrompt(details: RoomDetails): string {
  const rent = (details.rentSen / 100).toFixed(0);
  const area = details.areaSqft ? `${details.areaSqft} sq ft` : 'spacious';

  return `Generate a compelling, marketing-focused description for a rental room with these details:
- Room: ${details.name}
- Type: ${details.type}
- Beds: ${details.beds}, Baths: ${details.baths}
- Area: ${area}
- Rent: RM ${rent}/month
${details.propertyAddress ? `- Location: ${details.propertyAddress}` : ''}

Write 2-3 sentences highlighting key features. Make it appealing to potential tenants in Malaysia.`;
}

export async function generateRoomDescription(
  roomId: string,
  userId: string
): Promise<{ success: boolean; description?: string; error?: string }> {
  const room = await getRoom(roomId);
  if (!room) {
    return { success: false, error: 'Room not found' };
  }

  const details = extractRoomDetails(room);
  if (!details) {
    return { success: false, error: 'Could not extract room details' };
  }

  const prompt = buildPrompt(details);

  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return { success: false, error: 'Groq not configured' };
    }

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a professional property copywriter. Write compelling rental descriptions.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      return { success: false, error: 'Failed to get AI response' };
    }

    const data = await response.json();
    const description = data.choices?.[0]?.message?.content;
    if (!description) {
      return { success: false, error: 'No response from AI' };
    }

    let history: Array<{
      version: number;
      text: string;
      createdAt: string;
      createdBy: string;
      source: string;
    }> = [];
    try {
      const existingRoom = await prisma.room.findUnique({
        where: { id: roomId },
        select: { descriptionHistory: true },
      });
      if (existingRoom?.descriptionHistory) {
        history = JSON.parse(existingRoom.descriptionHistory);
      }
    } catch {
      history = [];
    }

    const newVersion = history.length > 0 ? Math.max(...history.map((h) => h.version)) + 1 : 1;

    const historyEntry = {
      version: newVersion,
      text: description,
      createdAt: new Date().toISOString(),
      createdBy: userId,
      source: 'ai',
    };

    history.push(historyEntry);
    const trimmedHistory = history.slice(-10);

    await prisma.room.update({
      where: { id: roomId },
      data: {
        description,
        descriptionV2: description,
        descriptionHistory: JSON.stringify(trimmedHistory),
      },
    });

    return { success: true, description };
  } catch (error) {
    console.error('AI description generation error:', error);
    return { success: false, error: 'Failed to generate description' };
  }
}
