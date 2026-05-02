---
phase: 10-consolidated-financials
plan: "01"
subsystem: reports
tags: [consolidated-pl, financial-reports, multi-income-source]
dependency_graph:
  requires: []
  provides: [consolidated-pl]
  affects: []
tech_stack:
  added: []
  patterns:
    - Service layer pattern for data aggregation
    - REST API with consistent envelope response
    - Client component with useEffect data fetching
    - Expandable/collapsible section pattern
key_files:
  created:
    - src/services/consolidated-report-service.ts
    - src/app/api/v1/reports/consolidated-pl/route.ts
    - src/components/reports/consolidated-pl-report.tsx
decisions: []
metrics:
  duration: "2m"
  completed: "2026-04-15"
---

# Phase 10 Plan 01: Consolidated P&L Report Summary

**One-liner:** Combined P&L combining all income sources with expandable sections and prior period comparison

## Completed Tasks

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Create consolidated report service | 9c0ae4f9 | consolidated-report-service.ts |
| 2 | Create consolidated P&L API route | 43efecc5 | consolidated-pl/route.ts |
| 3 | Create consolidated P&L component | 2218b329 | consolidated-pl-report.tsx |

## What Was Built

### Consolidated Report Service (`src/services/consolidated-report-service.ts`)
- `getConsolidatedPL(userId, dateRange?)` function
- Aggregates profit data from all income sources (Sublet, Autoren Sell, Autoren Rent)
- Returns current period totals (revenue, expenses, profit, margin, bySource breakdown)
- Calculates prior period with automatic range detection
- Returns change percentages for revenue, expenses, and profit

### Consolidated P&L API Route (`src/app/api/v1/reports/consolidated-pl/route.ts`)
- GET endpoint accepting userId (header or query) and optional startDate/endDate
- Returns consistent envelope: `{ data, meta: { period, generatedAt }, error }`
- Uses x-user-id header for auth following existing patterns
- Returns 400 if userId missing

### Consolidated P&L Component (`src/components/reports/consolidated-pl-report.tsx`)
- `ConsolidatedPLReport({ userId? })` client component
- **Two expandable sections** per D-01:
  - Income Summary (collapsible by source)
  - Expense Summary (collapsible by source)
- **Net Profit** displayed prominently at bottom with margin %
- **Period presets** per D-03: This Month, Last Month, This Quarter, Last Quarter, This Year, Last Year
- **Custom date range** picker with clear button
- **Compare to Prior Period** toggle showing YoY/QoQ change
- **Summary cards**: Total Revenue, Total Expenses, Net Profit with change indicators
- Uses `formatCurrency` for MYR display
- Uses `INCOME_SOURCES` colors for source badges
- Loading skeleton and empty state

## Verification

- [x] Service exports `getConsolidatedPL` function (verified via grep)
- [x] API route created at `src/app/api/v1/reports/consolidated-pl/route.ts` (verified via ls)
- [x] Component exports `ConsolidatedPLReport` (verified via grep)
- [x] All 3 tasks committed individually

## Deviations from Plan

None — plan executed exactly as written.

## Auth Gates

None.

## Deferred Issues

None.

---

*Plan: 10-01*
*Executed: 2026-04-15*
