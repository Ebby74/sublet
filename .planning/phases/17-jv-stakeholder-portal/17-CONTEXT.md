# Phase 17: JV Stakeholder Portal - Context

**Researched:** 2026-04-23
**Domain:** User authentication, role-based access control, read-only dashboard views
**Confidence:** HIGH

## Summary

Phase 17 (JV Stakeholder Portal) has been **substantially implemented** in prior work. The User model already includes the JV role (`role: 'jv'`) and property scoping (`jvProperties` JSON array). The Property model includes `jvStakeholderId` for direct ownership links. Three read-only API endpoints exist for property lists and financial reports, plus a full dashboard UI at `/jv`.

**Finding:** The phase is functionally complete but may need minor enhancements for better UX (e.g., role info in /auth/me endpoint).

---

## Decisions

### User Model - JV Role Implementation
**Status:** ALREADY IMPLEMENTED

User model in `prisma/schema.prisma`:
```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  name        String?
  password    String
  role        String   @default("user") // admin, moderator, user, jv
  jvProperties String? // JSON array of property IDs assigned to JV user
  // ... relations
}
```

Valid role values: `"admin"`, `"moderator"`, `"user"`, `"jv"`

### Property Scoping for JV
**Status:** ALREADY IMPLEMENTED

Two permission scoping mechanisms:

1. **Assigned properties** — stored in `User.jvProperties` as JSON array:
   ```json
   ["property-id-1", "property-id-2"]
   ```

2. **Stakeholder link** — stored in `Property.jvStakeholderId`:
   ```prisma
   model Property {
     // ...
     jvStakeholderId String? // Link to JV User who has stake in this property
   }
   ```

JV users see properties where EITHER condition is true.

### Read-Only API Endpoints
**Status:** ALREADY IMPLEMENTED

Three read-only JV endpoints exist:

| Endpoint | Purpose | Access Control |
|----------|---------|----------------|
| `GET /api/v1/jv/properties` | List assigned properties | `role === 'jv'` |
| `GET /api/v1/jv/reports/income` | YTD income by property | `role === 'jv'` |
| `GET /api/v1/jv/reports/expenses` | YTD expenses by property | `role === 'jv'` |

All endpoints:
- Return 401 if not authenticated
- Return 403 if authenticated but `role !== 'jv'`
- Support date range query params: `?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- Default to year-to-date if no params

### JV Dashboard UI
**Status:** ALREADY IMPLEMENTED

Dashboard at `/app/jv/page.tsx` includes:

- **Summary cards:** Total Income, Total Expenses, Net Profit (YTD)
- **Property cards:** Name, address, status, room counts, occupancy rate
- **Income by Property table:** Property-wise income breakdown
- **Read-only notice:** Informational banner at bottom

---

## OpenCode's Discretion

### Enhancement Opportunities

1. **Extend /auth/me endpoint** to include role for client-side checks:
   - Add `role` to returned user object
   - Low priority — client can query separately

2. **Add JV summary API endpoint** combining income + expenses:
   - Single API call instead of 3 parallel calls
   - Minor optimization

3. **Date range picker UI** on dashboard:
   - Currently defaults to year-to-date
   - Could add date range selection

**Recommendation:** Current implementation is functional. Skip enhancements unless user requests them.

---

## Deferred Ideas

None — Phase is complete.

---

## Implementation Notes

### Authentication Flow

```
1. Login: POST /api/auth/login { email, password }
   → Returns session_id cookie (base64 { userId, email })

2. Auth Check: GET /api/auth/me
   → Looks up user in database, returns { id, email, name }

3. JV Access: GET /api/v1/jv/*
   → Checks role === 'jv' in database query
```

### Session Pattern

Session cookie stores minimal data (`userId`, `email`) — role is checked against database per request for security.

### Currency Formatting

Uses existing `formatCurrency()` from `@/lib/format` — outputs MYR format (e.g., "RM 1,500.00").

---

## Database Migrations

Existing migration adds JV fields:
- `20260422090509_add_user_role` — adds `role` and `jvProperties`
- `20260422170020_add_jv_stakeholder_fields` — adds `jvStakeholderId` to Property

---

## API Response Format

Consistent envelope:
```json
{
  "data": { ... },
  "meta": { "total": N, "generatedAt": "ISO-8601" },
  "error": null
}
```

---

## Open Questions

### Q1: Should the /auth/me endpoint include role?
**Current:** Returns `{ id, email, name, createdAt }` — no role.

**Recommendation:** Add role for client convenience. Small change if needed.

### Q2: Are there any missing JV features?
**Analysis:** All roadmap items covered:
- ✅ JV role & permissions (User model)
- ✅ Permission scoping by assigned properties (jvProperties, jvStakeholderId)
- ✅ Read-only access controls (API endpoints)
- ✅ Property performance summary (GET /jv/properties)
- ✅ Income/expense overview (GET /jv/reports/*)

No gaps identified.

---

## Sources

### Primary Sources (HIGH confidence)
- `prisma/schema.prisma` — User and Property models with JV fields
- `src/lib/session.ts` — Session cookie pattern
- `src/lib/auth.ts` — Authentication functions
- `src/app/api/v1/jv/*/route.ts` — Three JV API endpoints
- `src/app/jv/page.tsx` — Dashboard UI component

### Secondary Sources (MEDIUM)
- `/planning/milestones/v3.0-ROADMAP.md` — Phase 17 requirements

---

## Metadata

**Research date:** 2026-04-23
**Valid until:** 90 days (schema/API stable)
**Confidence breakdown:**
- Implementation status: HIGH (verified by code inspection)
- Role-based access: HIGH (verified by API route inspection)
- Dashboard UI: HIGH (verified by component inspection)