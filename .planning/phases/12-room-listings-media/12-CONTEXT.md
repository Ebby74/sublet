# Phase 12: Room Listings & Media — Context

**Phase:** 12  
**Name:** Room Listings & Media  
**v3.0 AI Automation Funnel milestone**  
**Generated:** 2026-04-23  
**Requirement ID:** AI-001  

---

## User Constraints (from v3.0-ROADMAP.md)

### Locked Decisions
- **Room model** must use existing Prisma schema (already implemented)
- **Media storage** uses local filesystem (`public/uploads/`)
- **Status workflow:** draft → active → rented
- **API pattern** follows existing CRUD pattern

### OpenCode's Discretion
- UI component structure (room list view, media gallery)
- Exact form layout for room creation
- Thumbnail generation approach (if any)
- Component organization within existing patterns

### Deferred Ideas
- Cloud storage migration (out of scope for v3.0)
- AI-powered room extraction from photos (Phase 13)

---

## Research Findings

### 1. Existing Implementation Status

**HIGH CONFIDENCE — Verified by Code Inspection**

| Component | Status | Location |
|-----------|--------|----------|
| Room Model (Prisma) | ✅ Done | `prisma/schema.prisma:168-189` |
| Room CRUD API | ✅ Done | `src/app/api/v1/rooms/route.ts` |
| Room Service | ✅ Done | `src/services/room-service.ts` |
| Media Upload API | ✅ Done | `src/app/api/v1/media/route.ts` |
| Property Detail Page | ❌ Missing | `src/app/properties/[id]/page.tsx` (needs rooms section) |
| Room List UI | ❌ Missing | No component exists |
| Room Form UI | ❌ Missing | No component exists |
| Media Gallery UI | ❌ Missing | No component exists |

### 2. Room Model (Prisma Schema)

```prisma
model Room {
  id         String    @id @default(uuid())
  propertyId String
  property   Property  @relation(...)
  name       String    // "Master Bedroom", "Room A"
  type       String    @default("single") // master, single, shared
  beds       Int       @default(1)
  baths      Int       @default(1)
  areaSqft   Int?
  rentSen    Int       // Monthly rent in sen
  depositSen Int?      // Security deposit in sen
  photos    String?    // JSON array of media URLs
  videos    String?    // JSON array of video URLs
  status    String    @default("draft") // draft, active, rented
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?

  @@index([propertyId])
  @@index([status])
  @@index([deletedAt])
}
```

**Status values:** `draft` → `active` → `rented`

### 3. Existing API Patterns

#### Room API (`src/app/api/v1/rooms/route.ts`)
```typescript
// GET /api/v1/rooms?propertyId=xxx
// POST /api/v1/rooms { propertyId, name, type, beds, baths, ... }
```

**Missing:** `PUT` (update room), `DELETE` (soft delete), status change endpoints.

#### Media Upload API (`src/app/api/v1/media/route.ts`)
```typescript
// POST /api/v1/media
// Form data: { file: File, roomId?: string }
// Returns: { success: true, url: "/uploads/xxx.jpg" }

// DELETE /api/v1/media?url=xxx&roomId=xxx&mediaType=photos
```

**Storage:** Local filesystem at `public/uploads/`  
**Limits:** 10MB max, JPEG/PNG/WebP/GIF/MP4/WebM/MOV allowed.

### 4. Room Service Functions (`src/services/room-service.ts`)

| Function | Purpose | Ready |
|----------|---------|-------|
| `createRoom(input)` | Create new room | ✅ |
| `getRoomsByProperty(propertyId)` | List rooms | ✅ |
| `getRoom(id)` | Get single room | ✅ |
| `updateRoom(id, input)` | Update room | ✅ |
| `deleteRoom(id)` | Soft delete | ✅ |
| `getActiveRoomsByProperty(propertyId)` | Active rooms only | ✅ |
| `updateRoomStatus(id, status)` | Change status | ✅ |
| `addMediaToRoom(id, mediaType, url)` | Add media | ✅ |
| `removeMediaFromRoom(id, mediaType, url)` | Remove media | ✅ |

### 5. Dependency: Existing Code to Extend

**Property Detail Page (`src/app/properties/[id]/page.tsx`):**
- Currently shows property info only
- Needs: Room list section, Add Room button
- Uses Server Component pattern (async data fetching)

**Property Card (`src/components/property/property-card.tsx`):**
- Shows property summary
- May need: Room count indicator

### 6. Currency Convention

All monetary values stored in **sen** (1 Ringgit = 100 sen).

```typescript
// Service converts ringgit → sen on input
rentSen: ringgitToSen(input.rentAmount)

// Frontend displays as ringgit
formatCurrency(room.rentSen) // → "RM 800.00"
```

### 7. Missing Endpoints

Based on roadmap requirements:

| Endpoint | Method | Status |
|-----------|--------|--------|
| `/api/v1/rooms/[id]` | GET | ❌ Missing (room exists at path) |
| `/api/v1/rooms/[id]` | PUT | ❌ Missing |
| `/api/v1/rooms/[id]` | DELETE | ❌ Missing (soft delete) |
| `/api/v1/rooms/[id]/status` | PATCH | ❌ Missing |

