# Phase 16: Offer & Viewing System - Research

**Researched:** 2026-04-23
**Domain:** Booking/scheduling systems, WhatsApp integration, offer letter generation
**Confidence:** MEDIUM

## Summary

This phase implements the offer and viewing booking system for the rental funnel. Key components include:

1. **Viewing Booking System** (16.01): Allows prospects to book viewing slots for rooms, with WhatsApp confirmation delivery
2. **Offer System** (16.02): Accepts rental offers from prospects with automated evaluation
3. **Offer Flow Integration** (16.03): Generates offer letters and creates tenants from accepted offers

The project already has existing infrastructure that can be extended:
- Room model exists (from Phase 12)
- Lease service handles tenant creation
- WhatsApp service uses Twilio for message delivery

**Primary recommendation:** Use existing Twilio WhatsApp infrastructure for viewing confirmations, implement offer evaluation rules engine, generate PDF offer letters with PDFKit.

---

## Existing Code Review

### Room Model (prisma/schema.prisma)
- Already exists with fields: `propertyId`, `name`, `type`, `beds`, `baths`, `areaSqft`, `rentSen`, `depositSen`, `photos`, `videos`, `status`
- Status values: `draft`, `active`, `rented`
- Room → Property relationship exists

### Lease Service (src/services/lease-service.ts)
- `createLease()` - Creates lease with property/tenant relationship
- `getActiveLeases()` - Retrieves active leases
- `extendLease()` - Extends lease end date
- `terminateLease()` - Terminates active lease
- Uses `ringgitToSen()` for currency conversion

### WhatsApp Service (src/services/whatsapp-service.ts)
- Mock implementation ready for Twilio integration
- Uses `marketingChannelService` for config management
- Format: `whatsapp:+1555XXXXXXX` (E.164 format)
- Message generation method exists
- Ready for viewing confirmation messages

### Room Service (src/services/room-service.ts)
- Full CRUD operations
- Media management (photos/videos)
- Status updates
- `updateRoomStatus()` available

---

## Standard Stack

### Core Dependencies
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|------------|
| twilio | ^5.x | WhatsApp message delivery | Official Twilio SDK (requires install) |
| pdfkit | ^2.x | PDF offer letter generation | Mature, well-documented, no external APIs |
| date-fns | ^4.x | Date/time formatting | Already in project |
| zod | ^3.x | Input validation | Already in project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| node-cron | ^6.x | Scheduled viewing reminders | If cron jobs needed |
| @tiptap/pdf | - | PDF templates | Only if complex templates needed |

**Installation:**
```bash
npm install twilio pdfkit node-cron
# For @types:
npm install -D @types/pdfkit @types/node-cron
```

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── services/
│   ├── viewing-service.ts      # NEW - Viewing booking logic
│   ├── offer-service.ts     # NEW - Offer management
│   └── offer-letter-service.ts  # NEW - PDF generation
├── app/api/v1/
│   ├── viewings/
│   │   ├── route.ts       # NEW - CRUD for viewings
│   │   └── [id]/route.ts
│   └── offers/
│       ├── route.ts        # NEW - CRUD for offers
│       └── [id]/route.ts
├── components/
│   └── viewing/           # NEW - UI components
│       ├── ViewingCard.tsx
│       ├── ViewingForm.tsx
│       ├── OfferForm.tsx
│       └── OfferLetter.tsx
```

### Phase 16.01: Viewing Booking System

**Pattern: Public Booking + Admin Management**

1. **Public** - `/api/v1/viewings/book` (POST)
   - Prospect submits: `roomId`, `preferredDateTime`, `name`, `phone`
   - System creates pending viewing
   - Sends WhatsApp confirmation to prospect

2. **Admin** - `/api/v1/viewings` (GET, POST, PUT)
   - CRUD for viewing records
   - Update status: `scheduled`, `completed`, `cancelled`
   - Add notes from viewing

3. **WhatsApp Confirmation Flow**
   - On booking: Send confirmation with room details, date/time
   - On status change: Send update (reminder, reschedule, completed)

**Example - Viewing booking:**
```typescript
// src/services/viewing-service.ts
interface CreateViewingInput {
  roomId: string;
  prospectName: string;
  prospectPhone: string; // E.g., "+60123456789"
  preferredAt: Date;
}

