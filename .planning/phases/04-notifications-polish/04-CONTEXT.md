# Phase 04: Notifications & Polish - Context

**Gathered:** 2026-04-09
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers: notifications (payment due, lease expiry), mobile refinements, CSV import, and PDF receipts.

</domain>

<decisions>
## Implementation Decisions

### Notification Delivery
- **D-01:** In-app + Email + WhatsApp notifications
- **D-02:** Email via app-managed SMTP (configured in settings)

### Notification Timing
- **D-03:** Payment due: 3 days before due date
- **D-04:** Monthly summary: 1st of every month
- **D-05:** Lease expiry: 60 days, 30 days, and 7 days before (unless tenant indicated they won't renew)

### Mobile Refinements
- **D-06:** Both layout/spacing AND touch target refinements (44px minimum)

### PDF Receipts
- **D-07:** Both browser print-to-PDF AND PDF library (pdfmake) for generation

### CSV Import
- **D-08:** Full preview + validation + field mapping workflow

### OpenCode's Discretion
- Specific SMTP configuration details (host, port, credentials) — OpenCode can determine appropriate defaults for MVP

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Project vision and requirements
- `.planning/REQUIREMENTS.md` — Requirement IDs (NOTIF-01 through NOTIF-05)
- `.planning/ROADMAP.md` — Phase 4 goals and success criteria

### Codebase Patterns
- `src/components/payment/receipt-view.tsx` — Existing receipt HTML (reference for PDF)
- `src/components/layout/header.tsx` — Where notification bell would integrate
- `src/components/layout/mobile-menu.tsx` — Existing mobile navigation

### No external specs — requirements fully captured in decisions above

</canonical_refs>

<codebase_context>
## Existing Code Insights

### Reusable Assets
- receipt-view.tsx: Can be reused/adapted for PDF generation
- header.tsx: Has notification bell placeholder
- mobile-menu.tsx: Existing mobile navigation

### Established Patterns
- CSS modules for styling (follows existing pattern)
- API routes in src/app/api/v1/* for backend endpoints
- Service layer pattern (payment-service.ts, export-service.ts)

### Integration Points
- Header component for notification bell
- Payments table for due date checks
- Lease management for expiry tracking
- Export service can be extended for CSV import

</codebase_context>

<specifics>
## Specific Ideas

- Notification bell icon in header (NOTIF-01)
- Mobile hamburger menu already exists (NOTIF-03)
- Import preview before confirmation (NOTIF-04)
- Receipt PDF with property/tenant/payment details (NOTIF-05)

</specifics>

<deferred>
## Deferred Ideas

### Reviewed Todos (not folded)
None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-notifications-polish*
*Context gathered: 2026-04-09*
