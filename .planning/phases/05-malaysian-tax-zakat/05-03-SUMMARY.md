---
phase: 05-malaysian-tax-zakat
plan: 03
subsystem: finance
tags: [tax, lhdn, islamic-finance, malaysia, compliance]

# Dependency graph
requires:
  - phase: 05-01
    provides: "Tax calculation utility and Zakat calculation"
provides:
  - "Tax with Zakat offset calculation"
  - "Tax Summary UI component"
affects: [reports, excel-export]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Zakat offset against tax (capped at tax amount)"
    - "Progressive tax calculation with effective rate"

key-files:
  created:
    - src/lib/tax-offset.ts
    - src/components/reports/tax-summary.tsx
  modified:
    - src/app/reports/page.tsx

key-decisions:
  - "Zakat offset limited to lesser of Zakat amount or tax due"
  - "Net tax payable cannot go below 0"

requirements-completed: [TX-02, TX-03]

# Metrics
duration: 3min
completed: 2026-04-09
---

# Phase 5 Plan 3: Tax Calculation with Zakat Offset Summary

**LHDN progressive tax brackets with Zakat perniagaan offset (allowed under Malaysian law)**

## Performance

- **Duration:** 3 min
- **Completed:** 2026-04-09
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Created `tax-offset.ts` utility with calculateTaxWithZakatOffset function
- Created `tax-summary.tsx` component displaying tax calculation with Zakat offset
- Integrated Tax Summary into Reports page

## Task Commits

1. **task 1: Create Tax offset utility** - `dba5746` (feat)
2. **task 2: Create Tax Summary component** - `dba5746` (feat)
3. **task 3: Add Tax Summary to Reports page** - `dba5746` (feat)

## Files Created/Modified

- `src/lib/tax-offset.ts` - Tax calculation with Zakat offset
- `src/components/reports/tax-summary.tsx` - Tax UI with Zakat offset display
- `src/app/reports/page.tsx` - Added Tax section to Reports page

## Decisions Made

- Net profit is taxable income for rental/sublet business
- Zakat offset = min(Zakat amount, grossTax)
- Net tax payable = max(0, grossTax - ZakatOffset)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - straightforward implementation.

## Next Phase Readiness

- Tax calculation ready for settings calculator and Excel export

---
*Phase: 05-malaysian-tax-zakat*
*Completed: 2026-04-09*