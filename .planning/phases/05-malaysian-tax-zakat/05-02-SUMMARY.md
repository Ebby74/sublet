---
phase: 05-malaysian-tax-zakat
plan: 02
subsystem: finance
tags: [reports, profit-loss, islamic-finance, malaysia, compliance]

# Dependency graph
requires:
  - phase: 05-01
    provides: "Zakat calculation utility"
provides:
  - "P&L service with Zakat calculation"
  - "P&L Statement component with Zakat section"
affects: [tax-reports, excel-export]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "P&L calculation from payment data grouped by category"
    - "Zakat calculated on net profit exceeding nisab"

key-files:
  created:
    - src/services/profit-loss-service.ts
    - src/components/reports/profit-loss-statement.tsx
  modified:
    - src/app/reports/page.tsx

key-decisions:
  - "P&L uses lease->property->user relationship for data access"
  - "Zakat shows 'not applicable' when below nisab threshold"

requirements-completed: [TX-01]

# Metrics
duration: 5min
completed: 2026-04-09
---

# Phase 5 Plan 2: P&L with Zakat Summary

**Profit & Loss statement with Zakat perniagaan (2.5%, RM 20k nisab) calculation**

## Performance

- **Duration:** 5 min
- **Completed:** 2026-04-09
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Created `profit-loss-service.ts` with getProfitLoss function
- Created `profit-loss-statement.tsx` component displaying income, expenses, net profit, and Zakat
- Integrated P&L with Zakat into Reports page

## Task Commits

1. **task 1: Create Profit & Loss service with Zakat** - `dba5746` (feat)
2. **task 2: Create P&L Statement component** - `dba5746` (feat)
3. **task 3: Integrate P&L into Reports page** - `dba5746` (feat)

## Files Created/Modified

- `src/services/profit-loss-service.ts` - Annual P&L calculation with Zakat
- `src/components/reports/profit-loss-statement.tsx` - P&L UI with Zakat section
- `src/app/reports/page.tsx` - Added P&L section to Reports page

## Decisions Made

- P&L calculates income and expenses from paid payments in the year
- Categories grouped by payment.category or 'Other' if null
- Zakat only calculated when net profit > 0

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Prisma Payment model lacks userId field directly - resolved by querying via lease->property relationship

## Next Phase Readiness

- P&L data ready for tax calculation (net profit is taxable income)

---
*Phase: 05-malaysian-tax-zakat*
*Completed: 2026-04-09*