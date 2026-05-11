import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withRequestContext } from '@/lib/logger';

const ChatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required').max(2000, 'Message too long'),
  history: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ).max(50, 'History too long').optional(),
  step: z.number().int().min(0).max(4).optional(),
  roomId: z.string().uuid().optional(),
});

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are AIrene, the AI rental assistant for AMR Home Solutions — a co-living room rental platform in Kuala Lumpur, Malaysia.

YOUR ROLE:
- Greet prospects warmly and make them feel welcome
- Answer questions about available rooms, locations, pricing
- Collect prospect contact info naturally (name, phone, email)
- Handle objections professionally
- Guide prospects toward booking a viewing
- Follow the conversation step provided by the system

LOCATIONS & PROPERTIES:
- Areas: Keramat, Sri Nilam, Teratai, Pandan Jaya, Pandan Indah, Pandan Cahaya
- Room types: Master Bedroom, Premium Room, Cozy Room, Standard Room, Deluxe Suite
- Price range: RM 450 – RM 950 per month
- All rooms fully furnished, move-in ready, utilities included

CONVERSATION STYLE:
- Friendly, conversational, professional — like a helpful property agent
- Keep responses concise (2-4 sentences max)
- Use natural Malaysian English, occasional Malay words are fine
- Use emojis sparingly but warmly
- Never say "as an AI" or "I don't have real-time data"
- If unsure about specifics, offer to have a real agent follow up

COLLECTING INFO — follow these steps based on the "step" value provided:
  Step 0: Ask for their name
  Step 1: Ask about their needs — what area/location they prefer, budget range, room type, near what amenities or their workplace. Be conversational.
  Step 2: Based on their needs, suggest available rooms/areas that match. Then ask for their WhatsApp/phone to send details or arrange viewing.
  Step 3: Ask for email (optional, they can skip). Say you'll send room options via WhatsApp.
  Step 4: Confirm everything warmly. Let them know AIrene will send options via WhatsApp within 2 minutes.

IMPORTANT: Do NOT ask for phone/email before learning what they want. Understand their needs first (step 1), then collect contact info (steps 2-3).

IF they ask questions outside the flow, answer naturally then gently guide back to collecting info.

CURRENCY: Always use RM (Malaysian Ringgit).
DATE FORMAT: DD/MM/YYYY for any dates you mention.`;

export async function POST(req: NextRequest) {
  const log = withRequestContext(req, { route: 'ai/chat' });
  try {
    const body = await req.json();
    const parsed = ChatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { reply: 'Hello! How can I help you find a room today?' },
        { status: 400 }
      );
    }

    const { message, history = [], step = 0 } = parsed.data;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        reply: `Hi there! I'd love to help you find a room. Our rooms range from RM 450 to RM 950 per month across several locations in KL. What's your name so I can assist you better?`,
      });
    }

    const contextualPrompt = step !== undefined
      ? `${SYSTEM_PROMPT}\n\nCurrent conversation step: ${step}. Respond accordingly.`
      : SYSTEM_PROMPT;

    const messages = [
      { role: 'system', content: contextualPrompt },
      ...history.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      log.error({ status: response.status, error: errorText }, 'Groq API error');
      return NextResponse.json({
        reply: 'I\'m having trouble connecting right now. Please try again in a moment!',
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content
      || 'I\'m here to help! Could you tell me more about what kind of room you\'re looking for?';

    return NextResponse.json({ reply, step });
  } catch (error) {
    log.error({ error }, 'AI chat error');
    return NextResponse.json({
      reply: 'I\'m having trouble connecting right now. Please try again in a moment!',
    });
  }
}
