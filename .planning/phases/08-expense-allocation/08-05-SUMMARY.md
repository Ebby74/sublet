---
phase: 08
plan: 05
subsystem: exports
tags: [excel, expenses, income-source]
key-files:
  created: []
  modified:
    - src/services/export-service.ts
    - src/app/api/v1/export/route.ts
decisions:
  - D-25: Separate export options for each format
  - D-27: MYR currency format: "RM 1,500.00"
  - D-28: Date format: DD/MM/YYYY
  - D-29: Follow LHDN Perbent 2024 format
metrics:
  duration: ~5 minutes
  tasks: 1/1
  files: 2 modified
---

# Phase 08 Plan 05: Add Income Source Filtering to Excel Exports

## Summary

Added income source filtering to Excel exports for expenses, enabling users to track which income source each expense is allocated against.

## Changes Made

### 1. Updated `src/services/export-service.ts`

- Added `exportExpenses()` function - exports all expenses with an "Income Source" column showing which income source each expense is allocated to
- Added `exportExpenseAllocation()` function - creates a two-sheet workbook:
  - "By Income Source" sheet: shows total expenses per income source with count and percentage
  - "All Expenses" sheet: detailed list of all expenses with income source
- Updated `ExportFormat` type to include `'expenses'` and `'expense-allocation'`
- Imported `getPayments` and `INCOME_SOURCES` from payment-service

### 2. Updated `src/app/api/v1/export/route.ts`

- Added imports for `exportExpenses` and `exportExpenseAllocation`
- Added `'expenses'` and `'expense-allocation'` to `SUPPORTED_FORMATS` array
- Added case handlers for both new export formats in the switch statement

## Implementation Notes

- Reuses existing `INCOME_SOURCES` constant from payment-service
- Currency formatting: 2 decimal places (RM format)
- Percentage column shows proportion of total expenses per income source
- Income sources without allocations show as "Unallocated"

## Verification

- Export API now accepts `format=expenses` query parameter
- Export API now accepts `format=expense-allocation` query parameter
- Both exports include income source information derived from payment records

---

**Plan:** 08-05
**Tasks:** 1/1
**Commit:** a85c279d