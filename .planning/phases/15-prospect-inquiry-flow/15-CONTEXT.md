# Phase 15: Prospect Inquiry Flow - Context

**Phase:** 15
**Purpose:** Track and manage prospect inquiries through the rental funnel
**Researched:** 2026-04-23
**Confidence:** MEDIUM-HIGH (based on existing patterns + web research)

---

## Summary

Phase 15 implements prospect management for the AI automation funnel. Building on Phase 12's room listings, this creates a complete lead tracking system from inquiry capture through communication logging. The approach follows established CRM patterns with a property-rental-specific workflow.

**Primary recommendation:** Implement Prospect model as a standalone entity (not merged with Tenant) with a status-based funnel workflow, source attribution, and communication log.

---

## User Constraints

### Locked Decisions (from ROADMAP.md)
- Prospect model with CRUD API (Phase 15.01)
- Inquiry source tracking (instagram, facebook, whatsapp, website)
- Status workflow: new → contacted → interested → viewing_scheduled → viewed → offer_made → offer_accepted → tenant
- Room-linked prospects (references existing Room model)
- Communication log via JSON array

### OpenCode's Discretion
- Exact form fields beyond name/email/phone
- Dashboard UI layout and filtering
- Notification triggers on status changes
- WhatsApp/SMS integration level

### Deferred Ideas (OUT OF SCOPE)
- AI lead scoring (Phase 16.02)
- Viewing booking system (Phase 16.01)
- Offer acceptance logic (Phase 16.02)

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|--------|------------|
| Prisma | existing | ORM | Project standard |
| Next.js API | existing | Route handlers | Project standard |

### Supporting
| Pattern | Use When |
|---------|---------|
| Service layer | CRUD operations (follow tenant-service pattern) |
| Soft delete | Prospect deletion |
| JSON field | Communication log, notes array |

**Installation:** No new packages required

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├��─ services/
│   └── prospect-service.ts       # CRUD + status transitions
├── app/api/v1/prospects/
│   ├── route.ts              # GET list, POST create
│   └── [id]/route.ts       # GET, PUT, DELETE
├── components/
│   └── prospect/
│       ├── prospect-list.tsx    # Dashboard view
│       ├── prospect-card.tsx  # Card/row display
│       └── inquiry-form.tsx  # Public-facing form
└── app/prospects/
    ├── page.tsx             # List dashboard
    └── [id]/page.tsx       # Detail/edit view
