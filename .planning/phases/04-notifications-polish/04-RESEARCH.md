# Phase 04: Notifications & Polish - Research

**Researched:** 2026-04-09
**Status:** Ready for planning

---

## Domain Research

### 1. Email/SMTP Notification Patterns

**Library:** nodemailer — the standard for Node.js email sending

**Best Practices:**
- Use environment variables for all credentials (never hardcode)
- Port 465 = secure: true, Port 587 = secure: false
- Always specify a clear `from` address with app label
- Use async/await for cleaner error handling
- Consider email APIs (SendGrid, Mailgun, Amazon SES) for production reliability

**MVP Implementation:**
- Allow users to configure SMTP in settings (host, port, username, password)
- Use nodemailer with configurable transporter
- Send payment reminders and lease expiry notifications via email
- Queue emails asynchronously to avoid blocking requests

**Environment variables needed:**
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

---

### 2. PDF Generation Libraries

**Options Compared:**

| Library | Purpose | React-specific | Server-side | Best for |
|---------|---------|----------------|-------------|----------|
| @react-pdf/renderer | Generate PDFs | Yes | Yes | Invoices, receipts |
| jsPDF | Generate PDFs | No | Yes | Simple exports |
| pdfmake | Generate PDFs | No | Yes | Data-driven docs |
| Browser print | Generate PDFs | N/A | No | Existing approach |

**Current State:** Phase 03-02 uses browser print-to-PDF (per D-07 decision)

**Recommendation for Phase 04:**
- Continue using browser print-to-PDF for receipts (NOTIF-05)
- No additional library needed — meets MVP requirement

---

### 3. CSV Parsing

**Library Comparison:**

| Library | Weekly Downloads | Bundle Size | Best For |
|---------|------------------|-------------|----------|
| papaparse | 700k | 6.8k gzipped | Easy API, browser + Node |
| csv-parser | 400k | 1.5k gzipped | Streaming, memory efficiency |
| csv-parse | 1.4M | 6.3k gzipped | Enterprise features |

**Recommendation:** papaparse
- Easiest API for MVP use case
- Works in both browser and Node.js
- Auto-detects delimiters, supports header rows, dynamic typing
- Sufficient for typical CSV imports (thousands of rows)

**MVP Implementation:**
- Client-side parsing with papaparse
- Preview first N rows before import
- Field mapping UI to map CSV columns to system fields
- Validation with clear error messages

---

### 4. WhatsApp Integration

**Status:** Out of scope for v1 per ROADMAP.md

**Reason:** Email/in-app notifications sufficient for MVP
- WhatsApp Business API requires additional setup
- Can be added in v2 if needed

---

## Technical Approach

### Notifications System

```
┌─────────────────────────────────────────┐
│          Notification Service           │
├─────────────────────────────────────────┤
│ • Payment due checker (daily cron)      │
│ • Lease expiry checker (daily cron)     │
│ • In-app notification store              │
│ • Email sender (nodemailer)             │
└─────────────────────────────────────────┘
```

**Components:**
1. `notification-service.ts` — Core logic for checking due dates
2. `src/app/api/v1/notifications/route.ts` — API for fetching/reading
3. `src/components/ui/notification-bell.tsx` — In-app notification UI

### CSV Import Flow

```
CSV Upload → Parse (papaparse) → Preview → Validate → Import → Report
```

**Components:**
1. `src/components/import/csv-upload.tsx` — File upload component
2. `src/components/import/field-mapper.tsx` — Map columns to fields
3. `src/app/api/v1/import/route.ts` — Handle import logic
4. `src/services/import-service.ts` — CSV parsing and validation

---

## Validation Architecture

**For payment reminders (NOTIF-01):**
- Unit test: Verify notification triggered for payment due in 3 days
- Integration test: Verify email sent with correct template
- Manual test: Receive test email notification

**For lease expiry (NOTIF-02):**
- Unit test: Verify notification triggered at 60/30/7 days before expiry
- Integration test: Verify multiple notifications at correct intervals

**For CSV import (NOTIF-04):**
- Unit test: Parse valid CSV, validate field mapping
- Integration test: Import sample CSV, verify data in database

**For PDF receipts (NOTIF-05):**
- Integration test: Generate receipt, verify PDF contains correct data
- Browser test: Verify print-to-PDF works correctly

---

## Dependencies to Install

```bash
npm install nodemailer papaparse
npm install --save-dev @types/nodemailer @types/papaparse
```

---

## Pitfalls to Avoid

1. **SMTP credentials** — Never hardcode, always use env vars
2. **Email deliverability** — Set up SPF/DKIM records for custom domain
3. **Large CSV files** — Use streaming for files > 10k rows
4. **CSV encoding** — Handle UTF-8, Latin-1, and detect automatically
5. **Notification spam** — Prevent duplicate notifications for same event
6. **Mobile touch targets** — Minimum 44px per D-06

---

## Related Decisions from CONTEXT.md

| Decision | Description |
|----------|-------------|
| D-01 | In-app + Email notifications |
| D-02 | Email via app-managed SMTP |
| D-03 | Payment due: 3 days before |
| D-04 | Monthly summary: 1st of month |
| D-05 | Lease expiry: 60/30/7 days before |
| D-06 | Touch targets: 44px minimum |
| D-07 | Browser print-to-PDF |
| D-08 | Full preview + validation + mapping |

---

*Research complete — ready for planning*
