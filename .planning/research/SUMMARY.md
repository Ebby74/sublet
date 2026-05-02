# Project Research Summary

**Project:** Sublet Property Management Platform
**Domain:** Property management SaaS for small Malaysian landlords (1-20 units)
**Researched:** April 2026
**Confidence:** HIGH (Stack), MEDIUM-HIGH (Features, Architecture, Pitfalls)

---

## Executive Summary

This is a property management platform for small Malaysian landlords, designed to replace spreadsheets with a clean, modern web application. The product centers on a simple truth: Malaysian landlords expect Excel-like workflows with Malaysian compliance built-in. Success depends on getting three things right from day one: precise MYR currency handling (store as sen, not ringgit), LHDN tax compliance awareness (e-invoice fields in data model even if not implementing API yet), and Excel export that accountants trust (exact formatting, no data loss).

The recommended stack is Next.js 16 with React 19, TypeScript, Prisma with SQLite, Tailwind CSS 4, and shadcn/ui. This combination provides type safety, excellent developer experience, and a component library that matches the minimalist Hostfully-inspired aesthetic. The architecture follows a multi-tenant pattern with shared database and tenant scoping at the data access layer—security-critical and must be enforced consistently.

Key risks: floating-point currency errors will destroy financial trust; LHDN compliance blindness will limit market adoption; inconsistent MYR formatting will confuse users; missing audit trails will fail tax audits. All of these are preventable with correct foundations in Phase 1.

---

## Key Findings

### Recommended Stack

Modern full-stack JavaScript stack with emphasis on type safety and developer experience.

**Core technologies:**
- **Next.js 16.x** — App Router with React Server Components, streaming, Server Actions — ideal for data-heavy dashboards
- **React 19.x** — Ships with Next.js 16; concurrent features, native Form components, use() hook
- **TypeScript 6.x** — Strict mode required; catches currency handling errors at compile time
- **Prisma 7.x** — Type-safe queries, migrations, connection pooling; ORM of choice for type-safe database access
- **SQLite 3.x** — Zero-config, portable; perfect for small landlords; PostgreSQL migration path when needed
- **Tailwind CSS 4.x** — CSS-first configuration; integrates seamlessly with shadcn/ui
- **shadcn/ui** — Copy-paste components (code ownership), Radix primitives, matches minimalist aesthetic
- **xlsx (SheetJS)** — 40M+ weekly downloads; reads/writes XLSX, CSV, ODS with styling support
- **date-fns + Zod** — Tree-shakeable date utilities and TypeScript-first schema validation

**Malaysian-specific implementations:**
- Currency: `Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' })`
- Dates: DD/MM/YYYY display, ISO 8601 storage, dayjs with customParseFormat for parsing
- Financial amounts: Store as integer sen (150000 = RM 1,500.00), never floats

### Expected Features

**Must have (table stakes — missing these = unusable):**
- Property profiles with address, type, rent amount
- Tenant records with contact info, lease dates, payment history
- Payment recording (income/expense) with MYR formatting
- Payment status tracking (paid/unpaid/partial) per month
- Excel/CSV export for tax filing and backups
- Basic dashboard with portfolio overview

**Should have (differentiators for Malaysian market):**
- LHDN expense categorization (loan interest, quit rent, assessment, insurance)
- Net rental income calculation (gross rent - allowable expenses)
- Tax-ready report export (Form BE/B, Schedule E style)
- Stamp duty tracking (STAMPS portal compliance)
- WhatsApp-first notifications (where Malaysian users actually communicate)
- Quick-add payment (one-tap rent recording for speed)

**Defer to v2+:**
- Native iOS/Android apps (build PWA first)
- Multi-currency support (MYR only for initial release)
- Two-way Excel sync (complex, low initial value)
- AI-powered insights (small data, false precision)
- Full double-entry accounting (overkill for 1-10 unit landlords)
- Tenant portal/app (separate codebase consideration)

### Architecture Approach

Multi-tenant SaaS pattern with shared database and tenant scoping at the data access layer. This is security-critical: all database queries MUST be tenant-scoped via middleware header injection.

