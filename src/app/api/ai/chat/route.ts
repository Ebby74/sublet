import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
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

const getOpenAI = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
};

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
  Step 1: Ask for WhatsApp/phone number
  Step 2: Ask for email (optional, they can skip)
  Step 3: Ask about their requirements (location, budget, move-in date, room type)
  Step 4: Confirm everything, say you'll send options via WhatsApp within 2 minutes

When the prospect has provided all info (step 3+), summarise warmly and let them know someone from AMR Home Solutions may contact them for viewing arrangements.

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

    const { message, history = [], step = 0, roomId } = parsed.data;

    let openai;
    try {
      openai = getOpenAI();
    } catch {
      return NextResponse.json({
        reply: `Hi there! I'd love to help you find a room. Our rooms range from RM 450 to RM 950 per month across several locations in KL. What's your name so I can assist you better?`,
      });
    }

    const contextualPrompt = step !== undefined
      ? `${SYSTEM_PROMPT}\n\nCurrent conversation step: ${step}. Respond accordingly.`
      : SYSTEM_PROMPT;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: contextualPrompt },
        ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user', content: message },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content
      || 'I\'m here to help! Could you tell me more about what kind of room you\'re looking for?';

    return NextResponse.json({ reply, step, roomId });
  } catch (error) {
    log.error({ error }, 'AI chat error');
    return NextResponse.json({
      reply: 'I\'m having trouble connecting right now. Please try again in a moment!',
    });
  }
}