export async function createViewing(input: CreateViewingInput) {
  const viewing = await prisma.viewing.create({
    data: {
      roomId: input.roomId,
      prospectName: input.prospectName,
      prospectPhone: input.prospectPhone,
      scheduledAt: input.preferredAt,
      status: 'scheduled',
    },
    include: { room: { include: { property: true } } },
  });

  // Send WhatsApp confirmation
  await sendViewingConfirmation(viewing);

  return viewing;
}

async function sendViewingConfirmation(viewing: Viewing) {
  const message = `🏠 Viewing Confirmed!\n\n` +
    `Room: ${viewing.room.name}\n` +
    `Property: ${viewing.room.property.address}\n` +
    `Date: ${formatDate(viewing.scheduledAt)}\n` +
    `Time: ${formatTime(viewing.scheduledAt)}\n\n` +
    `Reply CANCEL to reschedule`;

  await whatsappService.sendMessage(
    viewing.prospectPhone,
    message,
    process.env.TWILIO_WHATSAPP_NUMBER!
  );
}
```

### Phase 16.02: Offer System

**Pattern: Prospect Submit → AI Evaluation → Decision**

1. **Offer Submission** - `/api/v1/offers` (POST)
   - Prospect submits: `roomId`, `offerAmount`, `moveInDate`
   - Creates offer record with status `pending`

2. **AI Evaluation** - `/api/v1/offers/[id]/evaluate` (POST)
   - Runs evaluation rules
   - Auto-accepts, auto-rejects, or flags for review

3. **Manual Decision** - `/api/v1/offers/[id]/decide` (POST)
   - Admin approves/rejects
   - Sets `status` to `accepted` or `rejected`

**Evaluation Rules:**
```typescript
interface OfferEvaluationResult {
  decision: 'auto_accept' | 'auto_reject' | 'review';
  reason: string;
  rulesMatched: string[];
}

// Rules to implement:
const evaluationRules = [
  {
    name: 'market_rate_match',
    check: (offer: number, rent: number) => offer >= rent,
    decision: 'auto_accept',
    reason: 'Offer meets or exceeds asking rent',
  },
  {
    name: 'below_market',
    check: (offer: number, rent: number) => offer < rent * 0.9,
    decision: 'auto_reject',
    reason: 'Offer below 90% of asking rent',
  },
  {
    name: 'negotiable',
    check: (offer: number, rent: number) => offer >= rent * 0.9 && offer < rent,
    decision: 'review',
    reason: 'Offer negotiable - requires review',
  },
  {
    name: 'quick_move_in',
    check: (moveIn: Date) => {
      const days = differenceInDays(moveIn, new Date());
      return days <= 7;
    },
    decision: 'auto_accept',
    reason: 'Quick move-in - favorable',
    bonus: true,
  },
];
```

### Phase 16.03: Offer Flow Integration

**Pattern: Accepted Offer → Tenant Creation → Lease**

1. **Accept Offer** - Sets status to `accepted`
2. **Generate Offer Letter** - Creates PDF with offer details
3. **Create Tenant** - Converts prospect to tenant
4. **Create Lease** - Links room to tenant

**Offer Letter Generation:**
```typescript
// src/services/offer-letter-service.ts
import PDFDocument from 'pdfkit';