```

### Pattern 1: Service Layer (from tenant-service.ts)
```typescript
// Standard CRUD pattern
export async function getProspects(userId: string, includeDeleted = false) {
  return prisma.prospect.findMany({
    where: { userId, deletedAt: includeDeleted ? undefined : null },
    include: { room: { include: { property: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateProspect(id: string, input: UpdateProspectInput) {
  return prisma.prospect.update({ where: { id }, data: input });
}
```

### Pattern 2: Status Workflow
- **new** → **contacted** → **interested** → **viewing_scheduled** → **viewed** → **offer_made** → **offer_accepted** / **tenant**
- Single-direction progression (can't go backward except manual override)
- Status change triggers optional notification

### Pattern 3: Source Attribution
- `source` field: 'instagram', 'facebook', 'whatsapp', 'website', 'referral', 'walk-in'
- UTM parameter capture in inquiry form (utm_source, utm_medium, utm_campaign)
- Stored in JSON data field or dedicated columns

### Pattern 4: Communication Log
```typescript
interface CommLogEntry {
  type: 'note' | 'call' | 'email' | 'whatsapp';
  content: string;
  createdAt: string;
  createdBy: string;
}
// Stored as JSON array in notes field
```

---

## Data Model

### Prospect (Prisma)
```prisma
model Prospect {
  id          String   @id @default(uuid())
  name        String
  email       String?
  phone       String?
  source      String?  // instagram, facebook, whatsapp, website, referral
  utmData    String?  // JSON: { utm_source, utm_medium, utm_campaign }
  status     String   @default("new") // new, contacted, interested, viewing_scheduled, viewed, offer_made, offer_accepted, tenant
  roomId     String?
  room       Room?    @relation(fields: [roomId], references: [id])
  notes      String?  // JSON array of communication log entries
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  deletedAt  DateTime?

  @@index([userId])
  @@index([status])
  @@index([source])
  @@index([createdAt])
}
```

### Relationship: Prospect → Tenant (Future Conversion)
When prospect becomes tenant (status = 'tenant'):
- Create Tenant record from Prospect data
- Link Lease to Tenant
- Keep Prospect record (soft-deleted) with reference to Tenant

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-----------|-----------|-----|
| Source tracking | Custom UTM parser | Standard URLSearchParams | Handles edge cases |
| Status transitions | State machine | Simple string field with validation | Over-engineering for MVP |
| Communication log | Separate table | JSON array in notes | Simplicity, single entity |

**Key insight:** Keep the model simple. Complexity comes from the workflow, not the data structure.

---

## Common Pitfalls

### Pitfall 1: Over-Engineering the Funnel
**What goes wrong:** Building complex state machines, separate tables for each status
**How to avoid:** Single status string with known transitions, JSON log for details

### Pitfall 2: Missing Source Attribution
**What goes wrong:** Losing track of where leads came from
**How to avoid:** UTM capture in inquiry form, required source field, URL parameter passthrough

### Pitfall 3: Prospect-Tenant Merge Confusion
**What goes wrong:** Treating prospects and tenants as the same entity
**How to avoid:** Separate models with conversion workflow (prospect → tenant via offer acceptance)

### Pitfall 4: Form Without Phone (Malaysia Context)
**What goes wrong:** Making email primary contact in Malaysian market
**How to avoid:** Phone required or strongly encouraged; WhatsApp is primary channel

---

## Code Examples

### Inquiry Form (Public-Facing)
```typescript
interface InquiryFormData {
  name: string;
  phone: string;         // Required for Malaysia
  email?: string;
  message?: string;
  roomId: string;
  source: string;        // Hidden field, auto-set
  utmData?: Record<string, string>;
}

export function InquiryForm({ roomId, source }: { roomId: string; source: string }) {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });
  // Phone validation: +60 format
  // Submit to /api/v1/inquiries
  // Success: Show confirmation + add to "We'll contact you" message
}
```

### Prospect Status Update
```typescript
const VALID_TRANSITIONS: Record<string, string[]> = {
  new: ['contacted'],
  contacted: ['interested'],
  interested: ['viewing_scheduled'],
  viewing_scheduled: ['viewed'],
  viewed: ['offer_made'],
  offer_made: ['offer_accepted', 'viewed'], // Can revisit
  offer_accepted: ['tenant'],
};

function canTransition(current: string, next: string): boolean {
  return VALID_TRANSITIONS[current]?.includes(next) ?? false;
}
```

### Prospect Dashboard Filter
```typescript
const STATUS_FILTERS = [
  { value: 'all', label: 'All Prospects' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'interested', label: 'Interested' },
  { value: 'viewing_scheduled', label: 'Viewing Scheduled' },
  { value: 'viewed', label: 'Viewed' },
  { value: 'offer_made', label: 'Offer Made' },
];

// Filter by status
// Sort by createdAt desc (newest first)
// Group by status for Kanban view (optional)
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|-------------|---------------|------------|--------|
| Property-level leads | Room-level prospects | Phase 12 | Granular tracking |
| Manual spreadsheet | CRM-style funnel | Phase 15 | Automation ready |
| Email only | WhatsApp primary | 2025 | Malaysian market fit |

**Deprecated/outdated:**
- Single contact field (email OR phone) - use both

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-----------|-----------|---------|----------|
| Prisma | Data layer | ✓ | existing | — |
| WhatsApp API | Lead notifications | ✓ (Twilio) | existing | SMS fallback |

**Missing dependencies with no fallback:**
- None identified

---

## Open Questions

1. **Public inquiry form URL structure**
   - What we know: `/inquiry/[roomId]` or `/rooms/[roomId]#inquire`
   - What's unclear: Best UX pattern for embedding in marketing posts
   - Recommendation: Use `/api/v1/inquiries` POST endpoint with roomId parameter

2. **WhatsApp integration level**
   - What we know: Twilio WhatsApp already in stack
   - What's unclear: Auto-reply on inquiry? Manual send?
   - Recommendation: Manual trigger initially, auto-reply as Phase 16 enhancement

3. **Lead deduplication**
   - What we know: Phone/email as unique identifiers
   - What's unclear: Merge or create new on duplicate?
   - Recommendation: Check existing phone → update status, don't create duplicate

---

## Validation Architecture

> Skipped: `nyquist_validation` is explicitly `false` in config

---

## Sources

### Primary (HIGH confidence)
- Project codebase: tenant-service.ts, notification-service.ts, room-service.ts
- Prisma schema: existing models

### Secondary (MEDIUM confidence)
- Web search: CRM lead tracking patterns 2026
- NextCRM (open-source Next.js CRM) - pattern reference
- Real-time Lead Routing CRM with Next.js & Supabase (Mehdi, 2026-02)

### Tertiary (LOW confidence)
- Vercel lead processing agent - template reference

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - using existing project patterns
- Architecture: HIGH - follows tenant/property patterns
- Pitfalls: MEDIUM - based on web research, not production validation

**Research date:** 2026-04-23
**Valid until:** 2026-05-23

---

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AI-004 | Inquiry Management | Prospect model, CRUD API, source tracking, status workflow |