# Phase 3: Financial Core - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-09
**Phase:** 03-financial-core
**Areas discussed:** Payment recording flow, Bills tracking, Invoice/receipt format, Financial dashboard, Excel export, WhatsApp reminders, Payment categories, Deposits, Outstanding display, Export sheets, WhatsApp escalation

---

## Payment Recording

| Option | Description | Selected |
|--------|-------------|----------|
| Both | Lease-linked + standalone payments | ✓ |
| Lease-linked only | All payments must be linked to lease | |
| Standalone only | Manual entry for everything | |

**User's choice:** Both
**Notes:** Default to lease-linked (auto-populated), standalone for deposits and adjustments

---

## Bills Tracking

| Option | Description | Selected |
|--------|-------------|----------|
| Common Malaysian bills | TNB, SYABAS, Internet, IWK + Other | ✓ |
| Essential only | TNB and SYABAS only | |
| All utilities | All above + ASTRO, Netflix, etc. | |

**User's choice:** Common Malaysian bills
**Notes:** TNB, SYABAS, Internet, IWK with custom "Other" option

---

## Invoice/Receipt Format

| Option | Description | Selected |
|--------|-------------|----------|
| Both | HTML view + PDF download | ✓ |
| PDF only | Professional but slower | |
| HTML printable only | Fast, no PDF dependency | |

**User's choice:** Both
**Notes:** HTML for quick view, PDF for official record

---

## Financial Dashboard

| Option | Description | Selected |
|--------|-------------|----------|
| Combined view | Bar chart + summary cards + outstanding list | ✓ |
| Income focus | Rent collection tracking | |
| Expense focus | Bills tracking, profit calculation | |

**User's choice:** Combined view
**Notes:** Bar chart for monthly comparison, summary cards for key metrics

---

## Excel Export Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Per-tenant view | Payment history per tenant | |
| Per-property view | Income/expenses by property | |
| Combined statement | Full financial overview | |
| All views | Per-tenant + per-property + combined | ✓ |

**User's choice:** All views
**Notes:** Need comprehensive view across all dimensions

---

## Malaysian Accounting Format

| Option | Description | Selected |
|--------|-------------|----------|
| LHDN format | Perbent 2024 for LHDN reporting | |
| P&L Statement | Profit & Loss format | |
| Cash book | Cash receipts/payments | |
| Balance Sheet | Assets and liabilities | |
| All formats | LHDN + P&L + Cash Book + Balance Sheet | ✓ |

**User's choice:** All accounting formats
**Notes:** Comprehensive Malaysian accounting standards

---

## WhatsApp Payment Reminders

| Option | Description | Selected |
|--------|-------------|----------|
| 3 days before due | Reminder 3 days before | |
| On due date | Reminder on due date | |
| Both | 3 days before AND on due date | ✓ |
| Escalation | Both + 3 days overdue + 7 days | ✓ |

**User's choice:** Both with escalation path
**Notes:** 
- 3 days before due: Reminder to tenant
- On due date: Reminder to tenant + owner notified
- 3 days overdue: Final reminder
- 7 days overdue: Termination/eviction notice

---

## Payment Categories

| Option | Description | Selected |
|--------|-------------|----------|
| Standard + Bills | Rent, Deposit, Late Fee, utilities | |
| Minimal | Rent, Deposit, Other | |
| Comprehensive | All above + Legal, Agent, Renovation, Insurance, Quit Rent, Assessment | ✓ |

**User's choice:** Comprehensive
**Notes:** Full category list for Malaysian landlords

---

## Deposit Handling

| Option | Description | Selected |
|--------|-------------|----------|
| Tracked separately | Deposit in trust, returned at end | ✓ |
| Set-off allowed | Deposit can set-off with final rent | |
| Both options | Let owner choose per lease | |

**User's choice:** Tracked separately
**Notes:** Consistent with Phase 2 - deposits never set-off with rent

---

## Outstanding Payments Display

| Option | Description | Selected |
|--------|-------------|----------|
| Dashboard highlight | Dedicated section on dashboard | |
| Inline with list | Highlight in transactions list | |
| Both | Dashboard section AND inline highlighting | ✓ |

**User's choice:** Both
**Notes:** Maximum visibility for outstanding payments

---

## Excel Export Sheets (Modular)

| Option | Description | Selected |
|--------|-------------|----------|
| Comprehensive | All sheets in one workbook | |
| Standard | Summary + Per-Tenant + Per-Property | |
| Modular | Each format as separate export | ✓ |

**User's choice:** Modular
**Notes:** Separate download options for each accounting format

---

## WhatsApp Message Recipients

| Option | Description | Selected |
|--------|-------------|----------|
| Both | Tenant receives reminders, owner receives copies | ✓ |
| Tenant only | Only tenant receives reminders | |
| Owner notified | Owner receives all notifications | |

**User's choice:** Both
**Notes:** Tenant receives reminders, owner receives copies + escalation alerts

---

## OpenCode's Discretion

Areas where user deferred to OpenCode:
- Chart library selection
- PDF generation approach
- Exact Excel column layout
- Form validation messages
- Empty state design
- WhatsApp API integration details (Phase 4)

---

## Deferred Ideas

**For Phase 4 (Notifications & Polish):**
- WhatsApp API integration
- WhatsApp message templates
- In-app notification center
- Cron job for automated reminders
