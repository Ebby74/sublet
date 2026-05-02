# Phase 3: Financial Core - Context

**Gathered:** 2026-04-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Track payments, generate invoices, provide financial overview with Excel export. Includes comprehensive bills tracking, Malaysian accounting standards export, and WhatsApp payment reminders.

Deliverables:
- Payment recording (income and expenses)
- Bills tracking (TNB, Syabas, Internet, IWK)
- Invoice/receipt generation
- Financial dashboard with charts
- Modular Excel export (LHDN, P&L, Balance Sheet, Cash Book)
- WhatsApp payment reminders

</domain>

<decisions>
## Implementation Decisions

### Payment Recording
- **D-01:** Both lease-linked and standalone payments supported
- **D-02:** Default: linked to lease (auto-populated rent amount)
- **D-03:** Standalone for deposits, manual adjustments, other income/expenses
- **D-04:** Payment types: Rent, Deposit, Late Fee, Water (SYABAS), Electricity (TNB), Internet, IWK, Maintenance, Legal Fees, Agent Commission, Renovation, Insurance, Quit Rent, Assessment, Other
- **D-05:** Deposits tracked separately in trust, never set-off with rent (consistent with Phase 2)

### Bills Tracking
- **D-06:** Bills tracked separately from rent
- **D-07:** Supported bill types:
  - TNB (electricity)
  - SYABAS (water)
  - Internet
  - IWK (sewerage)
  - Other (custom)
- **D-08:** Bills can be assigned to tenants (split) or paid by owner
- **D-09:** Bill status: Pending → Paid / Overdue

### Invoice/Receipt
- **D-10:** HTML receipt for quick view (styled, printable)
- **D-11:** PDF download for official record
- **D-12:** Receipt contains: Tenant name, property, amount (MYR), date, description, reference number
- **D-13:** Receipt auto-generates reference number (format: RCP-YYYYMMDD-XXXX)

### Financial Dashboard
- **D-14:** Combined view: bar chart (income vs expenses by month) + summary cards
- **D-15:** Summary cards: Total Income, Total Expenses, Net Profit, Outstanding Amount
- **D-16:** Outstanding payments section with color-coded alerts
- **D-17:** Inline highlighting of unpaid items in transactions list
- **D-18:** Time period filter: This Month, Last Month, This Year, Custom Range

### WhatsApp Payment Reminders (Escalation Path)
- **D-19:** 3 days before due: Reminder to tenant
- **D-20:** On due date: Reminder to tenant + notification to owner
- **D-21:** 3 days overdue: Final reminder to tenant
- **D-22:** 7 days overdue: Termination/eviction notice to tenant
- **D-23:** WhatsApp integration deferred to Phase 4 (Notifications & Polish)
- **D-24:** Phase 3 includes workflow, UI, and message templates for reminders

### Excel Export (Modular)
- **D-25:** Separate export options for each format
- **D-26:** Export sheets:
  - Summary: Overview of all transactions
  - Per-Tenant: Payment history per tenant
  - Per-Property: Income/expenses grouped by property
  - Bills: TNB, SYABAS, Internet, IWK tracking
  - LHDN: Perbent 2024 format for LHDN reporting
  - P&L: Profit & Loss statement
  - Balance Sheet: Assets and liabilities
  - Cash Book: Cash receipts and payments
- **D-27:** Excel format: MYR currency with 2 decimal places
- **D-28:** Date format: DD/MM/YYYY for Malaysian standard

### Malaysian Accounting Standards
- **D-29:** Follow LHDN Perbent 2024 format for rental income
- **D-30:** Include: Property details, tenant IC, rental income, deposit held
- **D-31:** Balance Sheet includes: Assets (receivables, deposits), Liabilities (deposits held in trust)
- **D-32:** P&L follows Malaysian accounting principles

### Outstanding Payments
- **D-33:** Dedicated "Outstanding" section on dashboard
- **D-34:** Color-coded alerts:
  - Yellow: Due within 3 days
  - Orange: 1-3 days overdue
  - Red: 4+ days overdue
- **D-35:** Inline highlighting in transactions list

### OpenCode's Discretion
The following are left to OpenCode:
- Chart library selection (Recharts, Chart.js, etc.)
- PDF generation approach
- Exact Excel column layout
- Form validation messages
- Empty state design
- WhatsApp API integration details (Phase 4)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Core value, Malaysian market focus
- `.planning/REQUIREMENTS.md` — Phase 3 requirements (FIN-01 through FIN-07)
- `.planning/ROADMAP.md` — Phase 3 goal and success criteria

### Prior Phases
- `.planning/phases/01-foundation-infrastructure/01-CONTEXT.md` — Visual design, MYR utilities
- `.planning/phases/02-property-tenant-management/02-CONTEXT.md` — Lease termination workflow, deposits

### Stack & Conventions
- `.planning/codebase/STACK.md` — Technology stack
- `.planning/codebase/CONVENTIONS.md` — Component patterns
- `.planning/codebase/ARCHITECTURE.md` — File organization

### Database
- `prisma/schema.prisma` — Payment model with all fields

### Existing Services
- `src/services/property-service.ts` — Property data access
- `src/services/tenant-service.ts` — Tenant data access
- `src/services/lease-service.ts` — Lease data access
- `src/lib/format.ts` — MYR currency formatting

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/format.ts` — formatCurrency, formatDate utilities
- `src/components/ui/button.tsx` — Button component
- `src/app/(dashboard)/page.tsx` — Dashboard page needing real data

### Established Patterns
- Progressive forms from Phase 2
- Card-based UI
- Color-coded status badges
- Soft delete pattern

### Integration Points
- New routes: `/payments`, `/payments/new`, `/payments/[id]`
- New routes: `/bills`, `/bills/new`, `/bills/[id]`
- New route: `/reports`
- Dashboard needs income/expense data
- Navigation needs Reports link

</code_context>

<specifics>
## Specific Ideas

- WhatsApp escalation: 3 days before → due date → 3 days overdue → 7 days (termination)
- Modular Excel exports: each accounting format as separate download
- Bills tracking: TNB, SYABAS, Internet, IWK with tenant split option
- Receipt format: styled HTML + downloadable PDF
- LHDN Perbent 2024 compliance for rental income reporting

</specifics>

<deferred>
## Deferred Ideas

### For Phase 4 (Notifications & Polish)
- WhatsApp API integration
- WhatsApp message templates
- In-app notification center
- Cron job for automated reminders

</deferred>

---

*Phase: 03-financial-core*
*Context gathered: 2026-04-09*