export async function generateOfferLetter(offer: Offer, room: Room, property: Property) {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(20).text('RENTAL OFFER LETTER', { align: 'center' });
    doc.moveDown();

    // Date
    doc.fontSize(12).text(`Date: ${formatDate(new Date())}`);
    doc.moveDown();

    // Property Details
    doc.fontSize(14).text('Property Details');
    doc.fontSize(12);
    doc.text(`Address: ${property.address}`);
    doc.text(`Room: ${room.name}`);
    doc.text(`Type: ${room.type}`);
    doc.moveDown();

    // Offer Details
    doc.fontSize(14).text('Offer Details');
    doc.fontSize(12);
    doc.text(`Monthly Rent: RM ${(offer.amountSen / 100).toFixed(2)}`);
    doc.text(`Proposed Move-in Date: ${formatDate(offer.moveInDate)}`);
    doc.text(`Security Deposit: RM ${((room.depositSen ?? 0) / 100).toFixed(2)}`);
    doc.moveDown();

    // Terms
    doc.fontSize(14).text('Terms and Conditions');
    doc.fontSize(10);
    doc.text('1. This offer is valid for 48 hours.');
    doc.text('2. Security deposit required within 48 hours of acceptance.');
    doc.text('3. Lease agreement to be signed on move-in date.');
    doc.moveDown(2);

    // Signatures
    doc.text('_________________________      _________________________');
    doc.text('Landlord Signature             Tenant Signature');
    doc.text('Date: _____________        Date: _____________');

    doc.end();
  });
}
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| WhatsApp delivery | Custom HTTP client | Twilio SDK | Official SDK handles auth, formatting, retries |
| PDF generation | HTML + Puppeteer | PDFKit | Faster, no browser process, precise control |
| Date handling | native Date | date-fns | Already in project, consistent API |

---

## Common Pitfalls

### Pitfall 1: Phone Number Format
**What goes wrong:** WhatsApp messages fail due to incorrect format
**Why it happens:** Malaysia numbers vary (+60, 0xx, no prefix)
**How to avoid:** Normalize to E.164 before sending
**Warning signs:** "Invalid phone number" errors

```typescript
// Normalize Malaysia phone numbers
function normalizePhoneNumber(phone: string): string {
  // Remove all except digits and +
  const digits = phone.replace(/[^\d+]/g, '');
  
  // Already has country code
  if (phone.startsWith('+')) {
    return `whatsapp:${phone}`;
  }
  
  // Malaysia: 0xx → +60
  if (digits.startsWith('0')) {
    return `whatsapp:+60${digits.slice(1)}`;
  }
  
  // Raw number
  return `whatsapp:+60${digits}`;
}
```

### Pitfall 2: Offer Letter After Status Change
**What goes wrong:** Letter generated but offer later rejected
**How to avoid:** Generate letter at acceptance time only, store in offer record

### Pitfall 3: Duplicate Viewings Same Slot
**What goes wrong:** Multiple viewings booked for same time slot
**How to avoid:** Check for existing viewings at same time before creating

---

## Code Examples

### Viewing Service (Core Operations)
```typescript
// src/services/viewing-service.ts
import { prisma } from '@/lib/prisma';

interface CreateViewingInput {
  roomId: string;
  prospectName: string;
  prospectPhone: string;
  preferredAt: Date;
}

export async function createViewing(input: CreateViewingInput) {
  // Check room exists and is active
  const room = await prisma.room.findUnique({
    where: { id: input.roomId },
    include: { property: true },
  });

  if (!room || room.status !== 'active') {
    throw new Error('Room not available for viewing');
  }

  const viewing = await prisma.viewing.create({
    data: {
      roomId: input.roomId,
      prospectName: input.prospectName,
      prospectPhone: input.prospectPhone,
      scheduledAt: input.preferredAt,
      status: 'scheduled',
    },
    include: { room: { include: { property: true } } },
  });

  return viewing;
}

export async function completeViewing(id: string, result: 'interested' | 'not_interested', notes?: string) {
  return prisma.viewing.update({
    where: { id },
    data: {
      status: 'completed',
      result,
      notes,
    },
  });
}
```

