# Phase 04: Notifications & Polish - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-09
**Phase:** 04-notifications-polish
**Areas discussed:** Notification delivery, Notification timing, Mobile refinements, PDF receipt approach, CSV import flow

---

## Notification Delivery

| Option | Description | Selected |
|--------|-------------|----------|
| In-app only | In-app notification bell — simplest MVP | |
| Email (SMTP) | User enters email, gets reminders via SMTP | |
| Both in-app + email | Comprehensive but more work | |
| User's choice: | both in-app and email (if available) and whatsapp | ✓ |

**User's choice:** both in-app and email (if available) and whatsapp
**Notes:** User wants WhatsApp integration in addition to in-app and email

---

## Email Delivery

| Option | Description | Selected |
|--------|-------------|----------|
| App-managed SMTP | Store email in config, send via app-managed SMTP | ✓ |
| User SMTP credentials | User provides their own SMTP credentials | |
| External email service | Use external email service (SendGrid, Resend) | |

**User's choice:** App-managed SMTP
**Notes:** User prefers app-managed SMTP approach

---

## Notification Timing

| Option | Description | Selected |
|--------|-------------|----------|
| Fixed (3/30 days) | Fixed: 3 days before payment due, 30 days before lease expiry | |
| Configurable per type | User configures reminder days per notification type in settings | |

**User's choice:** 3 days before payment due, on 1st of every month, 60 days before lease expiry, 30 days before lease expiry and 7 days before lease expiry except if tenant already indicate they dont want to contine renting upon expiry

**Notes:** Detailed timing rules specified:
- Payment due: 3 days before
- Monthly summary: 1st of every month
- Lease expiry: 60 days, 30 days, and 7 days before
- Exception: Skip 7-day reminder if tenant indicated they won't renew

---

## Mobile Refinements

| Option | Description | Selected |
|--------|-------------|----------|
| Layout & spacing | Focus on layout and spacing for smaller screens | |
| Touch targets | Ensure all touch targets meet 44px minimum | |
| Both | Layout/spacing AND touch targets | ✓ |

**User's choice:** Both

---

## PDF Receipt Approach

| Option | Description | Selected |
|--------|-------------|----------|
| Browser print | Browser print to PDF — no extra dependencies | |
| PDF library (pdfmake) | Use pdfmake library for programmatic PDF | |
| Both methods | Both browser print and library for flexibility | ✓ |

**User's choice:** Both methods

---

## CSV Import Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Preview + confirm | Parse CSV, show preview, let user confirm mappings | |
| Validate first | Parse and validate, show errors, require fix before import | |
| Preview + validate + map | Full preview + validation + field mapping | ✓ |

**User's choice:** Preview + validate + map

---

## OpenCode's Discretion

- SMTP configuration details (host, port, credentials) — OpenCode can determine appropriate defaults for MVP

## Deferred Ideas

None — discussion stayed within phase scope
