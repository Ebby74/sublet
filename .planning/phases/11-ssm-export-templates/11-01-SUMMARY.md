---
phase: 11-ssm-export-templates
plan: 01
subsystem: export-service
tags: [ssm, export, excel, compliance]
dependency_graph:
  requires: []
  provides: [exportSSMForm9, exportSSMForm44]
  affects: [api/v1/export]
tech_stack:
  added: [SSM Form 9, SSM Form 44]
  patterns: [multi-sheet Excel workbook, SSM compliance]
key_files:
  created: []
  modified:
    - src/services/export-service.ts
    - src/app/api/v1/export/route.ts
decisions:
  - D-01: Both Form 9 and Form 44 supported for SSM submission
  - D-02: Multi-sheet workbooks matching SSM form sections
  - D-03: Full company info and director signatures included
---

# Phase 11 Plan 01: SSM Export Templates Summary

**One-liner:** SSM Form 9 and Form 44 Excel export templates for Companies Commission of Malaysia submission.

## Objective

Add SSM export service functions for Form 9 (Return of Allotment of Shares) and Form 44 (Statement of Affairs), plus API routes to serve them.

## Tasks Completed

| task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | Add SSM export types and interfaces | 2886935c | src/services/export-service.ts |
| 2 | Implement exportSSMForm9 function | 2886935c | src/services/export-service.ts |
| 3 | Implement exportSSMForm44 function | 2886935c | src/services/export-service.ts |
| 4 | Add API endpoints for SSM exports | 2886935c | src/app/api/v1/export/route.ts |

## What Was Built

### exportSSMForm9
- **Function signature:** `export async function exportSSMForm9(userId: string): Promise<XLSX.WorkBook>`
- **Sheets:**
  1. Cover — Title page with company name, registration number, date
  2. Allotment Summary — Overview of share allotments (total count, amounts)
  3. Share Allotments — Detailed table with date, shares, class, value, allottee

### exportSSMForm44  
- **Function signature:** `export async function exportSSMForm44(userId: string): Promise<XLSX.WorkBook>`
- **Sheets:**
  1. Cover — Title page with company info and Section 167 reference
  2. Profit & Loss — Revenue, expenses, net profit
  3. Balance Sheet — Assets, liabilities, net worth with verification
  4. Notes — Accounting policies and director signatures

### API Endpoints
- `GET /api/v1/export?format=ssm-form9` — Downloads Form 9 Excel file
- `GET /api/v1/export?format=ssm-form44` — Downloads Form 44 Excel file

## Deviations from Plan

**None** — plan executed exactly as written.

## Auth Gates

**None** — no authentication gates encountered.

## Stub Tracking

**None** — all functionality is wired to real data sources.

---

## Self-Check

- [x] exportSSMForm9 function exists at line 1210
- [x] exportSSMForm44 function exists at line 1326
- [x] ExportFormat type includes ssm-form9 and ssm-form44
- [x] API route handles both formats

## Self-Check: PASSED