### Offer Evaluation
```typescript
// src/services/offer-service.ts
interface EvaluationResult {
  decision: 'auto_accept' | 'auto_reject' | 'review';
  reason: string;
}

export async function evaluateOffer(offerId: string): Promise<EvaluationResult> {
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: { room: true },
  });

  if (!offer) {
    throw new Error('Offer not found');
  }

  const rent = offer.room.rentSen;
  const offerAmount = offer.amountSen;
  let decision: EvaluationResult['decision'] = 'review';
  let reason = 'Manual review required';

  // Rule 1: Meets or exceeds asking
  if (offerAmount >= rent) {
    decision = 'auto_accept';
    reason = 'Meets asking price';
  }
  // Rule 2: Below 90% - auto reject
  else if (offerAmount < rent * 0.9) {
    decision = 'auto_reject';
    reason = 'Below acceptable threshold';
  }
  // Rule 3: 90-99% - review
  else if (offerAmount >= rent * 0.9) {
    decision = 'review';
    reason = 'Negotiable range';
  }

  // Update offer with evaluation
  await prisma.offer.update({
    where: { id: offerId },
    data: {
      status: decision === 'auto_accept' ? 'accepted' : 
             decision === 'auto_reject' ? 'rejected' : 'pending',
      evaluatedBy: 'rules_engine',
    },
  });

  return { decision, reason };
}
```

---

## Prisma Schema Extensions

The roadmap specifies these models to add to `prisma/schema.prisma`:

```prisma
model Prospect {
  id          String    @id @default(uuid())
  name        String
  email       String?
  phone       String?
  source      String?   // instagram, facebook, whatsapp, website
  status      String    @default("new") // new, contacted, interested, viewing_scheduled, viewed, offer_made, offer_accepted, tenant
  roomId      String?
  room        Room?     @relation(fields: [roomId], references: [id])
  notes       String?   // JSON array
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Viewing {
  id           String    @id @default(uuid())
  roomId       String
  room         Room      @relation(fields: [roomId], references: [id])
  prospectId   String
  prospect     Prospect  @relation(fields: [prospectId], references: [id])
  scheduledAt DateTime
  status      String    @default("scheduled") // scheduled, completed, cancelled
  result      String?   // interested, not_interested
  notes       String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Offer {
  id           String    @id @default(uuid())
  roomId       String
  room         Room      @relation(fields: [roomId], references: [id])
  prospectId   String
  prospect     Prospect  @relation(fields: [prospectId], references: [id])
  amountSen    Int
  moveInDate   DateTime
  status      String    @default("pending") // pending, accepted, rejected
  evaluatedBy String?   // rules_engine, admin
  letter      Bytes?    // PDF blob
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Twilio SDK | WhatsApp messages | ✗ (not installed) | — | Mock (existing) |
| PDFKit | Offer letters | ✗ (not installed) | — | HTML download |
| date-fns | Date formatting | ✓ | 4.1.0 | — |
| zod | Validation | ✓ | 3.23.0 | — |

**Missing dependencies with fallback:**
- Twilio SDK: Use existing mock (production can add later)
- PDFKit: Can generate HTML offers as fallback

---

## Sources

### Primary (HIGH confidence)
- Twilio Official Docs - WhatsApp message resource API
- PDFKit GitHub - Document generation patterns

### Secondary (MEDIUM confidence)
- Web search verified with Twilio API docs for E.164 formatting
- PDFKit examples for letter generation

### Tertiary (LOW confidence)
- Offer evaluation algorithms - need tuning for production

---

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM - Twilio/PDFKit well-established, versions need verification
- Architecture: HIGH - Existing patterns in project guide implementation
- Pitfalls: MEDIUM - Phone formatting is known issue, others are standard

**Research date:** 2026-04-23
**Valid until:** 60 days (stable patterns)

---

## Notes

### What's Already Available (Phase 12-15)
- Room model: Ready for viewing bookings
- Lease service: Can create tenant from accepted offer
- WhatsApp service: Basic message structure
- date-fns: Already project dependency

### What's New to Build
1. New Prisma models: Prospect, Viewing, Offer
2. Viewing service with booking logic
3. Offer service with evaluation
4. PDF offer letter generation
5. Integration flow: viewing → offer → tenant

### Assumptions
- Phase 15 Prospect model implementation similar to ROADMAP
- WhatsApp credentials configured via environment
- Admin API routes protected by existing auth