**Major components:**
1. **middleware.ts** — Extracts tenant from subdomain/header, sets `x-tenant` context, rewrites routes
2. **lib/db/queries.ts** — Enforces tenant scoping; no raw queries outside this layer
3. **app/(tenant)/ layout.tsx** — Tenant branding, auth context, protected routes
4. **lib/exports.ts** — Excel generation with Malaysian formatting (DD/MM/YYYY, RM currency)
5. **components/forms/** — Server Actions with Zod validation, useFormState for mutations

**Component communication:**
```
User Action → Client Component → Server Action → lib/db/queries.ts → Database
                         ↓
                  Direct DB query (Server Components)
                         ↓
                    Render HTML
```

**Key architectural decisions:**
- Server Components for data fetching (direct DB access)
- Client Components for interactive forms (useFormState, useFormStatus)
- Integers for monetary values (amountSen, never float)
- Soft deletes with deletedAt (never hard delete financial records)
- Immutable audit fields (createdBy, updatedBy, createdAt, updatedAt)

### Critical Pitfalls

1. **Floating-point currency calculations** — JavaScript's native `number` type causes precision errors (0.1 + 0.2 = 0.30000000000000004). Prevention: Store as integer sen; use decimal.js for calculations; round only at display layer.

2. **Malaysian tax compliance blindness** — LHDN e-invoice mandatory from 2026 for RM1M+ businesses. Prevention: Include TIN, MSIC code, tax type fields in data model from day one; design e-invoice structure even if not implementing API yet.

3. **Excel export data loss** — Excel truncates long numbers, misinterprets dates by locale. Prevention: Use xlsx with explicit format specification; force column types; validate totals before download; include export metadata sheet.

4. **Inconsistent rounding strategy** — Multiple rounding decisions per transaction cascade into penny differences. Prevention: Define canonical rounding in one place (HALF_UP, 2 decimal places, apply at transaction level); use penny-rounding suspense account.

5. **Missing audit trail** — Financial changes without tracking who/what/when. Prevention: Payments are insert-only (corrections via reversal); automatic createdBy/updatedBy; 7-year retention for LHDN compliance.

6. **Currency display inconsistency** — "RM 1500" in one place, "RM1,500.00" elsewhere. Prevention: Single formatting utility using Intl.NumberFormat('ms-MY'); apply consistently across dashboard, tables, receipts, exports, emails.

---

## Implications for Roadmap

Based on research, the recommended phase structure prioritizes foundation correctness (currency handling, data model, tenant isolation) before feature development, because financial data is unforgiving of architectural mistakes.

### Phase 1: Foundation & Infrastructure

**Rationale:** Everything else depends on correct foundations. Currency handling, tenant isolation, and audit trails cannot be retrofitted without rewriting.

**Delivers:**
- Database schema with Prisma (tenants, properties, people, leases, payments, invoices)
- Multi-tenant middleware and tenant resolution
- Authentication with Auth.js
- Data access layer with enforced tenant scoping
- Currency handling utilities (store as sen, format as MYR, parse user input)
- Date utilities with Malaysian locale support
- LHDN e-invoice data fields in model (TIN, MSIC, tax type) — even if unused

**Addresses:** Pitfalls 1, 2, 4, 6, 7, 9, 11
**Uses:** Next.js 16, Prisma 7, SQLite, TypeScript strict mode

**Must complete before Phase 2:**
- [ ] Integer-based monetary storage (sen, not ringgit)
- [ ] Decimal library integrated for calculations
- [ ] Audit fields on all tables (createdBy, updatedBy)
- [ ] Date formatting utility with DD/MM/YYYY display
- [ ] Intl.NumberFormat('ms-MY') currency formatter

---

### Phase 2: Property & Tenant Management

**Rationale:** Core entities must exist before financial features. Properties and tenants are the nouns that payments describe.

**Delivers:**
- Property CRUD pages (name, address, type, monthly rent)
- Person/Tenant CRUD pages (name, email, phone, IC number)
- Property-Tenant association (assign tenants to properties)
- Lease management (link property + tenant + terms + dates)
- Property state machine (vacant → occupied → maintenance)
- Mobile-optimized layouts (single column, collapsible sidebar)

**Addresses:** FEATURES.md table stakes (property profiles, tenant records, lease tracking)
**Avoids:** Pitfall 10 (property state transitions without validation)

**Architecture:** Server Components for list pages, Client Components for forms

---

### Phase 3: Financial Core

**Rationale:** Payments and invoices are the value proposition. Landlords track money; everything else is context.

**Delivers:**
- Payment recording (amount, date, method, reference)
- Invoice generation from leases
- Payment-Invoice matching
- MYR currency display throughout
- Payment status tracking (paid/unpaid/partial/overdue)
- Dashboard with metrics (total income, outstanding, occupancy)

**Addresses:** FEATURES.md table stakes (income tracking, expense logging, payment status)
**Avoids:** Pitfall 5 (override culture), Pitfall 12 (mobile input optimization)

**Architecture:** Server Actions for mutations, revalidatePath for dashboard updates

---

### Phase 4: Excel Export & Malaysian Compliance

**Rationale:** Tax filing is the primary use case driving spreadsheet-weary landlords to this product. Excel export must be trustworthy.

**Delivers:**
- Payment report export (XLSX with RM formatting, DD/MM/YYYY dates)
- Expense report export
- LHDN expense categorization (pre-categorized: loan interest, quit rent, assessment, insurance)
- Net rental income calculation
- Tax-ready report export (Form BE/B style)
- Stamp duty tracking

**Addresses:** FEATURES.md differentiators (LHDN compliance, tax-ready reports)
**Avoids:** Pitfall 3 (Excel export data loss), Pitfall 8 (import data loss)

**Research flag:** LHDN e-invoice API integration — needs deeper research on MyInvois API requirements before full implementation.

---

### Phase 5: Notifications & Workflow Optimization

**Rationale:** Reduce monthly busywork. Small landlords want to spend minutes, not hours, on property management.

**Delivers:**
- WhatsApp notification integration
- Rent reminder notifications (before due date)
- Overdue alerts (configurable threshold)
- Quick-add payment (minimal form, fast recording)
- Recurring payment templates (auto-populate monthly entries)
- Cash flow timeline (expected vs. received)

**Addresses:** FEATURES.md differentiators (WhatsApp-first notifications, quick-add payment)
**Avoids:** Pitfall 13 (notification fatigue — batch notifications, configurable thresholds)

---

### Phase 6: Polish & Scale

**Rationale:** Performance optimization and advanced features after core loop is validated.

**Delivers:**
- Mobile responsive refinement (test all flows on phone)
- CSV/Excel import wizard (bulk historical data)
- Year-to-date financial summary
- Property ROI calculation
- Payment analytics (late payment trends)
- Performance optimization (ISR for dashboard)

**Defer to v2:** Two-way Excel sync, DuitNow/QR payment integration, tenant portal, native mobile apps.

---

### Phase Ordering Rationale

1. **Foundation first (Phase 1):** Currency handling, tenant isolation, and audit trails are architectural decisions that cannot be retrofitted. Wrong decisions here require complete rebuilds.

2. **Entities before transactions (Phase 2 → 3):** You need properties and tenants to exist before you can track payments. Payments are meaningless without context.

3. **Financial reporting after financial recording (Phase 4 after Phase 3):** Reports need data. Build features that generate data before features that display summaries.

4. **Notifications after data (Phase 5 after Phase 3):** Notifications are reactive — they respond to payment due dates and overdue status. Build the data events first.

5. **Polish after validated core (Phase 6):** Mobile refinement and advanced features should wait until the core loop (property → tenant → payment → export) is proven.

---

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 4 (Excel Export & Compliance):** LHDN e-invoice API integration — MyInvois API documentation needs review; consider `/gsd-research-phase` for e-invoice implementation details.
- **Phase 5 (Notifications):** WhatsApp Business API requirements and Malaysia-specific compliance for automated messages.

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Foundation):** Next.js + Prisma patterns well-documented; multi-tenant SaaS patterns established.
- **Phase 2 (Property Management):** Standard CRUD patterns; state machine pattern well-documented.
- **Phase 3 (Financial Core):** Payment recording patterns standard; currency handling covered in research.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technologies verified via npm registry, official docs; versions current |
| Features | MEDIUM-HIGH | Websearch + Malaysia-specific tax research; MVP phases clear; v2 features less certain |
| Architecture | MEDIUM-HIGH | Multi-tenant patterns well-documented; some Next.js 16 specifics inferred |
| Pitfalls | MEDIUM-HIGH | Malaysian compliance research solid; LHDN e-invoice specifics may evolve |

**Overall confidence:** MEDIUM-HIGH

The stack is well-verified with npm-validated versions. Features and architecture are based on solid domain research with some inference for implementation specifics. Malaysian compliance (LHDN) research is current (March 2026) but e-invoice regulations may evolve.

---

### Gaps to Address

- **LHDN e-invoice API:** Current research identifies data fields needed but not full API integration details. Plan to research MyInvois documentation before Phase 4 implementation.
- **WhatsApp Business API:** Notification integration identified as differentiator but Malaysia-specific compliance for automated messages needs validation.
- **SQLite vs PostgreSQL decision:** Architecture document recommends SQLite for MVP but doesn't address when/how to migrate. Address in Phase 1 planning.
- **Auth provider specifics:** Auth.js chosen but implementation patterns (session management, middleware integration) not deeply researched.

---

## Sources

### Primary (HIGH confidence)

- npm registry — direct version verification for all packages
- nextjs.org/blog — Next.js 16 release notes and App Router documentation
- prisma.io/docs — Prisma 7 documentation and migration guides
- tailwindcss.com — Tailwind CSS v4 CSS-first configuration
- shadcn/ui — Official component documentation and patterns
- JomeInvoice — LHDN e-Invoice Guide (March 2026)
- e-Invoice Specific Guideline v4.6 — Malaysian government compliance (January 2026)

### Secondary (MEDIUM confidence)

- Hemlane, Rent Manager, Landlord Studio — property management feature comparisons
- Accounting.my — Rental income tax guide for Malaysian property owners
- KPMG Malaysia — Service Tax Exemptions for Rental Services
- ExactEstate — "Why Property Management Software Fails" (March 2026)
- Adeptia — Excel data integration challenges
- Next.js Multi-Tenant SaaS Guide — subdomain routing patterns

### Tertiary (LOW confidence)

- Medium/@dilit guide — Next.js 15 + Tailwind v4 setup (needs validation with v16)
- Atomic Spin — Floating point currency handling (2014, still relevant but old)
- Various property management software feature documentation — market context only

---

*Research completed: April 2026*
*Ready for roadmap: yes*
