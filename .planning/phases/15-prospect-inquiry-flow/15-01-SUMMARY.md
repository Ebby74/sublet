---
phase: 15-prospect-inquiry-flow
plan: 01
status: complete
completed: 2026-04-23
wave: 1
---

## Plan 15-01: Prospect Model & CRUD API

**Status:** Complete ✓

### What was built

- **Prospect model** in Prisma schema with fields: name, email, phone, source, utmData, status, roomId, notes, userId, soft-delete (deletedAt)
- **prospect-service.ts** with CRUD: createProspect, getProspects, getProspect, updateProspect, deleteProspect
- **API routes**: GET/POST `/api/v1/prospects`, GET/PUT/DELETE `/api/v1/prospects/[id]`

### Key decisions

- Used soft-delete pattern (deletedAt) consistent with other models
- Status workflow: new → contacted → interested → viewing_scheduled → viewed → offer_made → offer_accepted → tenant
- UTM data stored as JSON string for flexibility

### Artifacts created

| File | Status |
|------|--------|
| prisma/schema.prisma | ✓ Modified |
| src/services/prospect-service.ts | ✓ Created |
| src/app/api/v1/prospects/route.ts | ✓ Created |
| src/app/api/v1/prospects/[id]/route.ts | ✓ Created |