---

## Phase Subtasks (from ROADMAP.md)

```
├─ Phase 12.01: Room Model & API
│  - Add Room model to Prisma schema          [DONE]
│  - Room CRUD API (list, create, update, delete) [MOSTLY DONE - missing endpoints]
│  - Link rooms to properties                  [DONE]

├─ Phase 12.02: Media Upload System
│  - File upload handler for photos/videos    [DONE]
│  - Media storage (local or cloud)         [DONE - local]
│  - Thumbnail generation                  [NOT STARTED]
│  - Media gallery component                [NOT STARTED]

└─ Phase 12.03: Room Listing Dashboard
   - Room list view in property details    [NOT STARTED]
   - Room status workflow (draft → active → rented) [DONE - logic]
   - Quick actions (activate, deactivate)  [NOT STARTED]
```

---

## What Needs Implementation

### Phase 12.01: API Completions

| Task | File | Changes |
|------|------|----------|
| GET room by ID | `src/app/api/v1/rooms/[id]/route.ts` | Implement GET handler |
| PUT room update | `src/app/api/v1/rooms/[id]/route.ts` | Implement PUT handler |
| DELETE room | `src/app/api/v1/rooms/[id]/route.ts` | Implement DELETE handler |
| PATCH status | New or existing route | Implement status change |

### Phase 12.02: Media Gallery

| Task | File | Changes |
|------|------|----------|
| Image gallery component | `src/components/room/room-media-gallery.tsx` | New component |
| Media upload dropzone | `src/components/room/media-upload.tsx` | New component |
| Thumbnail generation | Optional (defer) | Can use CSS object-fit |

### Phase 12.03: Room Listing Dashboard

| Task | File | Changes |
|------|------|----------|
| Room list section | `src/app/properties/[id]/page.tsx` | Add section |
| Room card component | `src/components/room/room-card.tsx` | New component |
| Room form dialog | `src/components/room/room-form.tsx` | New component |
| Status toggle | `src/components/room/room-status-toggle.tsx` | New component |
| /properties/[id]/rooms page | `src/app/properties/[id]/rooms/page.tsx` | New page |

---

## Code Examples

### Existing API Pattern (from tenants route)
```typescript
// src/app/api/v1/tenants/route.ts
export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const tenants = await getTenants(userId);
  return NextResponse.json({ data: tenants });
}
```

### Existing Service Pattern (from room-service)
```typescript
export async function updateRoomStatus(id: string, status: 'draft' | 'active' | 'rented') {
  return prisma.room.update({
    where: { id },
    data: { status },
  });
}
```

---

## Common Patterns to Follow

| Pattern | Source | Use |
|---------|--------|-----|
| Currency conversion | `src/lib/format.ts` | `ringgitToSen()`, `senToRinggit()` |
| Date formatting | `src/lib/format.ts` | `formatDate()` |
| Auth header | `x-user-id` header | All API routes |
| Soft delete | `deletedAt: Date` | All models |
| JSON media arrays | `JSON.stringify()` | `photos`, `videos` |

---

## Dependencies

### Internal
- **Property model:** Already exists, rooms link to it
- **Property service:** `getProperty()` in use
- **Format utilities:** `ringgitToSen()`, `senToRinggit()`

### External
- **None** — uses existing Prisma + local storage

---

## Open Questions

1. **Thumbnail generation:** Should we implement Sharp-based thumbnails, or use CSS for client-side resizing?
   - Recommendation: CSS `object-fit: cover` + `<img>` srcset for now
   - Defer Sharp to v3.1 if needed

2. **Room form vs dialog:** Should room creation be a full page (`/properties/[id]/rooms/new`) or inline dialog?
   - Recommendation: Dialog for quick add, full page for complex edit

3. **Media gallery layout:** Grid view (like PropertyGuru) or carousel?
   - Recommendation: Grid with lightbox for this phase

---

## Files to Create/Modify

### New Files
```
src/components/room/room-card.tsx
src/components/room/room-form.tsx
src/components/room/room-media-gallery.tsx
src/components/room/media-upload.tsx
src/app/properties/[id]/rooms/page.tsx
src/app/properties/[id]/rooms/new/page.tsx
src/app/properties/[id]/rooms/[roomId]/page.tsx
src/app/properties/[id]/rooms/[roomId]/edit/page.tsx
```

### Modify Files
```
src/app/properties/[id]/page.tsx         (add rooms section)
src/app/api/v1/rooms/[id]/route.ts       (implement endpoints)
```

---

## Verification Checklist

When Phase 12 is complete:
- [ ] Can create a room from property detail page
- [ ] Can upload photos/videos to room
- [ ] Media gallery displays correctly in room view
- [ ] Can activate/deactivate room (status change)
- [ ] Room list shows on property detail page
- [ ] Can edit room details
- [ ] Can soft-delete room
- [ ] All monetary values display as MYR (RM)