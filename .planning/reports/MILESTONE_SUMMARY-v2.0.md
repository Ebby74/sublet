# Milestone v2.0 — Project Summary

**Generated:** 2026-04-15
**Purpose:** Team onboarding and project review

---

## 1. Project Overview

**What This Is:** An AI-powered co-living room rental platform for AMR Home Solutions, a Malaysian property business.

**Core Value:** Fully automated rental business with minimal manual effort — from listing to acceptance.

**Business Model:** AMR Home Solutions runs a co-living room rental business:
- Sublet properties → fully furnish → rent individual rooms to tenants
- Use 100% AI automation from listing creation to offer acceptance
- Revenue: Rental income from furnished rooms

**Target Users:** Malaysian landlords and co-living operators who want automated rental management.

**Note on Entity Type:** AMR Home Solutions is a **sole proprietorship (enterprise)**, NOT a company (Sdn Bhd). This means:
- No share capital (no Form 9 needed)
- Owner reports business income via Form B personal income tax
- Unlimited personal liability

---

## 2. Architecture & Technical Decisions

| Decision | Why | Phase |
|----------|-----|-------|
| **MYR with sen integer storage** | Avoids floating-point precision issues in financial calculations | Phase 1 |
| **Prisma 7 + SQLite** | Simple deployment, type-safe queries, easy migrations | Phase 1 |
| **Next.js 16 App Router** | Modern React framework with server components | Phase 1 |
| **Tailwind CSS 4 + shadcn/ui** | Rapid UI development, consistent design system | Phase 1 |
| **Financial report exports for tax/loan** | Supports Form B tax filing and loan documentation | Phase 11 |
| **Income source on payments** | Flexible allocation per transaction for accurate cost tracking | Phase 8 |
| **Consolidated P&L structure** | Clear company-wide view combining all 3 income streams | Phase 10 |

**Tech Stack:**
- Frontend: Next.js 16, React, TypeScript, Tailwind CSS 4, shadcn/ui, Recharts
- Backend: Next.js API routes
- Database: Prisma 7 ORM, SQLite
- Auth: bcrypt hashing, session cookies, Next.js middleware
- Email: Nodemailer with SMTP transport
- Excel: ExcelJS library

---

## 3. Phases Delivered

| Phase | Name | Status | One-Liner |
|-------|------|--------|-----------|
| 01 | Foundation & Infrastructure | Complete | Next.js scaffold, Prisma ORM, MYR currency utilities, auth |
| 02 | Property & Tenant Management | Complete | Property CRUD, tenant management, lease wizard |
| 03 | Financial Core | Complete | Payment system, receipts, financial dashboard |
| 04 | Notifications & Polish | Complete | In-app/email notifications, CSV import |
| 05 | Malaysian Tax & Zakat | Complete | LHDN tax brackets, Zakat perniagaan, P&L with calculations |
| 06 | Auto Marketing & Posting | Complete | Social media (IG/FB), WhatsApp, website feeds |
| 07 | Business Breakdown | Complete | Dashboard with YTD, property performance, cash flow |
| 08 | Expense Allocation | Complete | Income source tagging for expenses |
| 09 | Per-Source Profit Reports | Complete | Profit-by-source reports with charts |
| 10 | Consolidated Financials | Complete | Consolidated P&L, Balance Sheet, company financials |
| 11 | SSM Export Templates | Complete | SSM Form 9 & 44 Excel exports with validation |

---

## 4. Requirements Coverage

All v2.0 requirements have been validated:

### Multi-Income-Source Accounting (v2.0)
- [x] Dashboard with YTD summary, property performance, occupancy trends, cash flow forecast
- [x] Excel export for business summary reports
- [x] Income source field in database schema
- [x] Income source dropdown with smart categorization
- [x] Income source filter in payments list and allocation report
- [x] Expense allocation section in Business Summary
- [x] Profit-by-source report service with date filtering
- [x] Profit-by-source report component with charts
- [x] Sidebar navigation with profit report dropdown
- [x] Consolidated P&L combining all income sources
- [x] Balance Sheet with assets, liabilities, equity
- [x] Dashboard summary widgets and consolidated report page
- [x] Financial report exports for tax filing and loan documentation

---

## 5. Key Decisions Log

| ID | Decision | Rationale | Phase |
|----|----------|-----------|-------|
| D-01 | Next.js App Router | Modern SSR with API routes in same codebase | Phase 1 |
| D-02 | Sen integer for MYR | 1 RM = 100 sen, avoids floating-point errors | Phase 1 |
| D-03 | Soft deletes (deletedAt) | Audit trail, recoverable data | Phase 1 |
| D-04 | Separate "Export for SSM" button | Clear UX for Malaysian compliance tasks | Phase 11 |
| D-05 | Income source on payments | Per-transaction allocation flexibility | Phase 8 |
| D-06 | Smart categorization suggestions | Auto-suggest Sublet/Autoren based on expense category | Phase 8 |

---

## 6. Tech Debt & Deferred Items

### Deferred to Future Milestones (v3)
- Payment gateway integration
- Multi-user access
- Microsoft Graph API sync
- Power Automate workflows

### Deferred to v2.x
- Property photo upload for marketing
- iProperty/PropertyGuru integration

### Technical Notes
- Pre-existing type errors in `profit-report-service.ts` (unrelated to v2.0)
- Single-user mode (multi-user designed for future)

---

## 7. Getting Started

**Run the project:**
```bash
npm install
npm run db:migrate
npm run db:seed    # Optional: seed demo data
npm run dev        # Start development server
```

**Key directories:**
- `src/app/` — Next.js pages and API routes
- `src/components/` — React components
- `src/services/` — Business logic (payment, export, reports)
- `src/lib/` — Utilities, Prisma client
- `prisma/` — Database schema and migrations

**Tests:**
```bash
npm test              # Run all tests
npm run typecheck     # TypeScript validation
npm run lint          # ESLint checks
```

**Where to look first:**
- `src/app/page.tsx` — Main dashboard
- `src/services/payment-service.ts` — Core payment logic
- `src/services/export-service.ts` — SSM export functions

---

## Stats

- **Timeline:** 2026-04-05 → 2026-04-15 (10 days)
- **Phases:** 11 / 11 complete
- **Commits:** 162 (across all milestones)
- **Files changed:** 42,122 (+5,929,682 / - deletions)
- **Contributors:** Single developer (git history)

---

**Full milestone history:** `.planning/MILESTONES.md`
**Archived roadmap:** `.planning/milestones/v2.0-ROADMAP.md`
**Current project state:** `.planning/PROJECT.md`
