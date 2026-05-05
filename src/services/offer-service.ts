import { prisma } from '@/lib/prisma';
import { ringgitToSen, senToRinggit } from '@/lib/format';

export interface CreateOfferInput {
  roomId: string;
  prospectId: string;
  amountSen: number;
  moveInDate: Date;
}

export interface EvaluationResult {
  decision: 'auto_accept' | 'auto_reject' | 'review';
  reason: string;
  rulesMatched: string[];
}

export async function createOffer(input: CreateOfferInput) {
  const room = await prisma.room.findUnique({
    where: { id: input.roomId },
  });

  if (!room || room.status !== 'available') {
    throw new Error('Room not available for offers');
  }

  const prospect = await prisma.prospect.findUnique({
    where: { id: input.prospectId },
  });

  if (!prospect) {
    throw new Error('Prospect not found');
  }

  return prisma.offer.create({
    data: {
      roomId: input.roomId,
      prospectId: input.prospectId,
      amountSen: input.amountSen,
      moveInDate: input.moveInDate,
      status: 'pending',
    },
    include: {
      room: {
        include: {
          floor: {
            include: {
              property: { select: { name: true } }
            }
          }
        }
      },
      prospect: true,
    },
  });
}

export async function getOffers(userId: string, filters?: { status?: string; roomId?: string }) {
  const where: Record<string, unknown> = {
    room: { floor: { property: { userId } } },
  };
  if (filters?.status) where.status = filters.status;
  if (filters?.roomId) where.roomId = filters.roomId;

  return prisma.offer.findMany({
    where,
    include: {
      room: {
        include: {
          floor: {
            include: {
              property: { select: { name: true } }
            }
          }
        }
      },
      prospect: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getOffer(id: string) {
  return prisma.offer.findUnique({
    where: { id },
    include: {
      room: {
        include: {
          floor: {
            include: {
              property: { select: { name: true } }
            }
          }
        }
      },
      prospect: true,
    },
  });
}

export async function evaluateOffer(id: string): Promise<EvaluationResult> {
  const offer = await prisma.offer.findUnique({
    where: { id },
    include: { room: true },
  });

  if (!offer) {
    throw new Error('Offer not found');
  }

  const rent = offer.room.rentSen;
  const offerAmount = offer.amountSen;
  const rulesMatched: string[] = [];
  let decision: EvaluationResult['decision'] = 'review';
  let reason = 'Manual review required';

  if (offerAmount >= rent) {
    decision = 'auto_accept';
    reason = 'Meets or exceeds asking rent';
    rulesMatched.push('market_rate_match');
  } else if (offerAmount < rent * 0.9) {
    decision = 'auto_reject';
    reason = 'Below 90% of asking rent';
    rulesMatched.push('below_market');
  } else if (offerAmount >= rent * 0.9) {
    decision = 'review';
    reason = 'Negotiable range - requires review';
    rulesMatched.push('negotiable');
  }

  await prisma.offer.update({
    where: { id },
    data: {
      status: decision === 'auto_accept' ? 'accepted' : decision === 'auto_reject' ? 'rejected' : 'pending',
      evaluatedBy: 'rules_engine',
    },
  });

  return { decision, reason, rulesMatched };
}

export async function acceptOffer(id: string, evaluatedBy: string = 'admin') {
  return prisma.offer.update({
    where: { id },
    data: {
      status: 'accepted',
      evaluatedBy,
    },
  });
}

export async function rejectOffer(id: string, evaluatedBy: string = 'admin') {
  return prisma.offer.update({
    where: { id },
    data: {
      status: 'rejected',
      evaluatedBy,
    },
  });
}